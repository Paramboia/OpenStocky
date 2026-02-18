"use client"

import { useState } from "react"
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Search, X } from "lucide-react"
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
import { calculateHoldings, type Holding } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"

type SortKey = keyof Holding
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

const perPage = 15

export function HoldingsTable() {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("currentValue")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)

  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)

  const filteredHoldings = holdings.filter((h) =>
    h.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    const modifier = sortDirection === "asc" ? 1 : -1

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * modifier
    }
    return String(aValue).localeCompare(String(bValue)) * modifier
  })

  const totalPages = Math.ceil(sortedHoldings.length / perPage)
  const paginatedHoldings = sortedHoldings.slice((page - 1) * perPage, page * perPage)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
    setPage(1)
  }

  const handleDualSort = (absKey: SortKey, pctKey: SortKey) => {
    const next = getDualSortNext(absKey, pctKey, sortKey, sortDirection)
    setSortKey(next.key)
    setSortDirection(next.direction)
    setPage(1)
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-foreground">Holdings</CardTitle>
            <p className="text-sm text-muted-foreground">
              {holdings.length > 0
                ? `${holdings.length} position${holdings.length !== 1 ? "s" : ""} • $${Math.round(totalValue).toLocaleString("en-US")} total value`
                : "Current positions derived from your transactions"}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
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
        {holdings.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground">
            Add transactions to see your holdings
          </div>
        ) : (
        <>
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
                <TableHead className="text-right text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("shares")}
                  >
                    Shares
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("avgCost")}
                  >
                    Avg Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("currentPrice")}
                  >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("currentValue")}
                  >
                    Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDualSort("gainLoss", "gainLossPercent")}
                  >
                    Unrealized
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDualSort("totalReturn", "totalReturnPercent")}
                  >
                    Total Return
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHoldings.map((holding) => {
                const isPositive = holding.gainLoss >= 0
                const isTotalPositive = holding.totalReturn >= 0
                const allocation = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0

                return (
                  <TableRow key={holding.symbol} className="border-border hover:bg-secondary/50">
                    <TableCell className="font-semibold text-foreground">{holding.symbol}</TableCell>
                    <TableCell className="text-right text-foreground">
                      {holding.shares.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      ${holding.avgCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      ${holding.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${Math.round(holding.currentValue).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
                          {isPositive ? "+" : ""}$
                          {Math.round(holding.gainLoss).toLocaleString("en-US")}
                        </span>
                        <span className={`text-xs ${isPositive ? "text-primary/70" : "text-destructive/70"}`}>
                          {isPositive ? "+" : ""}
                          {holding.gainLossPercent.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`font-medium ${isTotalPositive ? "text-primary" : "text-destructive"}`}>
                          {isTotalPositive ? "+" : ""}$
                          {Math.round(holding.totalReturn).toLocaleString("en-US")}
                        </span>
                        <span className={`text-xs ${isTotalPositive ? "text-primary/70" : "text-destructive/70"}`}>
                          {isTotalPositive ? "+" : ""}
                          {holding.totalReturnPercent.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(allocation, 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-muted-foreground">
                          {allocation.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sortedHoldings.length)} of {sortedHoldings.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-secondary border-border text-foreground hover:bg-secondary/80"
              >
                Previous
              </Button>
              <span className="text-sm text-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-secondary border-border text-foreground hover:bg-secondary/80"
              >
                Next
              </Button>
            </div>
          </div>
        )}
        </>
        )}
      </CardContent>
    </Card>
  )
}
