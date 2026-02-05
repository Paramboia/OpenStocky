import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { HoldingsTable } from "@/components/portfolio/holdings-table"
import { TransactionsTable } from "@/components/portfolio/transactions-table"
import { AllocationChart } from "@/components/portfolio/allocation-chart"
import { PerformanceChart } from "@/components/portfolio/performance-chart"
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <PortfolioHeader />
            <div className="shrink-0">
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
