"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStockPrices } from "@/lib/stock-price-context"
import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { HoldingsTable } from "@/components/portfolio/holdings-table"
import { TransactionsTable } from "@/components/portfolio/transactions-table"
import { AllocationChart } from "@/components/portfolio/allocation-chart"
import { PerformanceChart } from "@/components/portfolio/performance-chart"
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PortfolioContent() {
  const { isLoading, lastUpdated, refresh } = useStockPrices()

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <PortfolioHeader />
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-end gap-1">
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
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {formatLastUpdated(lastUpdated)}
                  </span>
                )}
              </div>
              <AddTransactionDialog />
            </div>
          </div>

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
