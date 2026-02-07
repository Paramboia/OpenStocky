"use client"

import { useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

const GREEN = "hsl(142, 76%, 46%)"
const RED = "hsl(0, 72%, 51%)"

export function RiskReturnChart() {
  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

  const chartData = useMemo(() => {
    if (totalValue === 0) return []

    return holdings.map((h) => ({
      symbol: h.symbol,
      weight: (h.currentValue / totalValue) * 100,
      returnPct: h.gainLossPercent,
      value: h.currentValue,
      gainLoss: h.gainLoss,
    }))
  }, [holdings, totalValue])

  // Range for Z-axis (bubble size)
  const values = chartData.map((d) => d.value)
  const minValue = values.length > 0 ? Math.min(...values) : 0
  const maxValue = values.length > 0 ? Math.max(...values) : 1

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: { payload: { symbol: string; weight: number; returnPct: number; value: number; gainLoss: number } }[]
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      const isPositive = d.returnPct >= 0
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{d.symbol}</p>
          <p className="text-muted-foreground text-sm">
            Weight: {d.weight.toFixed(1)}%
          </p>
          <p className={`text-sm ${isPositive ? "text-primary" : "text-destructive"}`}>
            Return: {isPositive ? "+" : ""}
            {d.returnPct.toFixed(2)}%
          </p>
          <p className="text-muted-foreground text-sm">
            Value: $
            {d.value.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <p className={`text-sm ${d.gainLoss >= 0 ? "text-primary" : "text-destructive"}`}>
            P/L: {d.gainLoss >= 0 ? "+" : ""}$
            {d.gainLoss.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      )
    }
    return null
  }

  if (holdings.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Risk vs Return</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Add transactions to see risk vs return analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Risk vs Return</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240, 6%, 16%)"
              />
              <XAxis
                type="number"
                dataKey="weight"
                name="Weight"
                unit="%"
                stroke="hsl(240, 5%, 55%)"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
                tickLine={{ stroke: "hsl(240, 6%, 16%)" }}
                axisLine={{ stroke: "hsl(240, 6%, 16%)" }}
                label={{
                  value: "Portfolio Weight %",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(240, 5%, 55%)",
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="returnPct"
                name="Return"
                unit="%"
                stroke="hsl(240, 5%, 55%)"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
                tickLine={{ stroke: "hsl(240, 6%, 16%)" }}
                axisLine={{ stroke: "hsl(240, 6%, 16%)" }}
                label={{
                  value: "Return %",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fill: "hsl(240, 5%, 55%)",
                  fontSize: 11,
                }}
              />
              <ZAxis
                type="number"
                dataKey="value"
                range={[80, 600]}
                domain={[minValue, maxValue]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "hsl(240, 5%, 40%)" }} />
              <ReferenceLine y={0} stroke="hsl(240, 5%, 40%)" strokeWidth={1} strokeDasharray="6 3" />
              <Scatter data={chartData} fillOpacity={0.75} strokeWidth={1.5}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.symbol}
                    fill={entry.returnPct >= 0 ? GREEN : RED}
                    stroke={entry.returnPct >= 0 ? GREEN : RED}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span className="text-xs text-muted-foreground">Bubble size = position value</span>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: GREEN }} />
            <span className="text-sm text-muted-foreground">Positive return</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: RED }} />
            <span className="text-sm text-muted-foreground">Negative return</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
