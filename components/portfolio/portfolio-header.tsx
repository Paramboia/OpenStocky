"use client"

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity, DollarSign, PiggyBank, Target, Trophy, AlertTriangle, PieChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { calculatePortfolioStats, calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"

export function PortfolioHeader() {
  const { prices } = useStockPrices()
  const stats = calculatePortfolioStats(prices)
  const holdings = calculateHoldings(prices)

  const isPositive = stats.totalGainLoss >= 0
  const isRealizedPositive = stats.realizedGains >= 0
  const isTotalReturnPositive = stats.totalReturn >= 0

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

      {/* Primary KPIs - Full Width Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cost basis: ${stats.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${isTotalReturnPositive ? "bg-primary/10" : "bg-destructive/10"}`}>
                <DollarSign className={`h-7 w-7 ${isTotalReturnPositive ? "text-primary" : "text-destructive"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${isTotalReturnPositive ? "text-primary" : "text-destructive"}`}>
                  {isTotalReturnPositive ? "+" : ""}${Math.round(stats.totalReturn).toLocaleString("en-US")}
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${isTotalReturnPositive ? "text-primary" : "text-destructive"}`}>
                  {isTotalReturnPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stats.totalReturnPercent).toFixed(1)}% all time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${isPositive ? "bg-primary/10" : "bg-destructive/10"}`}>
                {isPositive ? (
                  <TrendingUp className="h-7 w-7 text-primary" />
                ) : (
                  <TrendingDown className="h-7 w-7 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Unrealized P/L</p>
                <p className={`text-2xl font-bold ${isPositive ? "text-primary" : "text-destructive"}`}>
                  {isPositive ? "+" : ""}${Math.round(stats.totalGainLoss).toLocaleString("en-US")}
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? "text-primary" : "text-destructive"}`}>
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stats.totalGainLossPercent).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${isRealizedPositive ? "bg-primary/10" : "bg-destructive/10"}`}>
                <PiggyBank className={`h-7 w-7 ${isRealizedPositive ? "text-primary" : "text-destructive"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Realized P/L</p>
                <p className={`text-2xl font-bold ${isRealizedPositive ? "text-primary" : "text-destructive"}`}>
                  {isRealizedPositive ? "+" : ""}${Math.round(stats.realizedGains).toLocaleString("en-US")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">From closed positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs - Smaller Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Activity className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Positions</p>
                <p className="text-lg font-bold text-foreground">{holdings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Winners</p>
                <p className="text-lg font-bold text-primary">{stats.winners}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Losers</p>
                <p className="text-lg font-bold text-destructive">{stats.losers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Return</p>
                <p className={`text-lg font-bold ${stats.avgGainLossPercent >= 0 ? "text-primary" : "text-destructive"}`}>
                  {stats.avgGainLossPercent >= 0 ? "+" : ""}{stats.avgGainLossPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best</p>
                <p className="text-lg font-bold text-primary">
                  {stats.bestPerformer?.symbol || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <PieChart className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top Holding</p>
                <p className="text-lg font-bold text-foreground">
                  {stats.largestHolding?.symbol || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
