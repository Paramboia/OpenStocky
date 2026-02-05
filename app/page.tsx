import { StockPriceProvider } from "@/lib/stock-price-context"
import { PortfolioContent } from "@/components/portfolio/portfolio-content"

export default function PortfolioPage() {
  return (
    <StockPriceProvider>
      <PortfolioContent />
    </StockPriceProvider>
  )
}
