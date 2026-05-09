"use client"

import { useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts"
import { Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PositionChartFilter } from "@/components/portfolio/position-chart-filter"
import { buildPositionChartData, type PositionChartView } from "@/components/portfolio/position-chart-data"
import { calculateClosedPositions, calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

const GREEN = "hsl(142, 76%, 46%)"
const RED = "hsl(0, 72%, 51%)"

export function PlAttributionChart() {
  const [positionView, setPositionView] = useState<PositionChartView>("open")
  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)
  const positions = calculateClosedPositions(transactions)

  const chartData = useMemo(() => {
    return buildPositionChartData(holdings, positions, positionView)
      .sort((a, b) => b.totalReturn - a.totalReturn)
      .slice(0, 20) // Top 20 positions for readability
  }, [holdings, positions, positionView])

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: { payload: { symbol: string; status: string; totalReturn: number; totalReturnPercent: number; unrealized: number; realized: number } }[]
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      const isPositive = d.totalReturn >= 0
      const statusLabel = d.status.charAt(0).toUpperCase() + d.status.slice(1)
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{d.symbol}</p>
          <p className="text-xs text-muted-foreground">{statusLabel}</p>
          <p className={isPositive ? "text-primary" : "text-destructive"}>
            {isPositive ? "+" : ""}$
            {Math.round(d.totalReturn).toLocaleString("en-US")}
          </p>
          <p className="text-muted-foreground text-sm">
            {isPositive ? "+" : ""}
            {d.totalReturnPercent.toFixed(1)}%
          </p>
          {(d.realized !== 0 || d.status === "closed") && (
            <div className="mt-1.5 border-t border-border pt-1.5 text-xs text-muted-foreground">
              {d.status !== "closed" && (
                <p>Unrealized: {d.unrealized >= 0 ? "+" : ""}${Math.round(d.unrealized).toLocaleString("en-US")}</p>
              )}
              <p>Realized: {d.realized >= 0 ? "+" : ""}${Math.round(d.realized).toLocaleString("en-US")}</p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Dynamic height: ensure every bar has enough space for its label
  const barHeight = 28
  const minChartHeight = 320
  const dynamicHeight = Math.max(minChartHeight, chartData.length * barHeight + 40)

  const chartTitle = (
    <CardTitle className="flex items-center gap-2 text-foreground">
      P/L Attribution
      <TooltipProvider delayDuration={100}>
        <UiTooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              {positionView === "open" && "Horizontal bar chart showing total return for positions still held today, including partial positions. Hover for unrealized and realized P/L."}
              {positionView === "closed" && "Horizontal bar chart showing realized P/L for fully closed positions, sorted from best to worst."}
              {positionView === "all" && "Horizontal bar chart showing current positions plus fully closed positions, sorted from best to worst."}
            </p>
          </TooltipContent>
        </UiTooltip>
      </TooltipProvider>
    </CardTitle>
  )

  const filter = positions.length > 0 ? (
    <PositionChartFilter value={positionView} onChange={setPositionView} />
  ) : null

  if (positions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>{chartTitle}</CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Add transactions to see P/L attribution
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-first sm:order-none">{chartTitle}</div>
          <div className="order-last sm:order-none w-full sm:w-auto">{filter}</div>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            No {positionView} positions to show
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="order-first sm:order-none">{chartTitle}</div>
        <div className="order-last sm:order-none w-full sm:w-auto">{filter}</div>
      </CardHeader>
      <CardContent>
        <div style={{ height: dynamicHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240, 6%, 16%)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="hsl(240, 5%, 55%)"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
                tickLine={{ stroke: "hsl(240, 6%, 16%)" }}
                axisLine={{ stroke: "hsl(240, 6%, 16%)" }}
                tickFormatter={(v) => {
                  const abs = Math.abs(v)
                  if (abs >= 1000) return `${v < 0 ? "-" : ""}$${(abs / 1000).toFixed(0)}k`
                  return `$${v.toFixed(0)}`
                }}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                width={52}
                stroke="hsl(240, 5%, 55%)"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(240, 6%, 16%)" }}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(240, 6%, 16%, 0.4)" }} />
              <ReferenceLine x={0} stroke="hsl(240, 5%, 40%)" strokeWidth={1} />
              <Bar dataKey="totalReturn" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.symbol}
                    fill={entry.totalReturn >= 0 ? GREEN : RED}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: GREEN }} />
            <span className="text-sm text-muted-foreground">Gain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: RED }} />
            <span className="text-sm text-muted-foreground">Loss</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
