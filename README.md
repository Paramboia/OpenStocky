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
- **Live Stock Prices** — Integrates with [Yahoo Finance](https://finance.yahoo.com/) (via [`yahoo-finance2`](https://github.com/gadicc/yahoo-finance2)) to fetch real-time quotes for all your holdings in a single batch call. No API key required.
- **Theme Toggle** — Light and dark mode via `next-themes`.

### Metrics & KPIs

**Primary metrics:**
- Portfolio value & net invested  
- Total return (unrealized + realized P/L)  
- Unrealized and realized gains/losses  

**Advanced performance metrics:**
- **IRR** (Internal Rate of Return) — Money-weighted annualized return  
- **CAGR** (Compound Annual Growth Rate) — Time-weighted annual return  
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

- **Holdings table** — Sortable columns (symbol, shares, avg cost, price, value, P/L), search, allocation bars  
- **Transactions table** — Paginated list, search by symbol, filter by buy/sell, swipe-to-delete on mobile  
- **Allocation chart** — Donut chart of portfolio weights (top 10 holdings + “Other”)  
- **Performance chart** — Area chart of net invested vs portfolio value over the last 24 months  

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
│   ├── api/stock-prices/route.ts   # Yahoo Finance stock price API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── portfolio/                   # Portfolio-specific components
│   │   ├── add-batch-dialog.tsx     # CSV batch import
│   │   ├── add-transaction-dialog.tsx
│   │   ├── allocation-chart.tsx     # Donut chart
│   │   ├── holdings-table.tsx
│   │   ├── performance-chart.tsx    # Invested vs value over time
│   │   ├── portfolio-content.tsx    # Main layout
│   │   ├── portfolio-header.tsx     # KPIs and metrics
│   │   └── transactions-table.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/                          # Radix-based UI primitives
├── lib/
│   ├── portfolio-data.ts            # Holdings, stats, IRR, KPIs
│   ├── stock-price-context.tsx      # SWR + React context for prices
│   ├── transactions-store.ts        # In-memory transaction store
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
git clone https://github.com/your-username/OpenStocky.git
cd OpenStocky
npm install
```

### Environment Variables

No environment variables are required. Stock prices are fetched via Yahoo Finance with no API key needed.

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

## Batch Upload Format

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

---

## Data & Privacy

- **No persistence** — All transactions and holdings exist only in memory. A refresh clears everything.
- **No auth** — No accounts, passwords, or user profiles.
- **No analytics** — No tracking of your activity.
- **Self-hosted** — Deploy on your own infrastructure for full control.

---

## Limitations

1. **Session-only data** — Refreshing or closing the tab wipes all transactions. Use batch upload to quickly reimport.
2. **Yahoo Finance (unofficial)** — The `yahoo-finance2` library uses Yahoo's unofficial API. While the community has kept it working since 2013, Yahoo may change their endpoints at any time.
3. **US equities focus** — Yahoo Finance supports global symbols, but ticker validation is tuned for common US conventions.
4. **Historical performance** — The growth chart uses current prices for past months; true historical performance would require historical price data.

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository  
2. Create a feature branch  
3. Make your changes  
4. Run `npm run lint`  
5. Open a pull request  

---

## License

MIT — See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [yahoo-finance2](https://github.com/gadicc/yahoo-finance2) for stock price data  
- [Radix UI](https://www.radix-ui.com/) and [Recharts](https://recharts.org/) for UI and charts  
- [shadcn/ui](https://ui.shadcn.com/) for component patterns  
