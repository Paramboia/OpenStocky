"use client"

import { useMemo, useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

type HistoricalPrices = Record<string, Record<string, number>>

/** Generate all YYYY-MM keys from `start` to `end` inclusive. */
function monthKeys(start: string, end: string): string[] {
  const keys: string[] = []
  let [y, m] = start.split("-").map(Number)
  const [ey, em] = end.split("-").map(Number)
  while (y < ey || (y === ey && m <= em)) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return keys
}

export function PerformanceChart() {
  const { prices: livePrices } = useStockPrices()
  const transactions = useTransactions()
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrices>({})
  const [loading, setLoading] = useState(false)

  // All unique symbols that were ever transacted (needed for historical price fetch)
  const allSymbols = useMemo(() => {
    const set = new Set<string>()
    for (const tx of transactions) set.add(tx.symbol)
    return Array.from(set)
  }, [transactions])

  // Stable string key so the effect doesn't re-fire when the array ref changes
  const symbolsKey = allSymbols.join(",")

  // Fetch monthly historical prices
  useEffect(() => {
    if (!symbolsKey) return
    let cancelled = false
    setLoading(true)

    fetch(`/api/stock-prices/historical?symbols=${symbolsKey}&months=25`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.prices) setHistoricalPrices(data.prices)
      })
      .catch((err) => console.error("Failed to fetch historical prices:", err))
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [symbolsKey])

  const chartData = useMemo(() => {
    if (transactions.length === 0) return []

    // --- Phase 1: Build sparse monthly snapshots from transactions ---
    const snapshots = new Map<string, { invested: number; holdings: Map<string, { shares: number; totalCost: number }> }>()

    const sortedTx = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let cumulativeInvested = 0
    const holdings = new Map<string, { shares: number; totalCost: number }>()

    for (const tx of sortedTx) {
      // Use string slicing to avoid timezone issues (dates are YYYY-MM-DD)
      const monthKey = tx.date.substring(0, 7)

      const current = holdings.get(tx.symbol) || { shares: 0, totalCost: 0 }

      if (tx.type === "buy") {
        current.shares += tx.shares
        current.totalCost += tx.transactionCost
        cumulativeInvested += tx.transactionCost
      } else {
        const avgCost = current.shares > 0 ? current.totalCost / current.shares : 0
        current.shares -= tx.shares
        current.totalCost = Math.max(0, current.shares * avgCost)
        cumulativeInvested -= tx.transactionCost
      }

      holdings.set(tx.symbol, current)

      // Snapshot the state at end of this month (overwrites if multiple txs in same month)
      snapshots.set(monthKey, {
        invested: cumulativeInvested,
        holdings: new Map(Array.from(holdings, ([s, h]) => [s, { ...h }])),
      })
    }

    // --- Phase 2: Build continuous monthly series (fill gaps) ---
    const firstMonth = sortedTx[0].date.substring(0, 7)
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const allMonths = monthKeys(firstMonth, currentMonthKey)

    type MonthEntry = { month: string; invested: number; holdings: Map<string, { shares: number; totalCost: number }> }
    const continuous: MonthEntry[] = []
    let lastSnap: MonthEntry | null = null

    for (const mk of allMonths) {
      const snap = snapshots.get(mk)
      if (snap) {
        lastSnap = { month: mk, ...snap }
      } else if (lastSnap) {
        // Carry forward previous month's holdings
        lastSnap = {
          month: mk,
          invested: lastSnap.invested,
          holdings: new Map(Array.from(lastSnap.holdings, ([s, h]) => [s, { ...h }])),
        }
      }
      if (lastSnap) continuous.push(lastSnap)
    }

    // --- Phase 3: Value each month using historical prices ---
    const hasHistorical = Object.keys(historicalPrices).length > 0

    return continuous.map((d) => {
      let estimatedValue = 0

      d.holdings.forEach((h, symbol) => {
        if (h.shares <= 0) return

        let price: number | undefined

        // Current month → prefer live prices
        if (d.month === currentMonthKey && livePrices[symbol] != null) {
          price = livePrices[symbol]
        }

        // Historical price for this exact month
        if (price === undefined && hasHistorical) {
          price = historicalPrices[symbol]?.[d.month]
        }

        // Carry-forward: most recent historical price before this month
        if (price === undefined && hasHistorical) {
          const symbolPrices = historicalPrices[symbol]
          if (symbolPrices) {
            const months = Object.keys(symbolPrices).sort()
            for (let i = months.length - 1; i >= 0; i--) {
              if (months[i] <= d.month) {
                price = symbolPrices[months[i]]
                break
              }
            }
          }
        }

        // Last resort: use average cost basis
        if (price === undefined) {
          price = h.shares > 0 ? h.totalCost / h.shares : 0
        }

        estimatedValue += h.shares * price
      })

      return {
        month: d.month,
        invested: Math.max(0, d.invested),
        value: Math.max(0, estimatedValue),
      }
    }).slice(-24) // Last 24 months
  }, [transactions, historicalPrices, livePrices])

  const formatMonth = (month: string) => {
    const [year, m] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(m) - 1)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{formatMonth(label)}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const chartTitle = (
    <CardTitle className="flex items-center gap-2 text-foreground">
      Portfolio Growth
      {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <TooltipProvider delayDuration={100}>
        <UiTooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">Tracks net invested capital vs portfolio value over the last 24 months using actual monthly closing prices from Yahoo Finance. The current month uses live prices.</p>
          </TooltipContent>
        </UiTooltip>
      </TooltipProvider>
    </CardTitle>
  )

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>{chartTitle}</CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Add transactions to see portfolio growth
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>{chartTitle}</CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 16%)" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                stroke="hsl(240, 5%, 55%)"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
                tickLine={{ stroke: "hsl(240, 6%, 16%)" }}
                axisLine={{ stroke: "hsl(240, 6%, 16%)" }}
              />
              <YAxis
                stroke="hsl(240, 5%, 55%)"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
                tickLine={{ stroke: "hsl(240, 6%, 16%)" }}
                axisLine={{ stroke: "hsl(240, 6%, 16%)" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="invested"
                name="Invested"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#investedGradient)"
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Value"
                stroke="hsl(142, 76%, 46%)"
                strokeWidth={2}
                fill="url(#valueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(217,91%,60%)]" />
            <span className="text-sm text-muted-foreground">Net Invested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Portfolio Value</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
