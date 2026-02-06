import Link from "next/link"
import { Info } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full border-t border-border bg-card/80 py-6 px-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {currentYear} OpenStocky.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-0.5">
            Track your portfolio, no account required.
          </p>
        </div>
        <Link
          href="/about-us"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="About OpenStocky"
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          About Us
        </Link>
      </div>
    </footer>
  )
}
