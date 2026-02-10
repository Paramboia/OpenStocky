import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

const SITE_URL = "https://www.openstocky.com"

export const metadata: Metadata = {
  title: "Help",
  description:
    "Learn how OpenStocky works: features, KPIs, and how metrics like IRR, CAGR, Sharpe ratio, and portfolio allocation are calculated.",
  openGraph: {
    title: "Help | OpenStocky",
    description: "Features and KPI calculation details for OpenStocky.",
    url: `${SITE_URL}/help`,
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "OpenStocky - Open source stock investment portfolio tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Help | OpenStocky",
    description: "Features and KPI calculation details for OpenStocky.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/help`,
  },
}

export default function HelpPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to portfolio
          </Button>
        </Link>

        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <BookOpen className="h-8 w-8" />
          Help
        </h1>
        <p className="mt-4 text-muted-foreground">
          Details on OpenStocky features and how each KPI is calculated.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Features</h2>

        <h3 className="mt-6 text-base font-semibold text-foreground">Transactions</h3>
        <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong>Single entry:</strong> Add one buy or sell at a time — date, symbol, shares, price per share, and fees. The total transaction cost (shares × price + fees for buys; shares × price − fees for sells) is computed automatically.
          </li>
          <li>
            <strong>Batch upload:</strong> Paste CSV data with columns: Transaction Date, Transaction Type, Symbol, Shares, Price per Share, Fees. Use comma or tab separators. Choose &quot;Add to current&quot; to append, or &quot;Override&quot; to replace all transactions.
          </li>
          <li>
            <strong>Cost basis:</strong> Buys add to cost basis; sells use FIFO (first-in, first-out) to compute realized gains. Transactions are automatically sorted by date before processing.
          </li>
          <li>
            <strong>Short-sell protection:</strong> Sell transactions are clamped so you cannot sell more shares than you currently hold for a given symbol.
          </li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-foreground">Holdings</h3>
        <p className="mt-2 text-muted-foreground">
          Holdings are derived from transactions: buys increase shares and cost basis; sells reduce shares and proportionally reduce cost basis (avg cost method). Unrealized P/L = (current price × shares) − total cost. Each holding also displays <strong>Total Return</strong> (unrealized P/L + realized gains from sold shares), computed using FIFO lot matching, so you can see the full picture of each position&apos;s performance.
        </p>

        <h3 className="mt-6 text-base font-semibold text-foreground">Trade History</h3>
        <p className="mt-2 text-muted-foreground">
          The <strong>History</strong> tab shows performance for every position where you have sold shares — both fully closed positions and partially reduced ones. For each symbol it displays:
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong>Status:</strong> &quot;Closed&quot; if all shares have been sold, or &quot;Partial&quot; if you still hold some.
          </li>
          <li>
            <strong>Avg Buy / Avg Sell:</strong> Volume-weighted average price per share across all buys and sells.
          </li>
          <li>
            <strong>Realized P/L:</strong> FIFO-based profit or loss from sold shares, including fees. Return percentage is relative to the cost basis of shares sold.
          </li>
          <li>
            <strong>Duration:</strong> Time from first buy to last sell. Also shows total trade count (buys + sells).
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Use the status filter (All / Closed / Partial) to focus on specific position types.
        </p>

        <h3 className="mt-6 text-base font-semibold text-foreground">Export CSV</h3>
        <p className="mt-2 text-muted-foreground">
          Click <strong>Export CSV</strong> in the header to download all your transactions as a CSV file. The exported file uses the same column format as the batch upload (Transaction Date, Transaction Type, Symbol, Shares, Price per Share, Fees), so you can re-import it later via batch upload.
        </p>

        <h3 className="mt-6 text-base font-semibold text-foreground">Market Performance</h3>
        <p className="mt-2 text-muted-foreground">
          The <strong>Market</strong> tab shows recent price performance and fundamentals for every stock you hold. Data is fetched from Yahoo Finance using daily closing prices and real-time quote data.
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong>1D / 7D / 1M:</strong> Price change (absolute and percentage) over the last 1 day, 7 days, and ~21 calendar days respectively. 7D and 1M are computed from daily historical closing prices.
          </li>
          <li>
            <strong>P/E:</strong> Trailing price-to-earnings ratio — current price divided by earnings per share over the last 12 months. Not available for ETFs or companies with negative earnings.
          </li>
          <li>
            <strong>52W Range:</strong> Visual bar showing where the current price sits between the 52-week low and high. Green near highs, red near lows. Hover for exact values.
          </li>
          <li>
            <strong>Mkt Cap:</strong> Total market capitalization of the company.
          </li>
          <li>
            <strong>Div Yield:</strong> Trailing annual dividend yield as a percentage of the current price. Shows &quot;—&quot; for non-dividend-paying stocks.
          </li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-foreground">Live Prices</h3>
        <p className="mt-2 text-muted-foreground">
          Stock prices come from Yahoo Finance via the <code className="rounded bg-muted px-1 py-0.5 text-xs">yahoo-finance2</code> library. No API key is required. All symbols are fetched in a single batch call with no rate limits or daily caps. Prices are cached for 60 seconds.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Charts</h2>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold text-foreground">Portfolio Growth</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Area chart tracking net invested capital (blue) vs portfolio value (green) over the last 24 months. The gap between the two lines represents unrealized gain or loss. Monthly snapshots are derived from transaction history; portfolio value uses actual monthly closing prices from Yahoo Finance. The current month uses live prices. Months without historical data fall back to the nearest available price or cost basis.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Portfolio Allocation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Donut chart showing the percentage weight of each holding by market value. The top 10 positions are displayed individually; smaller holdings are grouped as &quot;Other&quot;. Helps visualize concentration and diversification at a glance.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">P/L Attribution</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Horizontal bar chart showing each position&apos;s <strong>total return</strong> (unrealized + realized gains), sorted from best to worst. Includes profits from shares you&apos;ve already sold. Green bars represent gains, red bars represent losses. Hover for a breakdown of unrealized and realized components. Up to 20 positions are displayed. This chart instantly reveals which holdings are driving portfolio performance and which are dragging it down — a staple of institutional portfolio reporting.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Weight vs Return</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Scatter plot where each position is a bubble. The x-axis represents portfolio weight (allocation), the y-axis represents <strong>total return %</strong> (unrealized + realized), and bubble size reflects position value. A dashed line at 0% separates winners from losers. Positions in the top-right quadrant are large and profitable (ideal); bottom-right are large losers that may need attention; top-left are small winners you could consider sizing up.
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          <strong>Tip:</strong> Hover over the <strong>(i)</strong> icon next to each chart title for a quick explanation of what the chart shows.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">How KPIs Are Calculated</h2>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold text-foreground">Portfolio Value</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sum of (shares × current price) for all holdings. Uses live prices when available; otherwise $0.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Net Invested</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Total cost of all buy transactions minus total proceeds from all sell transactions. Represents capital currently at risk.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Unrealized P/L</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Portfolio value minus total cost basis of open positions. Percentage = (unrealized P/L ÷ total cost) × 100.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Realized P/L</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Gains/losses from closed positions. Each sell is matched with buys using FIFO: realized gain = (sell price − buy cost per share) × shares − fees.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Total Return</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Unrealized P/L + Realized P/L. Total profit or loss across all positions (open and closed).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Total Return (per symbol)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Shown in the Holdings table&apos;s &quot;Total Return&quot; column. For each holding: unrealized P/L on the current position + realized gains/losses from shares already sold (FIFO). Percentage = total return ÷ total capital ever bought for that symbol. This metric captures the complete picture for positions where you have partially taken profits.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">IRR (Internal Rate of Return)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Money-weighted annualized return. Uses Newton-Raphson to find the discount rate that makes NPV of cash flows (buys = negative, sells = positive, current portfolio value = final positive flow) equal to zero. Accounts for timing and size of contributions and withdrawals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">CAGR (Compound Annual Growth Rate)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (Portfolio value ÷ net invested)<sup>1/years</sup> − 1, expressed as %. Net invested = total buys − total sell proceeds, representing actual capital at risk. Years = days since first transaction ÷ 365.25. If net invested ≤ 0 (you have withdrawn more than you put in), CAGR shows ∞.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Sharpe Ratio</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (IRR − 5%) ÷ annualized volatility. Uses IRR as the annualized return and 5% as risk-free proxy. Higher = better risk-adjusted return. Requires at least 3 months of history.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Volatility</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Annualized standard deviation of monthly portfolio returns, computed using the Modified Dietz method to account for cash flows (buys and sells). Monthly return = (V<sub>end</sub> − V<sub>start</sub> − CF) ÷ (V<sub>start</sub> + 0.5 × CF), then annualized by multiplying by √12. Requires historical prices.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Win Rate</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (Number of profitable positions ÷ total positions) × 100. Includes both open positions (unrealized P/L) and closed trades (realized P/L from sells).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Profit Factor</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sum of gains from winners ÷ sum of losses from losers, across both open and closed positions. &gt; 1 means profits exceed losses.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Risk/Reward Ratio</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Average win ÷ average loss, including both open and closed positions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">HHI (Herfindahl-Hirschman Index)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sum of (weight %)<sup>2</sup> for each holding. Ranges 0–10000. 0–1500 = diversified; 1500–2500 = moderate; 2500+ = concentrated.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Top 5 Concentration</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (Value of top 5 holdings ÷ portfolio value) × 100. Share of portfolio in largest positions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Beta</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Value-weighted average of per-stock betas fetched from Yahoo Finance. Each holding&apos;s beta is weighted by its share of portfolio value. Stocks without beta data default to 1.0 (market average). A portfolio beta above 1 suggests higher volatility than the market; below 1 suggests lower.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Capital Efficiency</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (Portfolio value ÷ total capital ever deployed in buys) × 100. &gt; 100% means gains exceed invested capital.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
