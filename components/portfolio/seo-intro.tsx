/**
 * Server-rendered SEO content for crawlers and AI bots.
 * Rich, crawlable text describing OpenStocky and its features.
 */
export function SeoIntro() {
  return (
    <article
      className="rounded-lg border border-border bg-card/50 px-4 py-4 text-sm text-muted-foreground"
      aria-label="About OpenStocky"
    >
      <h2 className="text-base font-semibold text-foreground mb-2">About OpenStocky</h2>
      <p className="mb-2">
        OpenStocky is an open-source stock investment portfolio tracker. It does not require
        authentication, a database, or an account. You can track your portfolio entirely in your
        browser with a modern finance dashboard.
      </p>
      <p className="mb-2">
        All data lives in memory during your session — refreshing the page resets it. This design
        prioritizes privacy and simplicity: no backend storage, no user accounts, no data
        collection. Your financial data never leaves your device.
      </p>
      <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">Core Features</h3>
      <ul className="list-disc list-inside space-y-1 mb-2">
        <li>In-memory storage — transactions and portfolio state live only in the current tab</li>
        <li>Single transaction entry — add individual buy/sell transactions (date, symbol, shares, price, fees)</li>
        <li>Batch upload — paste CSV data from Excel to add or override transactions</li>
        <li>Live stock prices — integrates with Alpha Vantage for real-time quotes</li>
        <li>Theme toggle — light and dark mode</li>
      </ul>
      <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">Metrics and KPIs</h3>
      <p className="mb-2">
        OpenStocky displays portfolio value, net invested, total return (unrealized plus realized
        P/L), and unrealized and realized gains or losses. Advanced metrics include IRR (Internal
        Rate of Return), CAGR (Compound Annual Growth Rate), Sharpe ratio, volatility, win rate,
        profit factor, risk/reward ratio, beta estimate, portfolio concentration (HHI, top 5),
        total fees, capital deployed, capital efficiency, and         best performer.
      </p>
      <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">Dashboard</h3>
      <p className="mb-2">
        The holdings table shows symbol, shares, average cost, current price, value, P/L, and
        allocation. It is sortable and searchable. The transactions table lists buy/sell history
        with pagination, search by symbol, and filter by type. The allocation chart is a donut
        chart of portfolio weights (top 10 holdings plus Other). The performance chart shows net
        invested versus portfolio value over the last 24 months.
      </p>
      <p className="mb-0">
        OpenStocky is open source. You can audit and fork the code. Visit www.openstocky.com.
      </p>
    </article>
  )
}
