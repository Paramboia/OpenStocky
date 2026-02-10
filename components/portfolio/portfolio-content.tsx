"use client"

import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { HoldingsTable } from "@/components/portfolio/holdings-table"
import { TransactionsTable } from "@/components/portfolio/transactions-table"
import { AllocationChart } from "@/components/portfolio/allocation-chart"
import { PerformanceChart } from "@/components/portfolio/performance-chart"
import { PlAttributionChart } from "@/components/portfolio/pl-attribution-chart"
import { RiskReturnChart } from "@/components/portfolio/risk-return-chart"
import { MarketPerformanceTable } from "@/components/portfolio/market-performance-table"
import { HistoryTable } from "@/components/portfolio/history-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PortfolioContent() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full px-4 py-8">
        <div className="flex flex-col gap-6">
          <PortfolioHeader />

          <div className="grid gap-6 lg:grid-cols-2">
            <PerformanceChart />
            <AllocationChart />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PlAttributionChart />
            <RiskReturnChart />
          </div>

          <Tabs defaultValue="holdings" className="w-full" role="tablist" aria-label="Holdings and transactions">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger 
                value="holdings" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
              >
                Holdings
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
              >
                Market
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground"
              >
                History
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
            <TabsContent value="market" className="mt-6">
              <MarketPerformanceTable />
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <HistoryTable />
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
