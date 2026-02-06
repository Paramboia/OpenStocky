"use client"

import React from "react"

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity, DollarSign, PiggyBank, Target, Trophy, AlertTriangle, PieChart, Percent, BarChart3, Clock, Scale, Zap, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePortfolioStats, calculateHoldings } from "@/lib/portfolio-data"
import { useStockPrices } from "@/lib/stock-price-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTransactions } from "@/lib/transactions-store"

function KpiTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PortfolioHeader() {
  const { prices } = useStockPrices()
  const transactions = useTransactions()
  const stats = calculatePortfolioStats(prices, transactions)
  const holdings = calculateHoldings(prices, transactions)

  const isPositive = stats.totalGainLoss >= 0
  const isRealizedPositive = stats.realizedGains >= 0
  const isTotalReturnPositive = stats.totalReturn >= 0
  const isIrrPositive = stats.irr >= 0
  const isCagrPositive = stats.cagr >= 0
  const isSharpeGood = stats.sharpeRatio > 0

  return (
    <div className="space-y-6">
      {/* Primary KPIs - Full Width Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
                  Net invested: ${stats.netInvested.toLocaleString("en-US", { maximumFractionDigits: 0 })}
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

      {/* Advanced Performance Metrics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            <KpiTooltip content="Internal Rate of Return - Money-weighted annualized return accounting for timing and size of cash flows">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Percent className="h-3 w-3" /> IRR
                </p>
                <p className={`text-xl font-bold ${isIrrPositive ? "text-primary" : "text-destructive"}`}>
                  {isIrrPositive ? "+" : ""}{stats.irr.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">annualized</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Compound Annual Growth Rate - Smoothed annual return assuming constant growth rate">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> CAGR
                </p>
                <p className={`text-xl font-bold ${isCagrPositive ? "text-primary" : "text-destructive"}`}>
                  {isCagrPositive ? "+" : ""}{stats.cagr.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">per year</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Risk-adjusted return relative to volatility. Higher is better. Above 1 is good, above 2 is excellent">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Scale className="h-3 w-3" /> Sharpe
                </p>
                <p className={`text-xl font-bold ${isSharpeGood ? "text-primary" : "text-destructive"}`}>
                  {stats.sharpeRatio.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">risk-adjusted</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Standard deviation of position returns - Higher means more volatile portfolio">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> Volatility
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.volatility.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">std dev</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Percentage of positions currently in profit">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Win Rate
                </p>
                <p className={`text-xl font-bold ${stats.winRate >= 50 ? "text-primary" : "text-destructive"}`}>
                  {stats.winRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">{stats.winners}W / {stats.losers}L</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Ratio of gross profits to gross losses. Above 1 means profits exceed losses">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Profit Factor
                </p>
                <p className={`text-xl font-bold ${stats.profitFactor >= 1 ? "text-primary" : "text-destructive"}`}>
                  {stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">profit/loss</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Ratio of average winning trade to average losing trade">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" /> Risk/Reward
                </p>
                <p className={`text-xl font-bold ${stats.riskRewardRatio >= 1 ? "text-primary" : "text-destructive"}`}>
                  {stats.riskRewardRatio === Infinity ? "∞" : stats.riskRewardRatio.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">avg W/L</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Estimated portfolio beta based on sector allocation. Higher means more volatile relative to market">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Beta (est.)
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.estimatedBeta.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">vs market</p>
              </div>
            </KpiTooltip>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Composition & Efficiency */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Portfolio Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            <KpiTooltip content="Number of active positions in portfolio">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Positions
                </p>
                <p className="text-xl font-bold text-foreground">{holdings.length}</p>
                <p className="text-xs text-muted-foreground">active</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Average dollar value per position">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Avg Size
                </p>
                <p className="text-xl font-bold text-foreground">
                  ${(stats.avgPositionSize / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-muted-foreground">per position</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Percentage of portfolio value in top 5 holdings">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <PieChart className="h-3 w-3" /> Top 5
                </p>
                <p className={`text-xl font-bold ${stats.top5Concentration > 80 ? "text-warning" : "text-foreground"}`}>
                  {stats.top5Concentration.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">concentration</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Herfindahl-Hirschman Index - Portfolio concentration measure. 0-1500 diversified, 1500-2500 moderate, 2500+ concentrated">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> HHI
                </p>
                <p className={`text-xl font-bold ${stats.hhi > 2500 ? "text-warning" : "text-foreground"}`}>
                  {Math.round(stats.hhi).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{stats.hhi < 1500 ? "diversified" : stats.hhi < 2500 ? "moderate" : "concentrated"}</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Total fees paid across all transactions">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Total Fees
                </p>
                <p className="text-xl font-bold text-foreground">
                  ${stats.totalFees.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">all time</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Total capital ever deployed through buy transactions">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Deployed
                </p>
                <p className="text-xl font-bold text-foreground">
                  ${(stats.totalCapitalDeployed / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground">lifetime</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Current portfolio value as percentage of total capital ever deployed">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Efficiency
                </p>
                <p className={`text-xl font-bold ${stats.capitalEfficiency >= 100 ? "text-primary" : "text-destructive"}`}>
                  {stats.capitalEfficiency.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">capital util.</p>
              </div>
            </KpiTooltip>

            <KpiTooltip content="Best performing position currently">
              <div className="space-y-1 cursor-help">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Best
                </p>
                <p className="text-xl font-bold text-primary">
                  {stats.bestPerformer?.symbol || "-"}
                </p>
                <p className="text-xs text-primary">
                  {stats.bestPerformer ? `+${stats.bestPerformer.gainLossPercent.toFixed(0)}%` : "-"}
                </p>
              </div>
            </KpiTooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
