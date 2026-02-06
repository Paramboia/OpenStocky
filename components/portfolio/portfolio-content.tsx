"use client"

import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStockPrices } from "@/lib/stock-price-context"
import { calculatePortfolioStats } from "@/lib/portfolio-data"
import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { HoldingsTable } from "@/components/portfolio/holdings-table"
import { TransactionsTable } from "@/components/portfolio/transactions-table"
import { AllocationChart } from "@/components/portfolio/allocation-chart"
import { PerformanceChart } from "@/components/portfolio/performance-chart"
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog"
import { AddBatchDialog } from "@/components/portfolio/add-batch-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTransactions } from "@/lib/transactions-store"

export function PortfolioContent() {
  const { prices, isLoading, lastUpdated, refresh } = useStockPrices()
  const transactions = useTransactions()
  const stats = calculatePortfolioStats(prices, transactions)

  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return null
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full px-4 py-8">
        <div className="flex flex-col gap-6">
          <PortfolioHeader
            actions={
              <div className="flex flex-col items-end gap-1">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-xs text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>{stats.totalTransactions} transactions</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                    className="border-border text-foreground hover:bg-secondary bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Refreshing..." : "Refresh Prices"}
                  </Button>
                  <AddBatchDialog />
                  <AddTransactionDialog />
                  <ThemeToggle />
                </div>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {formatLastUpdated(lastUpdated)}
                  </span>
                )}
              </div>
            }
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <PerformanceChart />
            <AllocationChart />
          </div>

          <Tabs defaultValue="holdings" className="w-full">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger 
                value="holdings" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
              >
                Holdings
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
              >
                Transactions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="holdings" className="mt-6">
              <HoldingsTable />
            </TabsContent>
            <TabsContent value="transactions" className="mt-6">
              <TransactionsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
