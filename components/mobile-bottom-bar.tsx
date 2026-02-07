"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { RefreshCw, Download, FileSpreadsheet, Plus, Moon, Sun, BookOpen, Info } from "lucide-react"
import { useTheme } from "next-themes"
import { useStockPrices } from "@/lib/stock-price-context"
import { useTransactions } from "@/lib/transactions-store"
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog"
import { AddBatchDialog } from "@/components/portfolio/add-batch-dialog"

export function MobileBottomBar() {
  const { isLoading, refresh } = useStockPrices()
  const transactions = useTransactions()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const isDark = mounted ? theme === "dark" : true

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      {/* Action Buttons — tab bar style */}
      <div className="border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-around px-1 py-1.5">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label="Refresh prices"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-[10px] font-medium leading-tight">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label="Export CSV"
          >
            <Download className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight">Export</span>
          </button>

          <AddBatchDialog
            trigger={
              <button
                type="button"
                className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Add batch"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">Batch</span>
              </button>
            }
          />

          <AddTransactionDialog
            trigger={
              <button
                type="button"
                className="flex flex-1 flex-col items-center gap-0.5 py-1 text-primary transition-colors hover:text-primary/80"
                aria-label="Add transaction"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium leading-tight">Add</span>
              </button>
            }
          />

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="text-[10px] font-medium leading-tight">Theme</span>
          </button>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="border-t border-border/50 bg-card px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} OpenStocky
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="h-3 w-3" />
              Help
            </Link>
            <Link
              href="/about-us"
              className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="h-3 w-3" />
              About
            </Link>
          </div>
        </div>
      </div>

      {/* Safe area inset for devices with home indicators (iPhone etc.) */}
      <div className="bg-card" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  )
}
