import { NextResponse } from "next/server"
import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] })

const MAX_SYMBOLS = 100
const CACHE_SECONDS = 300 // 5 minutes — data changes slowly intraday

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YFRow = any

/**
 * Find the closing price closest to N calendar days ago.
 * Allows up to 5 days of tolerance for weekends / holidays.
 */
function findPriceNDaysAgo(rows: YFRow[], nDays: number): number | null {
  const target = Date.now() - nDays * 86_400_000

  let best: YFRow | null = null
  let bestDiff = Infinity

  for (const row of rows) {
    const t = (row.date instanceof Date ? row.date : new Date(row.date)).getTime()
    const diff = target - t
    // Closest trading day on or before the target
    if (diff >= 0 && diff < bestDiff) {
      bestDiff = diff
      best = row
    }
  }

  if (best && bestDiff <= 5 * 86_400_000) {
    const price = best.adjClose != null && best.adjClose > 0 ? best.adjClose : best.close
    return typeof price === "number" && Number.isFinite(price) ? price : null
  }
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")

  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 })
  }

  const symbolList = symbols
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0 && /^[A-Z0-9.]{1,10}$/.test(s))
    .slice(0, MAX_SYMBOLS)

  if (symbolList.length === 0) {
    return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performance: Record<string, any> = {}

  try {
    // ---------- 1. Batch quote (1D change, PE, 52W, mkt cap, div yield) ----------
    const quoteResults = await yahooFinance.quote(symbolList, {}, { validateResult: false })
    const quotesArray = Array.isArray(quoteResults) ? quoteResults : [quoteResults]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quoteMap: Record<string, any> = {}
    for (const q of quotesArray) {
      if (q?.symbol) quoteMap[q.symbol.toUpperCase()] = q
    }

    // ---------- 2. Daily historical for the last ~35 calendar days ----------
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 35)

    const histResults = await Promise.allSettled(
      symbolList.map(async (sym) => {
        const rows = await yahooFinance.historical(sym, {
          period1: startDate,
          interval: "1d",
        })
        return { sym, rows }
      }),
    )

    const histMap: Record<string, YFRow[]> = {}
    for (const r of histResults) {
      if (r.status === "fulfilled") histMap[r.value.sym] = r.value.rows
    }

    // ---------- 3. Combine into per-symbol performance entries ----------
    for (const sym of symbolList) {
      const q = quoteMap[sym]
      const hist = histMap[sym] ?? []
      if (!q?.regularMarketPrice) continue

      const price: number = q.regularMarketPrice
      const price7D = findPriceNDaysAgo(hist, 7)
      const price1M = findPriceNDaysAgo(hist, 21)

      // 52-week position (0-100)
      let fiftyTwoWeekPosition: number | null = null
      if (
        typeof q.fiftyTwoWeekHigh === "number" &&
        typeof q.fiftyTwoWeekLow === "number" &&
        q.fiftyTwoWeekHigh > q.fiftyTwoWeekLow
      ) {
        fiftyTwoWeekPosition =
          ((price - q.fiftyTwoWeekLow) / (q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow)) * 100
      }

      performance[sym] = {
        symbol: sym,
        price,

        // 1-day (straight from quote)
        change1D: q.regularMarketChange ?? 0,
        changePercent1D: q.regularMarketChangePercent ?? 0,

        // 7-day (computed)
        change7D: price7D !== null ? price - price7D : null,
        changePercent7D: price7D !== null ? ((price - price7D) / price7D) * 100 : null,

        // ~1-month / 21 calendar days (computed)
        change1M: price1M !== null ? price - price1M : null,
        changePercent1M: price1M !== null ? ((price - price1M) / price1M) * 100 : null,

        // Fundamentals
        trailingPE: typeof q.trailingPE === "number" ? q.trailingPE : null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
        fiftyTwoWeekPosition,
        marketCap: typeof q.marketCap === "number" ? q.marketCap : null,
        dividendYield:
          typeof q.trailingAnnualDividendYield === "number"
            ? q.trailingAnnualDividendYield * 100
            : null,
      }
    }
  } catch (error) {
    console.error("Performance data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
  }

  return NextResponse.json(
    { performance, lastUpdated: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
      },
    },
  )
}
