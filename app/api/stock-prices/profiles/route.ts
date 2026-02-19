import { NextResponse } from "next/server"
import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] })
const MAX_SYMBOLS = 100
const CACHE_SECONDS = 3600 // 1 hour — sector/region change slowly

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

  const profiles: Record<string, { sector: string | null; industry: string | null; country: string | null }> = {}

  try {
    const results = await Promise.allSettled(
      symbolList.map(async (sym) => {
        try {
          const summary = await yahooFinance.quoteSummary(sym, {
            modules: ["assetProfile"],
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ap = (summary as any)?.assetProfile
          const sector = typeof ap?.sector === "string" ? ap.sector.trim() || null : null
          const industry = typeof ap?.industry === "string" ? ap.industry.trim() || null : null
          const country = typeof ap?.country === "string" ? ap.country.trim() || null : null
          return { sym, sector, industry, country }
        } catch {
          return { sym, sector: null, industry: null, country: null }
        }
      }),
    )

    for (const r of results) {
      if (r.status === "fulfilled") {
        profiles[r.value.sym] = {
          sector: r.value.sector,
          industry: r.value.industry,
          country: r.value.country,
        }
      }
    }
  } catch (error) {
    console.error("Profiles fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
  }

  return NextResponse.json(
    { profiles, lastUpdated: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
      },
    },
  )
}
