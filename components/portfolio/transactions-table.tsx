"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Transaction } from "@/lib/portfolio-data"
import { removeTransaction, useTransactions } from "@/lib/transactions-store"

export function TransactionsTable() {
  const transactions = useTransactions()
  const [rows, setRows] = useState(transactions)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "buy" | "sell">("all")
  const [page, setPage] = useState(1)
  const [rowOffsets, setRowOffsets] = useState<Record<string, number>>({})
  const dragState = useRef({ id: "", startX: 0, startOffset: 0 })
  const perPage = 15
  const maxSwipeOffset = -96
  const revealThreshold = -8

  useEffect(() => {
    setRows(transactions)
    setPage(1)
  }, [transactions])

  const filteredTransactions = rows.filter((tx) => {
    const matchesSearch = tx.symbol.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || tx.type === typeFilter
    return matchesSearch && matchesType
  })

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalPages = Math.ceil(sortedTransactions.length / perPage)
  const paginatedTransactions = sortedTransactions.slice(
    (page - 1) * perPage,
    page * perPage
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handlePointerDown = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = {
      id,
      startX: event.clientX,
      startOffset: rowOffsets[id] ?? 0,
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current.id !== id) {
      return
    }
    event.preventDefault()
    const delta = event.clientX - dragState.current.startX
    const nextOffset = Math.min(0, Math.max(maxSwipeOffset, dragState.current.startOffset + delta))
    setRowOffsets((prev) => ({ ...prev, [id]: nextOffset }))
  }

  const handlePointerEnd = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current.id !== id) {
      return
    }
    event.preventDefault()
    const currentOffset = rowOffsets[id] ?? 0
    const shouldOpen = currentOffset < maxSwipeOffset / 2
    setRowOffsets((prev) => ({ ...prev, [id]: shouldOpen ? maxSwipeOffset : 0 }))
    dragState.current = { id: "", startX: 0, startOffset: 0 }
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handleDelete = (id: string) => {
    removeTransaction(id)
    setRowOffsets((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-foreground">Transaction History</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  onClick={() => { setSearch(""); setPage(1) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value: "all" | "buy" | "sell") => {
                setTypeFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-32 bg-secondary border-border text-foreground">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground">
            Add transactions to see your transaction history
          </div>
        ) : (
        <>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-secondary/50">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-right text-muted-foreground">Shares</TableHead>
                <TableHead className="text-right text-muted-foreground">Price</TableHead>
                <TableHead className="text-right text-muted-foreground">Fees</TableHead>
                <TableHead className="text-right text-muted-foreground">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-border">
                  <TableCell colSpan={7} className="p-0">
                    <div className="relative overflow-hidden">
                      <div
                        className="absolute inset-0 flex items-center justify-end gap-2 bg-destructive px-4 text-destructive-foreground transition-opacity duration-200"
                        style={{
                          opacity: (rowOffsets[tx.id] ?? 0) <= revealThreshold ? 1 : 0,
                          pointerEvents: (rowOffsets[tx.id] ?? 0) <= maxSwipeOffset ? "auto" : "none",
                        }}
                        role="button"
                        tabIndex={(rowOffsets[tx.id] ?? 0) <= maxSwipeOffset ? 0 : -1}
                        aria-label={`Delete transaction ${tx.symbol} ${formatDate(tx.date)}`}
                        onClick={() => handleDelete(tx.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="text-sm font-semibold">Delete</span>
                      </div>
                      <div
                        className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_1fr_0.8fr_1fr] items-center gap-0 bg-card px-4 py-4 text-foreground transition-transform duration-200 ease-out hover:bg-secondary/50"
                        style={{ transform: `translateX(${rowOffsets[tx.id] ?? 0}px)` }}
                        onPointerDown={(event) => handlePointerDown(tx.id, event)}
                        onPointerMove={(event) => handlePointerMove(tx.id, event)}
                        onPointerUp={(event) => handlePointerEnd(tx.id, event)}
                        onPointerCancel={(event) => handlePointerEnd(tx.id, event)}
                      >
                        <div>{formatDate(tx.date)}</div>
                        <div>
                          <Badge
                            variant={tx.type === "buy" ? "default" : "secondary"}
                            className={
                              tx.type === "buy"
                                ? "bg-primary/20 text-primary hover:bg-primary/30"
                                : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                            }
                          >
                            <span className="flex items-center gap-1">
                              {tx.type === "buy" ? (
                                <ArrowDownRight className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {tx.type.toUpperCase()}
                            </span>
                          </Badge>
                        </div>
                        <div className="font-semibold">{tx.symbol}</div>
                        <div className="text-right">
                          {tx.shares.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-right">
                          ${tx.pricePerShare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-right text-muted-foreground">
                          ${tx.fees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-right font-medium">
                            ${Math.round(tx.transactionCost).toLocaleString("en-US")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sortedTransactions.length)} of {sortedTransactions.length}
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
