import React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { StockPriceProvider } from "@/lib/stock-price-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileBottomBar } from "@/components/mobile-bottom-bar"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

const SITE_URL = "https://www.openstocky.com"
const SITE_NAME = "OpenStocky"
const SITE_DESCRIPTION =
  "Open-source stock investment portfolio tracker. No authentication, no database, no account required. Track buy/sell transactions, live prices, IRR, CAGR, Sharpe ratio, and portfolio allocation in your browser."

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OpenStocky — Open Source Stock Portfolio Tracker",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "stock portfolio",
    "portfolio tracker",
    "investment tracker",
    "stock portfolio tracker",
    "open source",
    "no account",
    "IRR",
    "CAGR",
    "Sharpe ratio",
    "stock performance",
    "portfolio allocation",
    "finance dashboard",
  ],
  authors: [{ name: "OpenStocky" }],
  creator: "OpenStocky",
  publisher: "OpenStocky",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "OpenStocky — Open Source Stock Portfolio Tracker",
    description: SITE_DESCRIPTION,
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
    title: "OpenStocky — Open Source Stock Portfolio Tracker",
    description: SITE_DESCRIPTION,
    images: ["/og_image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "finance",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/og_image.png`,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "In-memory portfolio storage — no account or database required",
    "Single and batch transaction entry",
    "Live stock prices via Yahoo Finance",
    "IRR, CAGR, Sharpe ratio, volatility, win rate",
    "Portfolio allocation and performance charts",
    "Holdings and transactions tables with search and filters",
    "Light and dark theme",
    "Open source — audit and fork the code",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <StockPriceProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex-1 pb-28 sm:pb-0">{children}</div>
              <Footer />
              <MobileBottomBar />
              <PwaInstallPrompt />
            </div>
          </StockPriceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
