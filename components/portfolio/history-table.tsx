"use client"

import { useState } from "react"
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Search, X, Clock, CheckCircle2, MinusCircle, Package } from "lucide-react"
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
import { calculateClosedPositions, type ClosedPosition } from "@/lib/portfolio-data"
import { useTransactions } from "@/lib/transactions-store"

type SortKey = keyof ClosedPosition
type SortDirection = "asc" | "desc"
type DualSortMode = 0 | 1 | 2 | 3 // 0: highest %, 1: highest abs, 2: lowest %, 3: lowest abs

function getDualSortNext(
  absKey: SortKey,
  pctKey: SortKey,
  currentKey: SortKey,
  currentDir: SortDirection
): { key: SortKey; direction: SortDirection } {
  const isSameColumn = currentKey === absKey || currentKey === pctKey
  if (!isSameColumn) {
    return { key: pctKey, direction: "desc" } // first click: highest %
  }
  let mode: DualSortMode = 0
  if (currentKey === pctKey && currentDir === "desc") mode = 0
  else if (currentKey === absKey && currentDir === "desc") mode = 1
  else if (currentKey === pctKey && currentDir === "asc") mode = 2
  else mode = 3
  const nextMode = ((mode + 1) % 4) as DualSortMode
  if (nextMode === 0) return { key: pctKey, direction: "desc" }
  if (nextMode === 1) return { key: absKey, direction: "desc" }
  if (nextMode === 2) return { key: pctKey, direction: "asc" }
  return { key: absKey, direction: "asc" }
}

function formatDuration(days: number): string {
  if (days < 1) return "<1d"
  if (days < 30) return `${days}d`
  if (days < 365) {
    const months = Math.floor(days / 30)
    const remaining = days % 30
    return remaining > 0 ? `${months}mo ${remaining}d` : `${months}mo`
  }
  const years = Math.floor(days / 365)
  const remaining = Math.floor((days % 365) / 30)
  return remaining > 0 ? `${years}y ${remaining}mo` : `${years}y`
}

export function HistoryTable() {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("realizedReturnPercent")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [statusFilter, setStatusFilter] = useState<"all" | "closed" | "partial" | "open">("all")

  const transactions = useTransactions()
  const positions = calculateClosedPositions(transactions)

  const filteredPositions = positions
    .filter((p) => p.symbol.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => statusFilter === "all" || p.status === statusFilter)

  const sortedPositions = [...filteredPositions].sort((a, b) => {
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    const modifier = sortDirection === "asc" ? 1 : -1

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * modifier
    }
    return String(aValue).localeCompare(String(bValue)) * modifier
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const handleDualSort = (absKey: SortKey, pctKey: SortKey) => {
    const next = getDualSortNext(absKey, pctKey, sortKey, sortDirection)
    setSortKey(next.key)
    setSortDirection(next.direction)
  }

  // Summary stats
  const totalRealized = positions.reduce((sum, p) => sum + p.realizedPnL, 0)
  const closedCount = positions.filter((p) => p.status === "closed").length
  const partialCount = positions.filter((p) => p.status === "partial").length
  const openCount = positions.filter((p) => p.status === "open").length
  const isTotalPositive = totalRealized >= 0

  const summaryParts: string[] = []
  if (closedCount > 0) summaryParts.push(`${closedCount} closed`)
  if (partialCount > 0) summaryParts.push(`${partialCount} partial`)
  if (openCount > 0) summaryParts.push(`${openCount} open`)
  const summaryText = summaryParts.length > 0 ? summaryParts.join(", ") : ""

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-foreground">Trade History</CardTitle>
            <p className="text-sm text-muted-foreground">
              {positions.length > 0 ? (
                <>
                  {totalRealized !== 0 && (
                    <>
                      <span className={isTotalPositive ? "text-primary font-medium" : "text-destructive font-medium"}>
                        {isTotalPositive ? "+" : ""}${Math.round(totalRealized).toLocaleString("en-US")}
                      </span>
                      {" "}realized •{" "}
                    </>
                  )}
                  {summaryText || `${positions.length} position${positions.length !== 1 ? "s" : ""}`}
                </>
              ) : (
                "All symbols you have traded — closed, partial, and open"
              )}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex bg-secondary border border-border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("closed")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "closed"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("partial")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "partial"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Partial
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("open")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "open"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Open
              </button>
            </div>
            <div className="relative w-full sm:w-52">
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
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground">
            Add transactions to see your trade history
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("symbol")}
                    >
                      Symbol
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("avgBuyPrice")}
                    >
                      Avg Buy
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("avgSellPrice")}
                    >
                      Avg Sell
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("totalSharesSold")}
                    >
                      Sold
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("costOfSoldShares")}
                    >
                      Cost (sold)
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("totalProceeds")}
                    >
                      Proceeds
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDualSort("realizedPnL", "realizedReturnPercent")}
                    >
                      Realized P/L
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort("holdingPeriodDays")}
                    >
                      Duration
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPositions.map((pos) => {
                  const isPositive = pos.realizedPnL >= 0

                  return (
                    <TableRow key={pos.symbol} className="border-border hover:bg-secondary/50">
                      <TableCell className="font-semibold text-foreground">{pos.symbol}</TableCell>
                      <TableCell className="text-center">
                        {pos.status === "closed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Closed
                          </span>
                        ) : pos.status === "partial" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <MinusCircle className="h-3 w-3" />
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                            <Package className="h-3 w-3" />
                            Open
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        ${pos.avgBuyPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {pos.status === "open" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          `$${pos.avgSellPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        )}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <div className="flex flex-col items-end gap-0.5">
                          <span>{pos.totalSharesSold.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          {(pos.status === "partial" || pos.status === "open") && (
                            <span className="text-xs text-muted-foreground">
                              of {pos.totalSharesBought.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {pos.status === "open" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          `$${Math.round(pos.costOfSoldShares).toLocaleString("en-US")}`
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {pos.status === "open" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          `$${Math.round(pos.totalProceeds).toLocaleString("en-US")}`
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {pos.status === "open" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? (
                                <ArrowUpRight className="h-4 w-4 text-primary" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                              )}
                              <span className={`font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
                                {isPositive ? "+" : ""}${Math.round(pos.realizedPnL).toLocaleString("en-US")}
                              </span>
                            </div>
                            <span className={`text-xs ${isPositive ? "text-primary/70" : "text-destructive/70"}`}>
                              {isPositive ? "+" : ""}{pos.realizedReturnPercent.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="flex items-center gap-1 text-foreground">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDuration(pos.holdingPeriodDays)}
                            {pos.status === "open" && (
                              <span className="text-xs text-muted-foreground ml-0.5">so far</span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pos.trades} trade{pos.trades !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
