import { NextResponse } from "next/server"

interface AlphaVantageQuote {
  "01. symbol"?: string
  "05. price"?: string
}

interface AlphaVantageResponse {
  "Global Quote"?: AlphaVantageQuote | Record<string, never>
  "Error Message"?: string
  Note?: string
}

// Alpha Vantage free tier: 5 requests/min, 25/day. GLOBAL_QUOTE = 1 request per symbol.
const REQUESTS_PER_MINUTE = 5
const DELAY_BETWEEN_REQUESTS_MS = Math.ceil((60 * 1000) / REQUESTS_PER_MINUTE) // ~12s between each
const MAX_SYMBOLS = 5 // Free tier: 5 req/min. Keeps request ~50s to avoid serverless timeout.
const CACHE_SECONDS = 60

async function fetchQuote(symbol: string, apiKey: string): Promise<AlphaVantageQuote | null> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`)
  }

  const data: AlphaVantageResponse = await response.json()

  if (data.Note) {
    throw new Error("RATE_LIMIT")
  }

  if (data["Error Message"]) {
    throw new Error(data["Error Message"])
  }

  const quote = data["Global Quote"]
  if (!quote || typeof quote !== "object" || !quote["01. symbol"] || !quote["05. price"]) {
    return null
  }

  return quote
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")
  const apiKey = process.env.ALPHAVANTAGE_API_KEY

  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 })
  }

  const symbolList = symbols
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0)
    .slice(0, MAX_SYMBOLS)

  if (symbolList.length === 0) {
    return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Alpha Vantage API key" },
      { status: 500 }
    )
  }

  const prices: Record<string, number> = {}
  const errors: string[] = []
  let rateLimited = false

  try {
    // Sequential requests with delay to respect 5 req/min limit
    for (let i = 0; i < symbolList.length; i++) {
      if (i > 0) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS_MS))
      }

      try {
        const quote = await fetchQuote(symbolList[i], apiKey)
        if (quote) {
          const symbol = quote["01. symbol"]!
          const numericPrice = Number(quote["05. price"])
          if (Number.isFinite(numericPrice)) {
            prices[symbol.toUpperCase()] = numericPrice
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg === "RATE_LIMIT") {
          rateLimited = true
          errors.push("Rate limit reached (5 requests/min). Please try again in a minute.")
          break
        }
        errors.push(msg)
      }
    }

    const missingSymbols = symbolList.filter((s) => prices[s] === undefined)
    const hasAnyPrices = Object.keys(prices).length > 0

    return NextResponse.json({
      prices,
      missingSymbols,
      partial: errors.length > 0 || rateLimited,
      rateLimited,
      errors: errors.length > 0 ? errors : undefined,
      lastUpdated: new Date().toISOString(),
      source: "Alpha Vantage",
    })
  } catch (error) {
    console.error("Error fetching stock prices:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock prices", message: String(error) },
      { status: 500 }
    )
  }
}
