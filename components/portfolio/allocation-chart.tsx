"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

type AllocationView = "symbol" | "sector" | "region"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

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
  const [viewFilter, setViewFilter] = useState<AllocationView>("symbol")
  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const symbolsParam = holdings.map((h) => h.symbol).join(",")

  const { data: profilesData } = useSWR(
    symbolsParam ? `/api/stock-prices/profiles?symbols=${symbolsParam}` : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false, dedupingInterval: 60_000 * 60 },
  )
  const profiles: Record<string, { sector: string | null; industry: string | null; country: string | null }> =
    profilesData?.profiles ?? {}

  const chartData = useMemo(() => {
    if (totalValue <= 0) return []
    const withValue = holdings
      .map((h) => ({
        symbol: h.symbol,
        value: h.currentValue,
        sector: profiles[h.symbol]?.sector ?? "Unknown",
        region: profiles[h.symbol]?.country ?? "Unknown",
      }))
      .filter((d) => d.value > 0)

    if (viewFilter === "symbol") {
      const data = withValue
        .slice(0, 10)
        .map((d) => ({
          name: d.symbol,
          value: d.value,
          percent: ((d.value / totalValue) * 100).toFixed(1),
        }))
      if (withValue.length > 10) {
        const otherValue = withValue
          .slice(10)
          .reduce((sum, d) => sum + d.value, 0)
        if (otherValue > 0) {
          data.push({
            name: "Other",
            value: otherValue,
            percent: ((otherValue / totalValue) * 100).toFixed(1),
          })
        }
      }
      return data
    }

    const groupKey = viewFilter === "sector" ? "sector" : "region"
    const groups = new Map<string, number>()
    for (const d of withValue) {
      const key = d[groupKey] || "Unknown"
      groups.set(key, (groups.get(key) ?? 0) + d.value)
    }
    const sortedEntries = [...groups.entries()].sort((a, b) => b[1] - a[1])
    const top10 = sortedEntries.slice(0, 10)
    const rest = sortedEntries.slice(10)
    const otherSum = rest.reduce((s, [, v]) => s + v, 0)
    const sorted = top10.map(([name, value]) => ({
      name,
      value,
      percent: ((value / totalValue) * 100).toFixed(1),
    }))
    if (otherSum > 0) {
      sorted.push({
        name: "Other",
        value: otherSum,
        percent: ((otherSum / totalValue) * 100).toFixed(1),
      })
    }
    return sorted
  }, [holdings, totalValue, profiles, viewFilter])

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

  const allocationFilter = (
    <div className="flex w-full bg-secondary border border-border rounded-md overflow-hidden sm:w-fit">
      <button
        type="button"
        onClick={() => setViewFilter("symbol")}
        className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium transition-colors ${
          viewFilter === "symbol"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Holdings
      </button>
      <button
        type="button"
        onClick={() => setViewFilter("sector")}
        className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium transition-colors ${
          viewFilter === "sector"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sector
      </button>
      <button
        type="button"
        onClick={() => setViewFilter("region")}
        className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium transition-colors ${
          viewFilter === "region"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Region
      </button>
    </div>
  )

  const chartTitle = (
    <CardTitle className="flex items-center gap-2 text-foreground">
      Portfolio Allocation
      <TooltipProvider delayDuration={100}>
        <UiTooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              {viewFilter === "symbol" && "Donut chart by holding: top 10 shown individually; smaller positions grouped as Other."}
              {viewFilter === "sector" && "Donut chart by sector: allocation aggregated by company sector (e.g. Technology, Healthcare)."}
              {viewFilter === "region" && "Donut chart by region: allocation aggregated by company country (e.g. United States, China)."}
            </p>
          </TooltipContent>
        </UiTooltip>
      </TooltipProvider>
    </CardTitle>
  )

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-first sm:order-none">{chartTitle}</div>
          {holdings.length > 0 && <div className="order-last sm:order-none w-full sm:w-auto">{allocationFilter}</div>}
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Add transactions to see portfolio allocation
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="order-first sm:order-none">{chartTitle}</div>
        <div className="order-last sm:order-none w-full sm:w-auto">{allocationFilter}</div>
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
