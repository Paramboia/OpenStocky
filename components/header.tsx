"use client"

import Image from "next/image"
import Link from "next/link"
import { Activity, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStockPrices } from "@/lib/stock-price-context"
import { calculatePortfolioStats } from "@/lib/portfolio-data"
import { useTransactions } from "@/lib/transactions-store"
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog"
import { AddBatchDialog } from "@/components/portfolio/add-batch-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const { prices, isLoading, lastUpdated, refresh } = useStockPrices()
  const transactions = useTransactions()
  const stats = calculatePortfolioStats(prices, transactions)

  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return null
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleExportCsv = () => {
    if (transactions.length === 0) return

    const header = "Transaction Date,Transaction Type,Symbol,Shares,Price per Share,Fees"
    const rows = [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((tx) =>
        [
          tx.date,
          tx.type === "buy" ? "Buy" : "Sell",
          tx.symbol,
          tx.shares,
          tx.pricePerShare,
          tx.fees,
        ].join(",")
      )

    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `openstocky-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Brand + stats */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 text-foreground hover:opacity-90 transition-opacity"
            aria-label="OpenStocky home"
          >
            <Image
              src="/logo.webp"
              alt="OpenStocky logo"
              width={36}
              height={36}
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg"
              priority
            />
            <span className="text-base sm:text-lg font-bold tracking-tight">OpenStocky</span>
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-sm text-muted-foreground">
              {stats.daysInMarket.toLocaleString()} days in market ({stats.yearsInvested.toFixed(1)} years)
            </span>
            <div className="flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>{stats.totalTransactions} transactions</span>
            </div>
          </div>
        </div>

        {/* Desktop action buttons — hidden on mobile */}
        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh Prices"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <AddBatchDialog />
          <AddTransactionDialog />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile: compact stats row — visible only on mobile */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-4 pb-2.5 pt-0 sm:hidden">
        <span className="text-[11px] text-muted-foreground">
          {stats.daysInMarket.toLocaleString()} days ({stats.yearsInvested.toFixed(1)}y)
        </span>
        <span className="text-muted-foreground/40">·</span>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>{stats.totalTransactions} txns</span>
        </div>
        {lastUpdated && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-muted-foreground">
              Updated {formatLastUpdated(lastUpdated)}
            </span>
          </>
        )}
      </div>
    </header>
  )
}
