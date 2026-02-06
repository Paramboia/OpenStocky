import { NextResponse } from "next/server"

interface AlphaVantageQuote {
  "01. symbol"?: string
  "05. price"?: string
}

interface AlphaVantageResponse {
  "Global Quote"?: AlphaVantageQuote
  "Error Message"?: string
  Note?: string
}

const SYMBOL_BATCH_SIZE = 5
const BATCH_DELAY_MS = 12000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")
  const apiKey = process.env.ALPHAVANTAGE_API_KEY

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

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Alpha Vantage API key" },
      { status: 500 }
    )
  }

  try {
    const batches: string[][] = []
    for (let i = 0; i < symbolList.length; i += SYMBOL_BATCH_SIZE) {
      batches.push(symbolList.slice(i, i + SYMBOL_BATCH_SIZE))
    }

    const prices: Record<string, number> = {}
    const errors: string[] = []

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
      const batch = batches[batchIndex]
      const responses = await Promise.allSettled(
        batch.map(async (symbol) => {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
            symbol
          )}&apikey=${encodeURIComponent(apiKey)}`

          const response = await fetch(url, {
            headers: {
              Accept: "application/json",
            },
            next: { revalidate: 60 }, // Cache for 60 seconds
          })

          if (!response.ok) {
            throw new Error(`Alpha Vantage API error: ${response.status}`)
          }

          const data: AlphaVantageResponse = await response.json()

          if (data.Note) {
            throw new Error(`Alpha Vantage rate limit: ${data.Note}`)
          }

          if (data["Error Message"]) {
            throw new Error(`Alpha Vantage error: ${data["Error Message"]}`)
          }

          if (!data["Global Quote"]) {
            throw new Error("Invalid response from Alpha Vantage")
          }

          return data["Global Quote"]
        })
      )

      for (const result of responses) {
        if (result.status === "fulfilled") {
          const quote = result.value
          const symbol = quote["01. symbol"]
          const price = quote["05. price"]
          const numericPrice = price ? Number(price) : NaN

          if (symbol && Number.isFinite(numericPrice)) {
            prices[symbol.toUpperCase()] = numericPrice
          }
        } else {
          errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
        }
      }

      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    if (Object.keys(prices).length === 0) {
      throw new Error(errors[0] || "No prices returned from Alpha Vantage")
    }

    const missingSymbols = symbolList.filter((symbol) => prices[symbol] === undefined)

    return NextResponse.json({ 
      prices, 
      missingSymbols,
      partial: errors.length > 0,
      errors: errors.length > 0 ? errors : undefined,
      lastUpdated: new Date().toISOString(),
      source: "Alpha Vantage"
    })
  } catch (error) {
    console.error("Error fetching stock prices:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock prices", message: String(error) },
      { status: 500 }
    )
  }
}
