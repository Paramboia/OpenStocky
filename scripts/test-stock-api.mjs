#!/usr/bin/env node
/**
 * Test script for Yahoo Finance stock quote API via yahoo-finance2.
 *
 * Usage:
 *   node scripts/test-stock-api.mjs
 *
 * No API key required — uses the unofficial Yahoo Finance API.
 * Fetches ALL symbols in a single batch call, then reports results.
 */

// ── Config ──────────────────────────────────────────────────────────────────
const SYMBOLS = [
  "GOOGL","TSLA","BABA","AMZN","META","ADDYY","SPOT","VRTX","ALTX","ALXN",
  "LEVI","CNC","APHA","UBER","JMIA","GM","GE","DIS","CRNM","SNAP",
  "V","MSFT","JNJ","VZ","PFE","XOM","NLSN","TPR","REP","SAN",
  "APERAM","ENB","MO","CVX","LY","CSCO","NVTA","LMT","DLR","AMC",
  "MOK","NOK","RKLB","TFLY","RDFN","DIDI","COIN","SOFI","SNOW","DNA",
  "XYZ","RKDB","ADBE","ADYEN","SNPS","LVMHF","RKT","ASML","JD","GPRO",
  "AMD","FIG","TOST","U","CRWV",
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function pad(s, n) { return String(s).padEnd(n) }

function fmtPrice(p) {
  return typeof p === "number" ? `$${p.toFixed(2)}` : "-"
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // Dynamic import so this works as an ES module script
  const { default: YahooFinance } = await import("yahoo-finance2")
  const yahooFinance = new YahooFinance()

  const total = SYMBOLS.length

  console.log("╔══════════════════════════════════════════════════════════════╗")
  console.log("║          OpenStocky — Yahoo Finance API Test                ║")
  console.log("╠══════════════════════════════════════════════════════════════╣")
  console.log(`║  Symbols to test : ${total}`)
  console.log(`║  API key needed  : No`)
  console.log(`║  Method          : Batch quote (single call)`)
  console.log("╚══════════════════════════════════════════════════════════════╝")
  console.log()

  const startTime = Date.now()

  // ── Batch fetch ──────────────────────────────────────────────────────────
  let batchResults = []
  let batchError = null

  try {
    console.log(`  Fetching ${total} symbols in one batch call...`)
    console.log()
    batchResults = await yahooFinance.quote(SYMBOLS, {}, { validateResult: false })
    if (!Array.isArray(batchResults)) batchResults = [batchResults]
  } catch (err) {
    batchError = err
    console.log(`  ❌ Batch call failed: ${err.message}`)
    console.log(`     Falling back to individual calls...`)
    console.log()
  }

  // Build a lookup map from batch results
  const priceMap = new Map()
  for (const quote of batchResults) {
    if (quote && quote.symbol && typeof quote.regularMarketPrice === "number") {
      priceMap.set(quote.symbol.toUpperCase(), {
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        name: quote.shortName || quote.longName || "",
      })
    }
  }

  // If batch failed, try individually for missing symbols
  const missing = SYMBOLS.filter(s => !priceMap.has(s))
  if (batchError && missing.length > 0) {
    for (const sym of missing) {
      try {
        const q = await yahooFinance.quote(sym)
        if (q && q.symbol && typeof q.regularMarketPrice === "number") {
          priceMap.set(q.symbol.toUpperCase(), {
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
            name: q.shortName || q.longName || "",
          })
        }
      } catch { /* skip */ }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  // ── Print per-symbol results ─────────────────────────────────────────────
  let okCount = 0
  let missingCount = 0

  for (const symbol of SYMBOLS) {
    const data = priceMap.get(symbol)
    if (data) {
      okCount++
      const pct = typeof data.changePercent === "number"
        ? `${data.changePercent >= 0 ? "+" : ""}${data.changePercent.toFixed(2)}%`
        : ""
      console.log(`  ${pad(symbol, 8)} ✅  ${fmtPrice(data.price).padEnd(12)} ${pct.padEnd(10)} ${data.name}`)
    } else {
      missingCount++
      console.log(`  ${pad(symbol, 8)} ⚠️   No data (delisted / invalid ticker)`)
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log()
  console.log("════════════════════════════════════════════════════════════════")
  console.log("  RESULTS SUMMARY")
  console.log("════════════════════════════════════════════════════════════════")
  console.log(`  ✅ Success       : ${okCount}/${total}`)
  console.log(`  ⚠️  No data       : ${missingCount}`)
  console.log(`  ⏱  Elapsed       : ${elapsed}s`)
  console.log()

  const successRate = total > 0 ? ((okCount / total) * 100).toFixed(0) : 0
  console.log(`  Success rate: ${successRate}%`)

  if (okCount === total) {
    console.log("  All symbols returned prices!")
  } else if (missingCount > 0) {
    console.log()
    console.log("  Symbols with no data (likely delisted or not on Yahoo Finance):")
    for (const symbol of SYMBOLS) {
      if (!priceMap.has(symbol)) {
        console.log(`    - ${symbol}`)
      }
    }
  }
  console.log()
}

main().catch(err => { console.error(err); process.exit(1) })
