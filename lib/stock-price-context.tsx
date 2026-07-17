"use client"

import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import useSWR, { useSWRConfig } from "swr"
import { useTransactions } from "@/lib/transactions-store"

interface StockPriceContextType {
  prices: Record<string, number>
  betas: Record<string, number>
  /** Symbols whose latest fetch failed — their price (if any) is a stale fallback. */
  staleSymbols: string[]
  isLoading: boolean
  isError: boolean
  lastUpdated: string | null
  refresh: () => void
}

const LAST_KNOWN_PRICES_KEY = "openstocky:last-known-prices"

function loadLastKnownPrices(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(LAST_KNOWN_PRICES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return {}
    const result: Record<string, number> = {}
    for (const [symbol, price] of Object.entries(parsed)) {
      if (typeof price === "number" && Number.isFinite(price) && price > 0) {
        result[symbol] = price
      }
    }
    return result
  } catch {
    return {}
  }
}

const StockPriceContext = createContext<StockPriceContextType | null>(null)

// Get unique symbols from transactions that we still hold
function getActiveSymbols(transactionData: ReturnType<typeof useTransactions>): string[] {
  const holdingsMap = new Map<string, number>()
  
  for (const tx of transactionData) {
    const current = holdingsMap.get(tx.symbol) || 0
    if (tx.type === "buy") {
      holdingsMap.set(tx.symbol, current + tx.shares)
    } else {
      holdingsMap.set(tx.symbol, current - tx.shares)
    }
  }
  
  // Only return symbols with positive holdings
  const activeSymbols: string[] = []
  holdingsMap.forEach((shares, symbol) => {
    if (shares > 0.01) {
      activeSymbols.push(symbol)
    }
  })
  
  return activeSymbols
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch prices")
  return res.json()
}

export function StockPriceProvider({ children }: { children: ReactNode }) {
  const transactions = useTransactions()
  const symbols = useMemo(() => getActiveSymbols(transactions), [transactions])
  const symbolsParam = symbols.join(",")
  const { mutate: globalMutate } = useSWRConfig()

  const { data, error, isLoading, mutate } = useSWR(
    symbolsParam ? `/api/stock-prices?symbols=${symbolsParam}` : null,
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh, user controls refresh
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  )

  const refresh = useCallback(() => {
    mutate(undefined, { revalidate: true })
    // Also revalidate Market table data (performance endpoint)
    globalMutate(
      (key) => typeof key === "string" && key.startsWith("/api/stock-prices/performance"),
      undefined,
      { revalidate: true },
    )
  }, [mutate, globalMutate])

  // Last successfully fetched price per symbol, persisted so we can fall back
  // when Yahoo silently drops symbols from a batch response.
  const [lastKnownPrices, setLastKnownPrices] = useState<Record<string, number>>(loadLastKnownPrices)

  useEffect(() => {
    if (!data?.prices) return
    setLastKnownPrices((prev) => {
      let changed = false
      const next = { ...prev }
      for (const [symbol, price] of Object.entries(data.prices as Record<string, number>)) {
        if (typeof price === "number" && Number.isFinite(price) && price > 0 && next[symbol] !== price) {
          next[symbol] = price
          changed = true
        }
      }
      if (!changed) return prev
      try {
        window.localStorage.setItem(LAST_KNOWN_PRICES_KEY, JSON.stringify(next))
      } catch {
        // localStorage unavailable (private mode / quota) — fallback still works in-memory
      }
      return next
    })
  }, [data?.prices])

  const { filteredPrices, staleSymbols } = useMemo(() => {
    const next: Record<string, number> = {}
    const stale: string[] = []
    if (!data?.prices || symbols.length === 0) return { filteredPrices: next, staleSymbols: stale }
    for (const symbol of symbols) {
      if (data.prices[symbol] !== undefined) {
        next[symbol] = data.prices[symbol]
      } else {
        // Fetch failed for this symbol — fall back to the last known price
        stale.push(symbol)
        if (lastKnownPrices[symbol] !== undefined) {
          next[symbol] = lastKnownPrices[symbol]
        }
      }
    }
    return { filteredPrices: next, staleSymbols: stale }
  }, [data?.prices, symbols, lastKnownPrices])

  const filteredBetas = useMemo(() => {
    if (!data?.betas || symbols.length === 0) return {}
    const next: Record<string, number> = {}
    for (const symbol of symbols) {
      if (data.betas[symbol] !== undefined) {
        next[symbol] = data.betas[symbol]
      }
    }
    return next
  }, [data?.betas, symbols])

  const value: StockPriceContextType = {
    prices: filteredPrices,
    betas: filteredBetas,
    staleSymbols,
    isLoading,
    isError: !!error,
    lastUpdated: data?.lastUpdated || null,
    refresh,
  }

  return (
    <StockPriceContext.Provider value={value}>
      {children}
    </StockPriceContext.Provider>
  )
}

export function useStockPrices() {
  const context = useContext(StockPriceContext)
  if (!context) {
    throw new Error("useStockPrices must be used within a StockPriceProvider")
  }
  return context
}
