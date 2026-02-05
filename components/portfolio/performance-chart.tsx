"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { transactions, currentPrices } from "@/lib/portfolio-data"

export function PerformanceChart() {
  const chartData = useMemo(() => {
    // Group transactions by month and calculate cumulative portfolio value
    const monthlyData: { month: string; invested: number; holdings: Map<string, { shares: number; avgCost: number }> }[] = []
    
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    let cumulativeInvested = 0
    const holdings = new Map<string, { shares: number; totalCost: number }>()

    for (const tx of sortedTx) {
      const date = new Date(tx.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      
      const current = holdings.get(tx.symbol) || { shares: 0, totalCost: 0 }
      
      if (tx.type === "buy") {
        current.shares += tx.shares
        current.totalCost += tx.transactionCost
        cumulativeInvested += tx.transactionCost
      } else {
        const avgCost = current.shares > 0 ? current.totalCost / current.shares : 0
        current.shares -= tx.shares
        current.totalCost = Math.max(0, current.shares * avgCost)
        // Sells reduce invested amount by realized value
        cumulativeInvested -= tx.transactionCost
      }
      
      holdings.set(tx.symbol, current)
      
      // Update or add monthly entry
      const existingIndex = monthlyData.findIndex((d) => d.month === monthKey)
      const holdingsCopy = new Map(holdings)
      
      if (existingIndex >= 0) {
        monthlyData[existingIndex] = {
          month: monthKey,
          invested: cumulativeInvested,
          holdings: holdingsCopy,
        }
      } else {
        monthlyData.push({
          month: monthKey,
          invested: cumulativeInvested,
          holdings: holdingsCopy,
        })
      }
    }

    // Calculate estimated value for each month (using current prices as approximation)
    return monthlyData.map((d) => {
      let estimatedValue = 0
      d.holdings.forEach((h, symbol) => {
        if (h.shares > 0) {
          const price = currentPrices[symbol] || h.totalCost / h.shares
          estimatedValue += h.shares * price
        }
      })
      
      return {
        month: d.month,
        invested: Math.max(0, d.invested),
        value: Math.max(0, estimatedValue),
      }
    }).slice(-24) // Last 24 months
  }, [])

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

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Portfolio Growth</CardTitle>
      </CardHeader>
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
