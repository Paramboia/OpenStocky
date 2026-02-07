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

// Calculate current holdings from transactions
// livePrices parameter allows passing real-time prices from the stock price API
export function calculateHoldings(
  livePrices?: Record<string, number>,
  transactionData: Transaction[] = transactions,
): Holding[] {
  const prices = livePrices && Object.keys(livePrices).length > 0 ? livePrices : currentPrices
  const holdingsMap = new Map<string, { shares: number; totalCost: number }>()

  // Track per-symbol realized gains using FIFO lots
  const realizedMap = new Map<string, number>()
  const fifoLots = new Map<string, { shares: number; costPerShare: number }[]>()
  // Track total capital invested per symbol (sum of all buys) for total return %
  const totalBuyCostMap = new Map<string, number>()

  for (const tx of transactionData) {
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
      // For sells, reduce shares and proportionally reduce cost basis
      const avgCost = current.shares > 0 ? current.totalCost / current.shares : 0
      current.shares -= tx.shares
      current.totalCost = Math.max(0, current.shares * avgCost)

      // FIFO realized gain calculation
      const lots = fifoLots.get(tx.symbol) || []
      let remaining = tx.shares
      let realized = realizedMap.get(tx.symbol) || 0

      while (remaining > 0.0001 && lots.length > 0) {
        const lot = lots[0]
        const consumed = Math.min(remaining, lot.shares)
        realized += consumed * (tx.pricePerShare - lot.costPerShare)
        lot.shares -= consumed
        remaining -= consumed
        if (lot.shares < 0.0001) lots.shift()
      }

      realized -= tx.fees
      realizedMap.set(tx.symbol, realized)
      fifoLots.set(tx.symbol, lots)
    }
    
    holdingsMap.set(tx.symbol, current)
  }

  const holdings: Holding[] = []
  
  holdingsMap.forEach((value, symbol) => {
    if (value.shares > 0.01) {
      const currentPrice = prices[symbol] || 0
      const currentValue = value.shares * currentPrice
      const gainLoss = currentValue - value.totalCost
      const gainLossPercent = value.totalCost > 0 ? (gainLoss / value.totalCost) * 100 : 0
      const realizedGainLoss = realizedMap.get(symbol) || 0
      const totalReturn = gainLoss + realizedGainLoss
      const totalBuyCost = totalBuyCostMap.get(symbol) || value.totalCost
      const totalReturnPercent = totalBuyCost > 0 ? (totalReturn / totalBuyCost) * 100 : 0

      holdings.push({
        symbol,
        shares: value.shares,
        avgCost: value.totalCost / value.shares,
        totalCost: value.totalCost,
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

// Calculate total portfolio stats
// livePrices parameter allows passing real-time prices from the stock price API
export function calculatePortfolioStats(
  livePrices?: Record<string, number>,
  transactionData: Transaction[] = transactions,
) {
  const holdings = calculateHoldings(livePrices, transactionData)
  const prices = livePrices && Object.keys(livePrices).length > 0 ? livePrices : currentPrices
  
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  // Calculate realized gains from all sell transactions using FIFO lot-based queue
  // Supports fractional shares correctly
  let realizedGains = 0
  const costBasisLots = new Map<string, { shares: number; costPerShare: number }[]>()

  for (const tx of transactionData) {
    if (tx.type === "buy") {
      const lots = costBasisLots.get(tx.symbol) || []
      lots.push({
        shares: tx.shares,
        costPerShare: tx.pricePerShare + tx.fees / tx.shares,
      })
      costBasisLots.set(tx.symbol, lots)
    } else if (tx.type === "sell") {
      const lots = costBasisLots.get(tx.symbol) || []
      let remaining = tx.shares

      while (remaining > 0.0001 && lots.length > 0) {
        const lot = lots[0]
        const consumed = Math.min(remaining, lot.shares)

        realizedGains += consumed * (tx.pricePerShare - lot.costPerShare)
        lot.shares -= consumed
        remaining -= consumed

        if (lot.shares < 0.0001) {
          lots.shift() // lot fully consumed
        }
      }

      realizedGains -= tx.fees
      costBasisLots.set(tx.symbol, lots)
    }
  }

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

  // Winners vs Losers count
  const winners = holdings.filter(h => h.gainLoss >= 0).length
  const losers = holdings.filter(h => h.gainLoss < 0).length

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
  // netInvested = buys - sell proceeds; represents real cash deployed
  let cagr = 0
  if (netInvested > 0 && totalValue > 0) {
    cagr = (Math.pow(totalValue / netInvested, 1 / yearsInvested) - 1) * 100
  } else if (netInvested <= 0 && totalValue > 0) {
    // User has already withdrawn more than invested — portfolio is "free money"
    // CAGR is not meaningful here; fall back to IRR later
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
  
  // 3. Win Rate
  const winRate = holdings.length > 0 ? (winners / holdings.length) * 100 : 0
  
  // 4. Profit Factor (gross profits / gross losses)
  const grossProfits = holdings.filter(h => h.gainLoss > 0).reduce((sum, h) => sum + h.gainLoss, 0)
  const grossLosses = Math.abs(holdings.filter(h => h.gainLoss < 0).reduce((sum, h) => sum + h.gainLoss, 0))
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? Infinity : 0
  
  // 5. Average Win vs Average Loss
  const avgWin = winners > 0 
    ? holdings.filter(h => h.gainLoss > 0).reduce((sum, h) => sum + h.gainLoss, 0) / winners 
    : 0
  const avgLoss = losers > 0 
    ? Math.abs(holdings.filter(h => h.gainLoss < 0).reduce((sum, h) => sum + h.gainLoss, 0) / losers)
    : 0
  
  // 6. Risk/Reward Ratio
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0
  
  // 7. Portfolio Concentration (Herfindahl-Hirschman Index)
  // HHI ranges from 0 to 10000, higher = more concentrated
  const hhi = totalValue > 0 
    ? holdings.reduce((sum, h) => {
        const weight = (h.currentValue / totalValue) * 100
        return sum + weight * weight
      }, 0)
    : 0
  
  // 8. Top 5 Concentration (% of portfolio in top 5 holdings)
  const top5Value = holdings.slice(0, 5).reduce((sum, h) => sum + h.currentValue, 0)
  const top5Concentration = totalValue > 0 ? (top5Value / totalValue) * 100 : 0
  
  // 9. Portfolio Beta estimate (simplified - based on tech-heavy holdings)
  // This is a rough estimate; real beta would require historical price data
  const techSymbols = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "COIN", "SNOW", "CRWD", "GTLB", "RKLB"]
  const techValue = holdings
    .filter(h => techSymbols.includes(h.symbol))
    .reduce((sum, h) => sum + h.currentValue, 0)
  const techWeight = totalValue > 0 ? techValue / totalValue : 0
  const estimatedBeta = 1 + (techWeight * 0.5) // Tech adds volatility
  
  // 10. Dividend Yield estimate (for dividend-paying stocks we had)
  const dividendStocks = ["VZ", "PFE", "JNJ", "XOM", "CVX", "MO", "LTC"]
  const dividendValue = holdings
    .filter(h => dividendStocks.includes(h.symbol))
    .reduce((sum, h) => sum + h.currentValue, 0)
  const dividendYieldEstimate = totalValue > 0 ? (dividendValue / totalValue) * 3.5 : 0 // Rough 3.5% yield for div stocks
  
  // 11. Total Capital Deployed (lifetime)
  const totalCapitalDeployed = totalInvested
  
  // 12. Capital Efficiency (current value / total capital ever deployed)
  const capitalEfficiency = totalCapitalDeployed > 0 ? (totalValue / totalCapitalDeployed) * 100 : 0
  const totalReturnPercent = totalCapitalDeployed > 0 ? (totalReturn / totalCapitalDeployed) * 100 : 0
  
  // 13. Time in Market (days)
  const daysInMarket = Math.floor((today.getTime() - firstTxDate.getTime()) / (24 * 60 * 60 * 1000))
  
  // 14. Average Position Size
  const avgPositionSize = holdings.length > 0 ? totalValue / holdings.length : 0
  
  // 15. Volatility of returns (standard deviation of position returns)
  const returns = holdings.map(h => h.gainLossPercent)
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
  const variance = returns.length > 1 
    ? returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    : 0
  const volatility = Math.sqrt(variance)
  
  // 16. Sharpe-like Ratio (using 5% as risk-free rate proxy)
  const riskFreeRate = 5
  const sharpeRatio = volatility > 0 ? (avgGainLossPercent - riskFreeRate) / volatility : 0

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
    dividendYieldEstimate,
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
