"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { ArrowUpDown, Search, X, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

/* ---------- Types ---------- */

interface PerformanceEntry {
  symbol: string
  price: number
  change1D: number
  changePercent1D: number
  change7D: number | null
  changePercent7D: number | null
  change1M: number | null
  changePercent1M: number | null
  trailingPE: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  fiftyTwoWeekPosition: number | null
  marketCap: number | null
  dividendYield: number | null
}

type SortKey = keyof PerformanceEntry
type SortDirection = "asc" | "desc"

/* ---------- Helpers ---------- */

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch performance data")
  return res.json()
}

function formatMarketCap(cap: number | null): string {
  if (cap === null) return "—"
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`
  return `$${cap.toLocaleString()}`
}

/** Stacked absolute-change + percentage cell, styled like the Total Return column. */
function ChangeCell({ change, changePercent }: { change: number | null; changePercent: number | null }) {
  if (change === null || changePercent === null) {
    return <span className="text-muted-foreground">—</span>
  }
  const positive = change >= 0
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={`font-medium ${positive ? "text-primary" : "text-destructive"}`}>
        {positive ? "+" : ""}{changePercent.toFixed(2)}%
      </span>
      <span className={`text-xs ${positive ? "text-primary/70" : "text-destructive/70"}`}>
        {positive ? "+" : ""}${change.toFixed(2)}
      </span>
    </div>
  )
}

/** Sortable column header — mirrors the pattern in HoldingsTable. */
function SortableHead({
  label,
  sortKey: key,
  currentKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  direction: SortDirection
  onSort: (k: SortKey) => void
}) {
  return (
    <TableHead className="text-right text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onSort(key)}
      >
        {label}
        <ArrowUpDown className={`ml-1.5 h-3.5 w-3.5 ${currentKey === key ? "opacity-100" : "opacity-40"}`} />
      </Button>
    </TableHead>
  )
}

/* ---------- Component ---------- */

export function MarketPerformanceTable() {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("changePercent1D")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)
  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings])
  const symbolsParam = symbols.join(",")

  const { data, isLoading, error } = useSWR(
    symbolsParam ? `/api/stock-prices/performance?symbols=${symbolsParam}` : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false, dedupingInterval: 60_000 },
  )

  const rows: PerformanceEntry[] = useMemo(() => {
    if (!data?.performance) return []
    return Object.values(data.performance) as PerformanceEntry[]
  }, [data])

  const filtered = rows.filter((r) => r.symbol.toLowerCase().includes(search.toLowerCase()))

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const mod = sortDirection === "asc" ? 1 : -1
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * mod
    return String(av).localeCompare(String(bv)) * mod
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  /* ---- Render ---- */

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-foreground">Market Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              {symbols.length > 0
                ? `Price performance and fundamentals for your ${symbols.length} holding${symbols.length !== 1 ? "s" : ""}`
                : "Live prices and metrics from Yahoo Finance for your holdings"}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {symbols.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground">
            Add transactions to see market performance
          </div>
        ) : isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading market data…
          </div>
        ) : error ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-destructive">
            Failed to load market data
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-secondary/50">
                    {/* Symbol — left-aligned */}
                    <TableHead className="text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("symbol")}
                      >
                        Symbol
                        <ArrowUpDown className={`ml-1.5 h-3.5 w-3.5 ${sortKey === "symbol" ? "opacity-100" : "opacity-40"}`} />
                      </Button>
                    </TableHead>

                    <SortableHead label="Price" sortKey="price" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="1D" sortKey="changePercent1D" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="7D" sortKey="changePercent7D" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="1M" sortKey="changePercent1M" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="P/E" sortKey="trailingPE" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="52W Range" sortKey="fiftyTwoWeekPosition" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="Mkt Cap" sortKey="marketCap" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    <SortableHead label="Div Yield" sortKey="dividendYield" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sorted.map((s) => {
                    const pos = s.fiftyTwoWeekPosition
                    const posColor =
                      pos !== null
                        ? pos >= 70
                          ? "bg-primary"
                          : pos <= 30
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                        : ""

                    return (
                      <TableRow key={s.symbol} className="border-border hover:bg-secondary/50">
                        {/* Symbol */}
                        <TableCell className="font-semibold text-foreground">{s.symbol}</TableCell>

                        {/* Price */}
                        <TableCell className="text-right text-foreground">
                          ${s.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* 1D */}
                        <TableCell className="text-right">
                          <ChangeCell change={s.change1D} changePercent={s.changePercent1D} />
                        </TableCell>

                        {/* 7D */}
                        <TableCell className="text-right">
                          <ChangeCell change={s.change7D} changePercent={s.changePercent7D} />
                        </TableCell>

                        {/* 1M */}
                        <TableCell className="text-right">
                          <ChangeCell change={s.change1M} changePercent={s.changePercent1M} />
                        </TableCell>

                        {/* P/E */}
                        <TableCell className="text-right text-foreground">
                          {s.trailingPE !== null ? s.trailingPE.toFixed(1) : "—"}
                        </TableCell>

                        {/* 52W Range — mini progress bar + tooltip */}
                        <TableCell className="text-right">
                          {pos !== null && s.fiftyTwoWeekLow !== null && s.fiftyTwoWeekHigh !== null ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-end gap-2 cursor-help">
                                    <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                                      <div
                                        className={`h-full rounded-full ${posColor}`}
                                        style={{ width: `${Math.min(Math.max(pos, 2), 100)}%` }}
                                      />
                                    </div>
                                    <span className="w-10 text-right text-xs text-muted-foreground">
                                      {pos.toFixed(0)}%
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm">
                                    52W Low ${s.fiftyTwoWeekLow.toFixed(2)} — High ${s.fiftyTwoWeekHigh.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Current price is {pos.toFixed(0)}% of the way from low to high
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Mkt Cap */}
                        <TableCell className="text-right text-foreground">
                          {formatMarketCap(s.marketCap)}
                        </TableCell>

                        {/* Div Yield */}
                        <TableCell className="text-right text-foreground">
                          {s.dividendYield !== null ? `${s.dividendYield.toFixed(2)}%` : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
