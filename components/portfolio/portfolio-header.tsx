"use client"

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { calculatePortfolioStats, calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"

export function PortfolioHeader() {
  const { prices } = useStockPrices()
  const stats = calculatePortfolioStats(prices)
  const holdings = calculateHoldings(prices)

  const isPositive = stats.totalGainLoss >= 0
  const isRealizedPositive = stats.realizedGains >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your investments and performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>{stats.totalTransactions} transactions</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPositive ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unrealized P/L</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-xl font-bold ${isPositive ? "text-primary" : "text-destructive"}`}>
                      {isPositive ? "+" : ""}${Math.round(stats.totalGainLoss).toLocaleString("en-US")}
                    </p>
                    <span className={`flex items-center text-sm ${isPositive ? "text-primary" : "text-destructive"}`}>
                      {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(stats.totalGainLossPercent).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isRealizedPositive ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {isRealizedPositive ? (
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Realized P/L</p>
                  <p className={`text-xl font-bold ${isRealizedPositive ? "text-primary" : "text-destructive"}`}>
                    {isRealizedPositive ? "+" : ""}${Math.round(stats.realizedGains).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Activity className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold text-foreground">{holdings.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
