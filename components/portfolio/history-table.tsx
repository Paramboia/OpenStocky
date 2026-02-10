"use client"

import { useState } from "react"
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Search, X, Clock, CheckCircle2, MinusCircle } from "lucide-react"
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
  const [sortKey, setSortKey] = useState<SortKey>("realizedPnL")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [statusFilter, setStatusFilter] = useState<"all" | "closed" | "partial">("all")

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

  // Summary stats
  const totalRealized = positions.reduce((sum, p) => sum + p.realizedPnL, 0)
  const closedCount = positions.filter((p) => p.status === "closed").length
  const partialCount = positions.filter((p) => p.status === "partial").length
  const isTotalPositive = totalRealized >= 0

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-foreground">Trade History</CardTitle>
            <p className="text-sm text-muted-foreground">
              {positions.length > 0 ? (
                <>
                  <span className={isTotalPositive ? "text-primary font-medium" : "text-destructive font-medium"}>
                    {isTotalPositive ? "+" : ""}${Math.round(totalRealized).toLocaleString("en-US")}
                  </span>
                  {" "}realized across {closedCount} closed{partialCount > 0 ? ` and ${partialCount} partial` : ""} position{positions.length !== 1 ? "s" : ""}
                </>
              ) : (
                "Performance history for positions with sells"
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
            No sells yet — trade history will appear once you close or reduce a position
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
                      onClick={() => handleSort("realizedPnL")}
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
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <MinusCircle className="h-3 w-3" />
                            Partial
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        ${pos.avgBuyPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        ${pos.avgSellPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <div className="flex flex-col items-end gap-0.5">
                          <span>{pos.totalSharesSold.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          {pos.status === "partial" && (
                            <span className="text-xs text-muted-foreground">
                              of {pos.totalSharesBought.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ${Math.round(pos.totalProceeds).toLocaleString("en-US")}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="flex items-center gap-1 text-foreground">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDuration(pos.holdingPeriodDays)}
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
