import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Github, Terminal, GitFork, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const SITE_URL = "https://www.openstocky.com"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About OpenStocky — an open-source stock investment portfolio tracker. Built by Miguel Macedo Parente. No authentication, no database, track your portfolio in your browser.",
  openGraph: {
    title: "About Us | OpenStocky",
    description: "About OpenStocky — an open-source stock portfolio tracker. Built by Miguel Macedo Parente.",
    url: `${SITE_URL}/about-us`,
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
    title: "About Us | OpenStocky",
    description: "About OpenStocky — an open-source stock portfolio tracker. Built by Miguel Macedo Parente.",
    images: ["/og_image.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/about-us`,
  },
}

export default function AboutUsPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to portfolio
          </Button>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">About OpenStocky</h1>
        <p className="mt-4 text-muted-foreground">
          OpenStocky is an open-source stock investment portfolio tracker. It does not require
          authentication, a database, or an account. You can track your portfolio entirely in your
          browser with a modern finance dashboard.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">How it works</h2>
        <p className="mt-2 text-muted-foreground">
          All data lives in memory during your session — refreshing the page resets it. This design
          prioritizes privacy and simplicity: no backend storage, no user accounts, no data
          collection. Your financial data never leaves your device.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Features</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
          <li>In-memory storage — no account or database required</li>
          <li>Single and batch transaction entry (CSV from Excel)</li>
          <li>Export transactions to CSV for backup and re-import</li>
          <li>Live stock prices via Yahoo Finance — no API key needed</li>
          <li>IRR, CAGR, Sharpe ratio, volatility, win rate, and more</li>
          <li>Total return per symbol (unrealized + realized via FIFO)</li>
          <li>Four interactive charts: growth, allocation, P/L attribution, risk vs return</li>
          <li>Open source — audit and fork the code</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Open Source</h2>
        <p className="mt-2 text-muted-foreground">
          OpenStocky is fully open source under the MIT license. You can inspect every line of code,
          suggest improvements, report bugs, or fork the project to build your own version. Contributions
          are welcome — whether it&apos;s a feature, a fix, or documentation.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/10">
              <Github className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Paramboia/OpenStocky</p>
              <p className="text-xs text-muted-foreground">GitHub Repository</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://github.com/Paramboia/OpenStocky"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </a>
            <a
              href="https://github.com/Paramboia/OpenStocky/fork"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary bg-transparent">
                <GitFork className="h-4 w-4" />
                Fork
              </Button>
            </a>
            <a
              href="https://github.com/Paramboia/OpenStocky/stargazers"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-secondary bg-transparent">
                <Star className="h-4 w-4" />
                Star
              </Button>
            </a>
          </div>
        </div>

        <h3 className="mt-8 text-base font-semibold text-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Run it locally
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Clone the repo and start the dev server in a few commands. No API keys or environment variables needed.
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-lg border border-border bg-background p-4 font-mono text-sm text-foreground overflow-x-auto">
            <p className="text-muted-foreground"># Clone the repository</p>
            <p>git clone https://github.com/Paramboia/OpenStocky.git</p>
            <p className="mt-3 text-muted-foreground"># Navigate into the project</p>
            <p>cd OpenStocky</p>
            <p className="mt-3 text-muted-foreground"># Install dependencies</p>
            <p>npm install</p>
            <p className="mt-3 text-muted-foreground"># Start the development server</p>
            <p>npm run dev</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Requires Node.js 18+ and npm. Open{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">http://localhost:3000</code>{" "}
            after starting.
          </p>
        </div>

        <h3 className="mt-8 text-base font-semibold text-foreground">Contributing</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Want to contribute? Here&apos;s how:
        </p>
        <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Fork the repository</li>
          <li>Create a feature branch</li>
          <li>Make your changes</li>
          <li>
            Run <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run lint</code> to check for issues
          </li>
          <li>Open a pull request</li>
        </ol>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          OpenStocky was built by{" "}
          <a
            href="https://miguelparente.com/?ref=miguelos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Miguel Macedo Parente
          </a>
          .
        </p>
      </div>
    </main>
  )
}
