import { NextResponse } from "next/server"
import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] })

// No hard limit on symbols — Yahoo Finance handles batch queries efficiently.
// We set a sane cap to keep response payloads reasonable.
const MAX_SYMBOLS = 100
const CACHE_SECONDS = 60

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

  const prices: Record<string, number> = {}
  const errors: string[] = []

  try {
    // Fetch all symbols in parallel — yahoo-finance2 quote() accepts an array
    const results = await yahooFinance.quote(symbolList, {}, { validateResult: false })

    // quote() returns a single object for one symbol, or an array for multiple
    const quotesArray = Array.isArray(results) ? results : [results]

    for (const quote of quotesArray) {
      if (!quote || typeof quote !== "object") continue

      const symbol = (quote.symbol ?? "").toUpperCase()
      const price = quote.regularMarketPrice

      if (symbol && typeof price === "number" && Number.isFinite(price)) {
        prices[symbol] = price
      }
    }
  } catch (error) {
    console.error("Yahoo Finance batch quote error:", error)
    errors.push(error instanceof Error ? error.message : String(error))

    // If the batch call fails, try symbols individually as fallback
    for (const sym of symbolList) {
      if (prices[sym] !== undefined) continue // already have it
      try {
        const quote = await yahooFinance.quote(sym)
        if (quote?.regularMarketPrice && quote.symbol) {
          prices[quote.symbol.toUpperCase()] = quote.regularMarketPrice
        }
      } catch {
        // Individual symbol failed — could be delisted or invalid
      }
    }
  }

  const missingSymbols = symbolList.filter((s) => prices[s] === undefined)

  return NextResponse.json(
    {
      prices,
      missingSymbols,
      partial: missingSymbols.length > 0,
      lastUpdated: new Date().toISOString(),
      source: "Yahoo Finance",
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
      },
    }
  )
}
