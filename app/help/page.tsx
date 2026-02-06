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
            <strong>Cost basis:</strong> Buys add to cost basis; sells use FIFO (first-in, first-out) to compute realized gains.
          </li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-foreground">Holdings</h3>
        <p className="mt-2 text-muted-foreground">
          Holdings are derived from transactions: buys increase shares and cost basis; sells reduce shares and proportionally reduce cost basis (avg cost method). Unrealized P/L = (current price × shares) − total cost.
        </p>

        <h3 className="mt-6 text-base font-semibold text-foreground">Live Prices</h3>
        <p className="mt-2 text-muted-foreground">
          Stock prices come from Yahoo Finance via the <code className="rounded bg-muted px-1 py-0.5 text-xs">yahoo-finance2</code> library. No API key is required. All symbols are fetched in a single batch call with no rate limits or daily caps. Prices are cached for 60 seconds.
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
              (Average position return − 5%) ÷ volatility. Uses 5% as risk-free proxy. Volatility = standard deviation of each holding&apos;s gain/loss %. Higher = better risk-adjusted return.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Volatility</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Standard deviation of gain/loss % across all positions. Measures dispersion of returns.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Win Rate</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              (Number of positions with positive P/L ÷ total positions) × 100.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Profit Factor</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sum of gains from winning positions ÷ sum of losses from losing positions. &gt; 1 means profits exceed losses.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Risk/Reward Ratio</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Average win (avg P/L of winning positions) ÷ average loss (avg absolute P/L of losing positions).
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
            <h3 className="font-semibold text-foreground">Beta (estimate)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Simplified: 1 + (tech weight × 0.5). Tech-heavy portfolios are assumed more volatile. Real beta requires historical price data.
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
