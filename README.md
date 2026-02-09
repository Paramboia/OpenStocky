# OpenStocky

**An open-source stock investment portfolio tracker** — no authentication, no database, no account required. Track your portfolio entirely in your browser with a modern finance dashboard.

[openstocky.com](https://openstocky.com)

---

## Overview

OpenStocky lets you track buy/sell transactions, compute holdings, view performance metrics, and analyze portfolio allocation. All data lives in memory during your session — refresh the page and it resets. This design prioritizes **privacy and simplicity**: no backend storage, no user accounts, no data collection.

---

## Features

### Core Functionality

- **In-Memory Storage** — Transactions and portfolio state live only in the current tab. No servers store your financial data.
- **Single Transaction Entry** — Add individual buy/sell transactions via a form (date, symbol, shares, price, fees).
- **Batch Upload** — Paste CSV data from Excel to add or replace transactions. Supports both append and override modes.
- **Export CSV** — Download all transactions as a CSV file, compatible with the batch upload format for easy re-import.
- **Live Stock Prices** — Integrates with [Yahoo Finance](https://finance.yahoo.com/) (via [`yahoo-finance2`](https://github.com/gadicc/yahoo-finance2)) to fetch real-time quotes for all your holdings in a single batch call. No API key required.
- **Theme Toggle** — Light and dark mode via `next-themes`.

### Metrics & KPIs

**Primary metrics:**
- Portfolio value & net invested
- Total return (unrealized + realized P/L) — both at portfolio level and per symbol
- Unrealized and realized gains/losses

**Advanced performance metrics:**
- **IRR** (Internal Rate of Return) — Money-weighted annualized return
- **CAGR** (Compound Annual Growth Rate) — Based on net invested capital
- **Sharpe Ratio** — Risk-adjusted return vs volatility
- **Volatility** — Standard deviation of position returns
- **Win Rate** — Percentage of positions in profit
- **Profit Factor** — Gross profits / gross losses
- **Risk/Reward Ratio** — Average win / average loss
- **Beta (estimate)** — Portfolio volatility vs market (sector-based approximation)

**Portfolio composition:**
- Number of positions & average position size
- Top 5 concentration & HHI (Herfindahl–Hirschman Index)
- Total fees, capital deployed, capital efficiency
- Best performer

### Dashboard UI

- **Holdings table** — Sortable columns (symbol, shares, avg cost, price, value, unrealized P/L, total return, allocation), search with clear button
- **Transactions table** — Paginated list, search by symbol, filter by buy/sell, swipe-to-delete on mobile
- **Portfolio Growth chart** — Area chart of net invested vs portfolio value over the last 24 months, using actual monthly closing prices from Yahoo Finance
- **Allocation chart** — Donut chart of portfolio weights (top 10 holdings + "Other")
- **P/L Attribution chart** — Horizontal bar chart of each position's total return (unrealized + realized), sorted best to worst
- **Risk vs Return chart** — Scatter/bubble plot: portfolio weight vs total return %, sized by position value
- **Info tooltips** — Every chart title has an (i) icon explaining how to read it

---

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | Next.js 15 (App Router)              |
| Language    | TypeScript                           |
| UI          | React 18, Radix UI, Tailwind CSS     |
| Charts      | Recharts                             |
| Data Fetch  | SWR for stock prices                 |
| State       | `useSyncExternalStore` (custom store)|
| Fonts       | Geist, Geist Mono                    |

---

## Project Structure

```
OpenStocky/
├── app/
│   ├── api/stock-prices/route.ts            # Yahoo Finance live price API
│   ├── api/stock-prices/historical/route.ts # Monthly historical prices API
│   ├── about-us/page.tsx           # About page
│   ├── help/page.tsx               # Help & KPI documentation
│   ├── globals.css
│   ├── layout.tsx                  # Root layout, SEO metadata, JSON-LD
│   ├── page.tsx
│   ├── robots.ts                   # Dynamic robots.txt
│   └── sitemap.ts                  # Dynamic sitemap.xml
├── components/
│   ├── header.tsx                  # Global sticky header
│   ├── footer.tsx                  # Global footer
│   ├── portfolio/                  # Portfolio-specific components
│   │   ├── add-batch-dialog.tsx    # CSV batch import
│   │   ├── add-transaction-dialog.tsx
│   │   ├── allocation-chart.tsx    # Donut chart
│   │   ├── holdings-table.tsx      # Holdings with total return
│   │   ├── performance-chart.tsx   # Invested vs value over time
│   │   ├── pl-attribution-chart.tsx # P/L attribution bar chart
│   │   ├── portfolio-content.tsx   # Main layout
│   │   ├── portfolio-header.tsx    # KPIs and metrics
│   │   ├── risk-return-chart.tsx   # Risk vs return scatter
│   │   └── transactions-table.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/                         # Radix-based UI primitives
├── lib/
│   ├── portfolio-data.ts           # Holdings, stats, IRR, KPIs, FIFO
│   ├── stock-price-context.tsx     # SWR + React context for prices
│   ├── transactions-store.ts       # In-memory transaction store
│   └── utils.ts
└── public/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/Paramboia/OpenStocky.git
cd OpenStocky
npm install
```

### Environment Variables

No environment variables are required to run the app. Stock prices are fetched via Yahoo Finance with no API key needed.

Optionally, you can enable Google Analytics and Tag Manager by setting these in a `.env.local` file (see `.env.example`):

| Variable              | Description                          | Required |
|----------------------|--------------------------------------|----------|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID      | No       |
| `NEXT_PUBLIC_GA_ID`  | Google Analytics 4 measurement ID    | No       |

If not set, analytics scripts are simply not loaded.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Batch Upload & Export

### Upload Format

Paste CSV data with these headers (comma- or tab-separated):

| Column            | Description                          |
|-------------------|--------------------------------------|
| Transaction Date  | `YYYY-MM-DD`                         |
| Transaction Type  | `Buy` or `Sell`                      |
| Symbol            | Ticker (e.g. AAPL, GOOGL)            |
| Shares            | Number of shares                     |
| Price per Share   | Price per share                      |
| Fees              | Transaction fees                     |

**Example:**

```csv
Transaction Date,Transaction Type,Symbol,Shares,Price per Share,Fees
2024-06-01,Buy,AAPL,10,185.12,1.00
2024-07-15,Sell,MSFT,5,420.50,0.99
```

**Import modes:**
- **Append** — Add new rows to existing transactions
- **Override** — Replace all transactions with the pasted data

### Export

Click **Export CSV** in the header to download all transactions. The exported file uses the same format as the upload, so it can be re-imported directly via batch upload.

---

## API

### Stock Prices

**Endpoint:** `GET /api/stock-prices?symbols=AAPL,GOOGL,MSFT`

**Response:**

```json
{
  "prices": { "AAPL": 185.42, "GOOGL": 142.10, "MSFT": 415.30 },
  "missingSymbols": [],
  "partial": false,
  "lastUpdated": "2025-02-06T12:00:00.000Z",
  "source": "Yahoo Finance"
}
```

- **No API key required** — Uses [`yahoo-finance2`](https://github.com/gadicc/yahoo-finance2), a community-maintained library for Yahoo Finance data.
- **No rate limits** — All symbols are fetched in a single batch call. No delays, no daily caps.
- Prices are cached for 60 seconds via `Cache-Control` headers.
- Up to 100 symbols per request (sane cap to keep payloads reasonable).

### Historical Prices

**Endpoint:** `GET /api/stock-prices/historical?symbols=AAPL,GOOGL&months=25`

**Response:**

```json
{
  "prices": {
    "AAPL": { "2024-01": 185.42, "2024-02": 190.75, "2024-03": 171.30 },
    "GOOGL": { "2024-01": 142.10, "2024-02": 147.50, "2024-03": 155.20 }
  },
  "lastUpdated": "2025-02-06T12:00:00.000Z"
}
```

- Returns monthly adjusted closing prices for each symbol.
- Uses the `yahoo-finance2` `historical()` method with `interval: "1mo"`.
- `months` parameter controls how far back to fetch (default 25, max 120).
- Cached for 1 hour — historical data rarely changes.

---

## Data & Privacy

- **No persistence** — All transactions and holdings exist only in memory. A refresh clears everything.
- **No auth** — No accounts, passwords, or user profiles.
- **Analytics** — The site uses Google Tag Manager and Google Analytics to track anonymous traffic and usage metrics. No personal or financial data is collected.
- **Self-hosted** — Deploy on your own infrastructure for full control.

---

## Limitations

1. **Session-only data** — Refreshing or closing the tab wipes all transactions. Use Export CSV to back up and batch upload to reimport.
2. **Yahoo Finance (unofficial)** — The `yahoo-finance2` library uses Yahoo's unofficial API. While the community has kept it working since 2013, Yahoo may change their endpoints at any time.
3. **US equities focus** — Yahoo Finance supports global symbols, but ticker validation is tuned for common US conventions.
4. **Historical performance** — The growth chart uses monthly closing prices from Yahoo Finance for the last 24 months. Months without historical data fall back to the nearest available price or cost basis.

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint`
5. Open a pull request

---

## Acknowledgments

- [yahoo-finance2](https://github.com/gadicc/yahoo-finance2) for stock price data
- [Radix UI](https://www.radix-ui.com/) and [Recharts](https://recharts.org/) for UI and charts
- [shadcn/ui](https://ui.shadcn.com/) for component patterns
