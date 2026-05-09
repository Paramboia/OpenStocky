import type { ClosedPosition, Holding } from "@/lib/portfolio-data"

export type PositionChartView = "all" | "closed" | "open"

export interface PositionChartDatum {
  symbol: string
  status: ClosedPosition["status"]
  totalReturn: number
  totalReturnPercent: number
  unrealized: number
  realized: number
  value: number
}

function getClosedPositionValue(position: ClosedPosition) {
  return Math.max(position.costOfSoldShares, position.totalCost, position.totalProceeds, 0)
}

export function buildPositionChartData(
  holdings: Holding[],
  positions: ClosedPosition[],
  view: PositionChartView,
): PositionChartDatum[] {
  const positionBySymbol = new Map(positions.map((position) => [position.symbol, position]))

  const currentPositions = holdings.map((holding) => ({
    symbol: holding.symbol,
    status: positionBySymbol.get(holding.symbol)?.status ?? "open",
    totalReturn: holding.totalReturn,
    totalReturnPercent: holding.totalReturnPercent,
    unrealized: holding.gainLoss,
    realized: holding.realizedGainLoss,
    value: holding.currentValue,
  }))

  if (view === "open") {
    return currentPositions
  }

  const closedPositions = positions
    .filter((position) => position.status === "closed")
    .map((position) => ({
      symbol: position.symbol,
      status: position.status,
      totalReturn: position.realizedPnL,
      totalReturnPercent: position.realizedReturnPercent,
      unrealized: 0,
      realized: position.realizedPnL,
      value: getClosedPositionValue(position),
    }))

  if (view === "closed") {
    return closedPositions
  }

  return [...currentPositions, ...closedPositions]
}
