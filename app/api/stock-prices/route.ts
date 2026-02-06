import { NextResponse } from "next/server"

interface YahooQuoteResult {
  symbol: string
  regularMarketPrice?: number
  shortName?: string
}

interface YahooResponse {
  quoteResponse: {
    result: YahooQuoteResult[]
    error: null | string
  }
}

const SYMBOL_BATCH_SIZE = 50

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")

  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 })
  }

  const symbolList = symbols
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => symbol.length > 0)

  if (symbolList.length === 0) {
    return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 })
  }

  try {
    const batches: string[][] = []
    for (let i = 0; i < symbolList.length; i += SYMBOL_BATCH_SIZE) {
      batches.push(symbolList.slice(i, i + SYMBOL_BATCH_SIZE))
    }

    const responses = await Promise.allSettled(
      batches.map(async (batch) => {
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
          batch.join(",")
        )}`

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          next: { revalidate: 60 }, // Cache for 60 seconds
        })

        if (!response.ok) {
          throw new Error(`Yahoo Finance API error: ${response.status}`)
        }

        const data: YahooResponse = await response.json()

        if (!data.quoteResponse || !data.quoteResponse.result) {
          throw new Error("Invalid response from Yahoo Finance")
        }

        return data.quoteResponse.result
      })
    )

    const prices: Record<string, number> = {}
    const errors: string[] = []

    for (const result of responses) {
      if (result.status === "fulfilled") {
        for (const quote of result.value) {
          if (quote.symbol && quote.regularMarketPrice !== undefined) {
            prices[quote.symbol] = quote.regularMarketPrice
          }
        }
      } else {
        errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
      }
    }

    if (Object.keys(prices).length === 0) {
      throw new Error(errors[0] || "No prices returned from Yahoo Finance")
    }

    const missingSymbols = symbolList.filter((symbol) => prices[symbol] === undefined)

    return NextResponse.json({ 
      prices, 
      missingSymbols,
      partial: errors.length > 0,
      errors: errors.length > 0 ? errors : undefined,
      lastUpdated: new Date().toISOString(),
      source: "Yahoo Finance"
    })
  } catch (error) {
    console.error("Error fetching stock prices:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock prices", message: String(error) },
      { status: 500 }
    )
  }
}
