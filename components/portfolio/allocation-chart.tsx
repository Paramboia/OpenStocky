"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

const COLORS = [
  "hsl(142, 76%, 46%)",
  "hsl(217, 91%, 60%)",
  "hsl(47, 96%, 53%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(173, 58%, 39%)",
  "hsl(12, 76%, 61%)",
  "hsl(197, 37%, 50%)",
  "hsl(43, 74%, 66%)",
  "hsl(27, 87%, 67%)",
]

export function AllocationChart() {
  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

  const chartData = holdings
    .map((h) => ({
      name: h.symbol,
      value: h.currentValue,
      percent: ((h.currentValue / totalValue) * 100).toFixed(1),
    }))
    .filter((d) => d.value > 0)
    .slice(0, 10)

  // Group remaining holdings as "Other"
  if (holdings.length > 10) {
    const otherValue = holdings
      .slice(10)
      .reduce((sum, h) => sum + h.currentValue, 0)
    if (otherValue > 0) {
      chartData.push({
        name: "Other",
        value: otherValue,
        percent: ((otherValue / totalValue) * 100).toFixed(1),
      })
    }
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percent: string } }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-muted-foreground">
            ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-primary">{payload[0].payload.percent}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          Portfolio Allocation
          <TooltipProvider delayDuration={100}>
            <UiTooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">Donut chart showing the percentage weight of each holding by market value. Top 10 positions are shown individually; smaller positions are grouped as &quot;Other&quot;.</p>
              </TooltipContent>
            </UiTooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(240, 10%, 4%)"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${_?.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
