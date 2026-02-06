"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import { transactions } from "@/lib/portfolio-data"

interface StockPriceContextType {
  prices: Record<string, number>
  isLoading: boolean
  isError: boolean
  lastUpdated: string | null
  refresh: () => void
}

const StockPriceContext = createContext<StockPriceContextType | null>(null)

// Get unique symbols from transactions that we still hold
function getActiveSymbols(): string[] {
  const holdingsMap = new Map<string, number>()
  
  for (const tx of transactions) {
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
  const symbols = getActiveSymbols()
  const symbolsParam = symbols.join(",")
  
  const { data, error, isLoading, mutate } = useSWR(
    symbolsParam ? `/api/stock-prices?symbols=${symbolsParam}` : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  )

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  const value: StockPriceContextType = {
    prices: data?.prices || {},
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
