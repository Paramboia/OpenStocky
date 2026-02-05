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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")

  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 })
  }

  try {
    // Yahoo Finance unofficial API endpoint
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
    
    const response = await fetch(url, {
      headers: {
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

    // Transform to a simple price map
    const prices: Record<string, number> = {}
    for (const quote of data.quoteResponse.result) {
      if (quote.symbol && quote.regularMarketPrice !== undefined) {
        prices[quote.symbol] = quote.regularMarketPrice
      }
    }

    return NextResponse.json({ 
      prices, 
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
