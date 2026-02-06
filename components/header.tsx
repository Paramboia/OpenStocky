"use client"

import Link from "next/link"
import { TrendingUp, Activity, RefreshCw } from "lucide-react"
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground hover:opacity-90 transition-opacity"
            aria-label="OpenStocky home"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">OpenStocky</span>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
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
          </div>
          <AddBatchDialog />
          <AddTransactionDialog />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile: show stats on second row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pb-3 pt-0 sm:hidden">
        <span className="text-xs text-muted-foreground">
          {stats.daysInMarket.toLocaleString()} days in market ({stats.yearsInvested.toFixed(1)} years)
        </span>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-xs text-muted-foreground">
          {stats.totalTransactions} transactions
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        {lastUpdated && (
          <>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground">
              Updated {formatLastUpdated(lastUpdated)}
            </span>
          </>
        )}
      </div>
    </header>
  )
}
