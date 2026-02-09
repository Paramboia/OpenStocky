import { NextResponse } from "next/server"
import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] })

// Historical data barely changes — cache aggressively
const CACHE_SECONDS = 3600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")
  const months = Math.min(parseInt(searchParams.get("months") || "25", 10), 120)

  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 })
  }

  const symbolList = symbols
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0 && /^[A-Z0-9.]{1,10}$/.test(s))

  if (symbolList.length === 0) {
    return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 })
  }

  // Go back N+1 months to ensure full coverage
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months - 1)
  startDate.setDate(1) // First of the month for clean boundaries

  const historicalPrices: Record<string, Record<string, number>> = {}

  // Fetch all symbols in parallel
  const results = await Promise.allSettled(
    symbolList.map(async (symbol) => {
      try {
        const data = await yahooFinance.historical(symbol, {
          period1: startDate,
          interval: "1mo",
        })

        const monthlyPrices: Record<string, number> = {}
        for (const row of data) {
          const date = row.date instanceof Date ? row.date : new Date(row.date)
          // Use UTC to avoid timezone-induced month shifts
          const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
          const price = row.adjClose != null && row.adjClose > 0 ? row.adjClose : row.close
          if (typeof price === "number" && Number.isFinite(price) && price > 0) {
            monthlyPrices[monthKey] = price
          }
        }

        return { symbol, prices: monthlyPrices }
      } catch (err) {
        console.error(`Failed to fetch historical data for ${symbol}:`, err)
        return { symbol, prices: {} }
      }
    }),
  )

  for (const result of results) {
    if (result.status === "fulfilled") {
      historicalPrices[result.value.symbol] = result.value.prices
    }
  }

  return NextResponse.json(
    {
      prices: historicalPrices,
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
      },
    },
  )
}
