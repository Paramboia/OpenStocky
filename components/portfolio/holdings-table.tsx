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

function compareSignedPercentThenAmount(
  aPercent: number,
  aAmount: number,
  bPercent: number,
  bAmount: number,
  direction: SortDirection,
) {
  const mod = direction === "asc" ? -1 : 1
  const aPositive = aPercent >= 0
  const bPositive = bPercent >= 0

  if (aPositive !== bPositive) {
    return aPositive ? -1 * mod : 1 * mod
  }

  if (aPercent !== bPercent) {
    return (bPercent - aPercent) * mod
  }

  if (aAmount !== bAmount) {
    return (bAmount - aAmount) * mod
  }

  return 0
}

export function HoldingsTable() {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("currentValue")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const holdings = calculateHoldings(prices, transactions)

  const filteredHoldings = holdings.filter((h) =>
    h.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (sortKey === "gainLoss") {
      return compareSignedPercentThenAmount(
        a.gainLossPercent,
        a.gainLoss,
        b.gainLossPercent,
        b.gainLoss,
        sortDirection,
      )
    }

    if (sortKey === "totalReturn") {
      return compareSignedPercentThenAmount(
        a.totalReturnPercent,
        a.totalReturn,
        b.totalReturnPercent,
        b.totalReturn,
        sortDirection,
      )
    }

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
        {holdings.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground">
            Add transactions to see your holdings
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
                    onClick={() => handleSort("gainLoss")}
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
                    onClick={() => handleSort("totalReturn")}
                  >
                    Total Return
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => {
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
        )}
      </CardContent>
    </Card>
  )
}
