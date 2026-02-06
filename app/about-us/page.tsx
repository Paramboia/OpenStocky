import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
  },
  alternates: {
    canonical: `${SITE_URL}/about-us`,
  },
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-background">
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
          <li>Live stock prices via Alpha Vantage</li>
          <li>IRR, CAGR, Sharpe ratio, volatility, win rate, and more</li>
          <li>Portfolio allocation and performance charts</li>
          <li>Open source — audit and fork the code</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Built by</h2>
        <p className="mt-2 text-muted-foreground">
          OpenStocky was built by{" "}
          <a
            href="https://miguelparente.com/?ref=miguelos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Miguel Macedo Parente
          </a>
          . You can find more projects at{" "}
          <a
            href="https://miguelparente.com/?ref=miguelos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            miguelparente.com
          </a>
          .
        </p>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to portfolio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
