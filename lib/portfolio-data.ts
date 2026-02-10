export interface Transaction {
  id: string
  date: string
  type: "buy" | "sell"
  symbol: string
  shares: number
  pricePerShare: number
  fees: number
  transactionCost: number
  comments?: string
}

export interface Holding {
  symbol: string
  shares: number
  avgCost: number
  totalCost: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
  realizedGainLoss: number
  totalReturn: number
  totalReturnPercent: number
}

// Parse the raw transaction data
export const transactions: Transaction[] = []

// Current prices are intentionally empty; live prices should come from the in-memory store/API.
export const currentPrices: Record<string, number> = {}

// --- Internal types ---

interface FifoLot {
  shares: number
  costPerShare: number
}

interface ClosedTrade {
  symbol: string
  realizedPnL: number
}

interface ProcessedTransactions {
  holdingsMap: Map<string, { shares: number; totalCost: number }>
  realizedMap: Map<string, number>
  fifoLots: Map<string, FifoLot[]>
  totalBuyCostMap: Map<string, number>
  totalRealizedGains: number
  closedTrades: ClosedTrade[]
}

// --- Internal FIFO processing (single source of truth) ---
// Sorts transactions by date, validates against short selling, and
// tracks closed trades for win rate.

function _processTransactions(
  transactionData: Transaction[],
): ProcessedTransactions {
  // Sort by date to ensure correct FIFO ordering
  const sorted = [...transactionData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const holdingsMap = new Map<string, { shares: number; totalCost: number }>()
  const realizedMap = new Map<string, number>()
  const fifoLots = new Map<string, FifoLot[]>()
  const totalBuyCostMap = new Map<string, number>()
  let totalRealizedGains = 0
  const closedTrades: ClosedTrade[] = []

  for (const tx of sorted) {
    const current = holdingsMap.get(tx.symbol) || { shares: 0, totalCost: 0 }

    if (tx.type === "buy") {
      current.shares += tx.shares
      current.totalCost += tx.transactionCost

      // FIFO lot tracking
      const lots = fifoLots.get(tx.symbol) || []
      lots.push({ shares: tx.shares, costPerShare: tx.pricePerShare + tx.fees / tx.shares })
      fifoLots.set(tx.symbol, lots)

      // Accumulate total buy cost
      totalBuyCostMap.set(tx.symbol, (totalBuyCostMap.get(tx.symbol) || 0) + tx.transactionCost)
    } else {
      // Validate: clamp sell shares to available shares (prevent short selling)
      const availableShares = current.shares
      const sellShares = Math.min(tx.shares, availableShares)

      if (sellShares <= 0.0001) {
        // Nothing to sell — skip this transaction
        holdingsMap.set(tx.symbol, current)
        continue
      }

      // Reduce shares and cost basis
      const avgCost = current.shares > 0 ? current.totalCost / current.shares : 0
      current.shares -= sellShares
      current.totalCost = Math.max(0, current.shares * avgCost)

      // FIFO realized gain calculation
      const lots = fifoLots.get(tx.symbol) || []
      let remaining = sellShares
      let tradeRealized = 0

      while (remaining > 0.0001 && lots.length > 0) {
        const lot = lots[0]
        const consumed = Math.min(remaining, lot.shares)
        tradeRealized += consumed * (tx.pricePerShare - lot.costPerShare)
        lot.shares -= consumed
        remaining -= consumed
        if (lot.shares < 0.0001) lots.shift()
      }

      tradeRealized -= tx.fees

      // Per-symbol accumulated realized
      const prevRealized = realizedMap.get(tx.symbol) || 0
      realizedMap.set(tx.symbol, prevRealized + tradeRealized)
      fifoLots.set(tx.symbol, lots)

      // Track as closed trade for win rate / profit factor
      totalRealizedGains += tradeRealized
      closedTrades.push({ symbol: tx.symbol, realizedPnL: tradeRealized })
    }

    holdingsMap.set(tx.symbol, current)
  }

  return {
    holdingsMap,
    realizedMap,
    fifoLots,
    totalBuyCostMap,
    totalRealizedGains,
    closedTrades,
  }
}

// --- Build Holding[] from processed data ---

function _buildHoldings(
  processed: ProcessedTransactions,
  prices: Record<string, number>,
): Holding[] {
  const { holdingsMap, realizedMap, fifoLots, totalBuyCostMap } = processed
  const holdings: Holding[] = []

  holdingsMap.forEach((value, symbol) => {
    if (value.shares > 0.01) {
      const currentPrice = prices[symbol] || 0
      const currentValue = value.shares * currentPrice

      // Compute cost basis from remaining FIFO lots — this reflects
      // the actual cost of the shares still held, not the blended
      // average across all historical buys.
      const remainingLots = fifoLots.get(symbol) || []
      const fifoCost = remainingLots.reduce((sum, lot) => sum + lot.shares * lot.costPerShare, 0)
      const totalCost = fifoCost > 0 ? fifoCost : value.totalCost

      const gainLoss = currentValue - totalCost
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
      const realizedGainLoss = realizedMap.get(symbol) || 0
      const totalReturn = gainLoss + realizedGainLoss
      const totalBuyCost = totalBuyCostMap.get(symbol) || totalCost
      const totalReturnPercent = totalBuyCost > 0 ? (totalReturn / totalBuyCost) * 100 : 0

      holdings.push({
        symbol,
        shares: value.shares,
        avgCost: totalCost / value.shares,
        totalCost,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
        realizedGainLoss,
        totalReturn,
        totalReturnPercent,
      })
    }
  })

  return holdings.sort((a, b) => b.currentValue - a.currentValue)
}

// Calculate current holdings from transactions
// livePrices parameter allows passing real-time prices from the stock price API
export function calculateHoldings(
  livePrices?: Record<string, number>,
  transactionData: Transaction[] = transactions,
): Holding[] {
  const prices = livePrices && Object.keys(livePrices).length > 0 ? livePrices : currentPrices
  const processed = _processTransactions(transactionData)
  return _buildHoldings(processed, prices)
}

// Helper: Calculate IRR using Newton-Raphson method
function calculateIRR(cashFlows: { date: Date; amount: number }[], guess = 0.1): number {
  if (cashFlows.length < 2) return 0
  
  const sortedFlows = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime())
  const firstDate = sortedFlows[0].date
  
  // Convert to years from first date
  const flows = sortedFlows.map(cf => ({
    years: (cf.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    amount: cf.amount
  }))
  
  // Newton-Raphson iteration
  let rate = guess
  for (let i = 0; i < 100; i++) {
    let npv = 0
    let dnpv = 0
    
    for (const flow of flows) {
      const factor = Math.pow(1 + rate, -flow.years)
      npv += flow.amount * factor
      dnpv -= flow.years * flow.amount * factor / (1 + rate)
    }
    
    if (Math.abs(npv) < 0.0001) break
    if (dnpv === 0) break
    
    rate = rate - npv / dnpv
    
    // Prevent extreme values
    if (rate < -0.99) rate = -0.99
    if (rate > 10) rate = 10
  }
  
  return rate * 100 // Return as percentage
}

// --- Monthly portfolio values for time-series volatility ---

function _computeMonthlyValues(
  sortedTx: Transaction[],
  historicalPrices: Record<string, Record<string, number>>,
  livePrices: Record<string, number>,
): { month: string; value: number; netCashFlow: number }[] {
  const holdings = new Map<string, { shares: number; totalCost: number }>()
  const snapshots = new Map<string, {
    holdings: Map<string, { shares: number; totalCost: number }>
    netCashFlow: number
  }>()
  const monthlyCashFlows = new Map<string, number>()

  for (const tx of sortedTx) {
    const txDate = new Date(tx.date)
    const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`

    const current = holdings.get(tx.symbol) || { shares: 0, totalCost: 0 }
    const prevCF = monthlyCashFlows.get(monthKey) || 0

    if (tx.type === "buy") {
      current.shares += tx.shares
      current.totalCost += tx.transactionCost
      monthlyCashFlows.set(monthKey, prevCF + tx.transactionCost)
    } else {
      const avgCost = current.shares > 0 ? current.totalCost / current.shares : 0
      const sellShares = Math.min(tx.shares, current.shares)
      current.shares -= sellShares
      current.totalCost = Math.max(0, current.shares * avgCost)
      monthlyCashFlows.set(monthKey, prevCF - tx.transactionCost)
    }

    holdings.set(tx.symbol, current)
    snapshots.set(monthKey, {
      holdings: new Map(Array.from(holdings, ([s, h]) => [s, { ...h }])),
      netCashFlow: monthlyCashFlows.get(monthKey) || 0,
    })
  }

  // Generate continuous month keys
  const firstTxDate = new Date(sortedTx[0].date)
  const firstMonth = `${firstTxDate.getFullYear()}-${String(firstTxDate.getMonth() + 1).padStart(2, "0")}`
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const allMonths: string[] = []
  {
    let [y, m] = firstMonth.split("-").map(Number)
    const [ey, em] = currentMonthKey.split("-").map(Number)
    while (y < ey || (y === ey && m <= em)) {
      allMonths.push(`${y}-${String(m).padStart(2, "0")}`)
      m++
      if (m > 12) { m = 1; y++ }
      if (allMonths.length > 1200) break
    }
  }

  // Fill gaps and value each month
  type HoldingsState = Map<string, { shares: number; totalCost: number }>
  const result: { month: string; value: number; netCashFlow: number }[] = []
  let lastHoldings: HoldingsState | null = null

  for (const mk of allMonths) {
    const snap = snapshots.get(mk)
    const currentHoldings: HoldingsState | null = snap ? snap.holdings : lastHoldings
    const netCashFlow = snap ? snap.netCashFlow : 0

    if (!currentHoldings) continue
    lastHoldings = new Map(Array.from(currentHoldings, ([s, h]) => [s, { ...h }]))

    let value = 0
    currentHoldings.forEach((h, symbol) => {
      if (h.shares <= 0) return
      let price: number | undefined

      // Current month: prefer live prices
      if (mk === currentMonthKey && livePrices[symbol] != null) {
        price = livePrices[symbol]
      }

      // Historical price for this month
      if (price === undefined) {
        price = historicalPrices[symbol]?.[mk]
      }

      // Carry forward: most recent price before this month
      if (price === undefined) {
        const symbolPrices = historicalPrices[symbol]
        if (symbolPrices) {
          const months = Object.keys(symbolPrices).sort()
          for (let i = months.length - 1; i >= 0; i--) {
            if (months[i] <= mk) { price = symbolPrices[months[i]]; break }
          }
        }
      }

      // Fallback: cost basis
      if (price === undefined) {
        price = h.shares > 0 ? h.totalCost / h.shares : 0
      }

      value += h.shares * price
    })

    result.push({ month: mk, value, netCashFlow })
  }

  return result
}

// Calculate total portfolio stats
// livePrices parameter allows passing real-time prices from the stock price API
export function calculatePortfolioStats(
  livePrices?: Record<string, number>,
  transactionData: Transaction[] = transactions,
  options?: {
    historicalPrices?: Record<string, Record<string, number>>
    stockBetas?: Record<string, number>
  },
) {
  const prices = livePrices && Object.keys(livePrices).length > 0 ? livePrices : currentPrices

  // Single FIFO pass — no duplicate computation
  const processed = _processTransactions(transactionData)
  const { totalRealizedGains, closedTrades } = processed
  const holdings = _buildHoldings(processed, prices)

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  // Realized gains from the single FIFO pass (no duplicate!)
  const realizedGains = totalRealizedGains

  // Best and worst performers
  const sortedByGain = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent)
  const bestPerformer = sortedByGain[0] || null
  const worstPerformer = sortedByGain[sortedByGain.length - 1] || null

  // Largest holding by value
  const largestHolding = holdings[0] || null

  // Average gain/loss per position
  const avgGainLossPercent = holdings.length > 0 
    ? holdings.reduce((sum, h) => sum + h.gainLossPercent, 0) / holdings.length 
    : 0

  // Total return (unrealized + realized)
  const totalReturn = totalGainLoss + realizedGains

  // Winners vs Losers (includes BOTH open positions AND closed trades)
  const openWinners = holdings.filter(h => h.gainLoss >= 0).length
  const openLosers = holdings.filter(h => h.gainLoss < 0).length
  const closedWinners = closedTrades.filter(t => t.realizedPnL >= 0).length
  const closedLosers = closedTrades.filter(t => t.realizedPnL < 0).length
  const winners = openWinners + closedWinners
  const losers = openLosers + closedLosers
  const totalPositions = winners + losers

  // Total fees paid
  const totalFees = transactionData.reduce((sum, tx) => sum + tx.fees, 0)

  // === ADVANCED KPIs ===
  
  // 1. CAGR (Compound Annual Growth Rate)
  const sortedTx = [...transactionData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstTxDate = sortedTx.length > 0 ? new Date(sortedTx[0].date) : new Date()
  const today = new Date()
  const yearsInvested = Math.max(0.01, (today.getTime() - firstTxDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  
  // Total invested over time (sum of all buys)
  const totalInvested = transactionData
    .filter(tx => tx.type === "buy")
    .reduce((sum, tx) => sum + tx.transactionCost, 0)
  
  // Total withdrawn (sum of all sells)
  const totalWithdrawn = transactionData
    .filter(tx => tx.type === "sell")
    .reduce((sum, tx) => sum + tx.transactionCost, 0)
  
  // Net invested = buys - sells
  const netInvested = totalInvested - totalWithdrawn
  
  // CAGR based on portfolio value vs net invested (actual capital at risk)
  let cagr = 0
  if (netInvested > 0 && totalValue > 0) {
    cagr = (Math.pow(totalValue / netInvested, 1 / yearsInvested) - 1) * 100
  } else if (netInvested <= 0 && totalValue > 0) {
    cagr = Infinity
  }
  
  // 2. IRR (Internal Rate of Return) - Money-Weighted Return
  const cashFlows: { date: Date; amount: number }[] = transactionData.map(tx => ({
    date: new Date(tx.date),
    amount: tx.type === "buy" ? -tx.transactionCost : tx.transactionCost
  }))
  // Add current portfolio value as final cash flow
  cashFlows.push({ date: today, amount: totalValue })
  
  const irr = calculateIRR(cashFlows)
  
  // 3. Win Rate (includes open AND closed positions)
  const winRate = totalPositions > 0 ? (winners / totalPositions) * 100 : 0
  
  // 4. Profit Factor (includes open AND closed positions)
  const openGrossProfits = holdings.filter(h => h.gainLoss > 0).reduce((sum, h) => sum + h.gainLoss, 0)
  const openGrossLosses = Math.abs(holdings.filter(h => h.gainLoss < 0).reduce((sum, h) => sum + h.gainLoss, 0))
  const closedGrossProfits = closedTrades.filter(t => t.realizedPnL > 0).reduce((sum, t) => sum + t.realizedPnL, 0)
  const closedGrossLosses = Math.abs(closedTrades.filter(t => t.realizedPnL < 0).reduce((sum, t) => sum + t.realizedPnL, 0))
  const grossProfits = openGrossProfits + closedGrossProfits
  const grossLosses = openGrossLosses + closedGrossLosses
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? Infinity : 0
  
  // 5. Average Win vs Average Loss (includes open AND closed)
  const avgWin = winners > 0
    ? (openGrossProfits + closedGrossProfits) / winners
    : 0
  const avgLoss = losers > 0
    ? (openGrossLosses + closedGrossLosses) / losers
    : 0
  
  // 6. Risk/Reward Ratio
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0
  
  // 7. Portfolio Concentration (Herfindahl-Hirschman Index)
  const hhi = totalValue > 0 
    ? holdings.reduce((sum, h) => {
        const weight = (h.currentValue / totalValue) * 100
        return sum + weight * weight
      }, 0)
    : 0
  
  // 8. Top 5 Concentration (% of portfolio in top 5 holdings)
  const top5Value = holdings.slice(0, 5).reduce((sum, h) => sum + h.currentValue, 0)
  const top5Concentration = totalValue > 0 ? (top5Value / totalValue) * 100 : 0
  
  // 9. Portfolio Beta (value-weighted average of per-stock betas from Yahoo Finance)
  // For holdings without beta data, assumes market beta (1.0)
  let estimatedBeta = 0
  if (options?.stockBetas && totalValue > 0) {
    for (const h of holdings) {
      const weight = h.currentValue / totalValue
      const beta = options.stockBetas[h.symbol]
      if (typeof beta === "number" && Number.isFinite(beta)) {
        estimatedBeta += beta * weight
      } else {
        // Default to market beta for unknown stocks
        estimatedBeta += 1.0 * weight
      }
    }
  }
  
  // 10. Total Capital Deployed (lifetime)
  const totalCapitalDeployed = totalInvested
  
  // 11. Capital Efficiency (current value / total capital ever deployed)
  const capitalEfficiency = totalCapitalDeployed > 0 ? (totalValue / totalCapitalDeployed) * 100 : 0
  const totalReturnPercent = totalCapitalDeployed > 0 ? (totalReturn / totalCapitalDeployed) * 100 : 0
  
  // 12. Time in Market (days)
  const daysInMarket = Math.floor((today.getTime() - firstTxDate.getTime()) / (24 * 60 * 60 * 1000))
  
  // 13. Average Position Size
  const avgPositionSize = holdings.length > 0 ? totalValue / holdings.length : 0
  
  // 14. Portfolio Volatility (time-series, from monthly returns)
  // Uses Modified Dietz method to compute monthly returns, then annualizes.
  // Requires historicalPrices to be provided; otherwise falls back to 0.
  let volatility = 0
  let sharpeRatio = 0

  if (options?.historicalPrices && Object.keys(options.historicalPrices).length > 0 && sortedTx.length > 0) {
    const monthlyValues = _computeMonthlyValues(sortedTx, options.historicalPrices, prices)

    if (monthlyValues.length >= 3) {
      // Compute monthly returns using Modified Dietz method
      const monthlyReturns: number[] = []
      for (let i = 1; i < monthlyValues.length; i++) {
        const prev = monthlyValues[i - 1]
        const curr = monthlyValues[i]
        // Modified Dietz: (V_end - V_start - CF) / (V_start + 0.5 * CF)
        const denom = prev.value + curr.netCashFlow * 0.5
        if (denom > 0) {
          const ret = (curr.value - prev.value - curr.netCashFlow) / denom
          monthlyReturns.push(ret * 100) // as percentage
        }
      }

      if (monthlyReturns.length >= 2) {
        const meanReturn = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length
        const variance = monthlyReturns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (monthlyReturns.length - 1)
        const monthlyVol = Math.sqrt(variance)
        volatility = monthlyVol * Math.sqrt(12) // Annualize

        // 15. Sharpe Ratio: (annualized return - risk-free) / annualized volatility
        // Uses IRR as the annualized return (money-weighted, already annualized)
        const riskFreeRate = 5 // 5% annual risk-free rate proxy
        sharpeRatio = volatility > 0 ? (irr - riskFreeRate) / volatility : 0
      }
    }
  }

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    realizedGains,
    holdingsCount: holdings.length,
    totalTransactions: transactionData.length,
    bestPerformer,
    worstPerformer,
    largestHolding,
    avgGainLossPercent,
    totalReturn,
    totalReturnPercent,
    winners,
    losers,
    totalFees,
    // Advanced KPIs
    cagr,
    irr,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    riskRewardRatio,
    hhi,
    top5Concentration,
    estimatedBeta,
    totalCapitalDeployed,
    capitalEfficiency,
    daysInMarket,
    yearsInvested,
    avgPositionSize,
    volatility,
    sharpeRatio,
    netInvested,
  }
}

// Get transactions for a specific symbol
export function getTransactionsBySymbol(symbol: string): Transaction[] {
  return transactions.filter((tx) => tx.symbol === symbol)
}

// Get recent transactions
export function getRecentTransactions(limit = 10): Transaction[] {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

// --- Closed / historical positions ---

export interface ClosedPosition {
  symbol: string
  status: "closed" | "partial" | "open"
  totalSharesBought: number
  totalSharesSold: number
  remainingShares: number
  totalCost: number          // total $ spent on buys
  costOfSoldShares: number   // FIFO cost basis of shares sold; 0 for open
  totalProceeds: number      // total $ received from sells (after fees); 0 for open
  totalFees: number          // buy + sell fees
  realizedPnL: number        // FIFO-based realized gain/loss; 0 for open
  realizedReturnPercent: number
  avgBuyPrice: number
  avgSellPrice: number       // 0 for open (no sells yet)
  firstBuyDate: string
  lastSellDate: string       // empty for open
  holdingPeriodDays: number  // first buy to last sell, or to "now" for open
  trades: number             // total number of buy + sell transactions
}

export function calculateClosedPositions(
  transactionData: Transaction[] = transactions,
): ClosedPosition[] {
  const sorted = [...transactionData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Aggregate per-symbol stats from raw transactions
  const symbolStats = new Map<
    string,
    {
      totalSharesBought: number
      totalSharesSold: number
      totalBuyCost: number      // shares × price (no fees)
      totalSellProceeds: number // shares × price (no fees)
      totalBuyFees: number
      totalSellFees: number
      firstBuyDate: string
      lastSellDate: string
      trades: number
    }
  >()

  for (const tx of sorted) {
    const s = symbolStats.get(tx.symbol) || {
      totalSharesBought: 0,
      totalSharesSold: 0,
      totalBuyCost: 0,
      totalSellProceeds: 0,
      totalBuyFees: 0,
      totalSellFees: 0,
      firstBuyDate: tx.date,
      lastSellDate: "",
      trades: 0,
    }

    s.trades += 1

    if (tx.type === "buy") {
      s.totalSharesBought += tx.shares
      s.totalBuyCost += tx.shares * tx.pricePerShare
      s.totalBuyFees += tx.fees
      if (!s.firstBuyDate || tx.date < s.firstBuyDate) s.firstBuyDate = tx.date
    } else {
      s.totalSharesSold += tx.shares
      s.totalSellProceeds += tx.shares * tx.pricePerShare
      s.totalSellFees += tx.fees
      if (!s.lastSellDate || tx.date > s.lastSellDate) s.lastSellDate = tx.date
    }

    symbolStats.set(tx.symbol, s)
  }

  // Use _processTransactions for FIFO-accurate realized P/L
  const processed = _processTransactions(sorted)

  const positions: ClosedPosition[] = []
  const today = new Date()

  symbolStats.forEach((s, symbol) => {
    const remainingShares = Math.max(0, s.totalSharesBought - s.totalSharesSold)
    const hasSells = s.totalSharesSold > 0.0001
    const status: "closed" | "partial" | "open" = !hasSells
      ? "open"
      : remainingShares < 0.01
        ? "closed"
        : "partial"

    const realizedPnL = processed.realizedMap.get(symbol) || 0

    // Cost of shares sold (FIFO). For open positions: 0.
    const costOfSold = hasSells ? s.totalSellProceeds - s.totalSellFees - realizedPnL : 0
    const realizedReturnPercent = costOfSold > 0 ? (realizedPnL / costOfSold) * 100 : 0

    const totalFees = s.totalBuyFees + s.totalSellFees

    const firstBuy = new Date(s.firstBuyDate)
    const endDate = hasSells ? new Date(s.lastSellDate) : today
    const holdingPeriodDays = Math.max(
      0,
      Math.round((endDate.getTime() - firstBuy.getTime()) / (24 * 60 * 60 * 1000)),
    )

    positions.push({
      symbol,
      status,
      totalSharesBought: s.totalSharesBought,
      totalSharesSold: s.totalSharesSold,
      remainingShares,
      totalCost: s.totalBuyCost + s.totalBuyFees,
      costOfSoldShares: costOfSold,
      totalProceeds: hasSells ? s.totalSellProceeds - s.totalSellFees : 0,
      totalFees,
      realizedPnL,
      realizedReturnPercent,
      avgBuyPrice: s.totalSharesBought > 0 ? s.totalBuyCost / s.totalSharesBought : 0,
      avgSellPrice: s.totalSharesSold > 0 ? s.totalSellProceeds / s.totalSharesSold : 0,
      firstBuyDate: s.firstBuyDate,
      lastSellDate: s.lastSellDate,
      holdingPeriodDays,
      trades: s.trades,
    })
  })

  // Sort: closed first, then partial, then open; within each by realized P/L desc (or totalCost desc for open)
  return positions.sort((a, b) => {
    const order = { closed: 0, partial: 1, open: 2 }
    if (a.status !== b.status) return order[a.status] - order[b.status]
    if (a.status === "open") return b.totalCost - a.totalCost
    return b.realizedPnL - a.realizedPnL
  })
}
