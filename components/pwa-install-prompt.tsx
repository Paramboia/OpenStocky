"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "pwa-install-dismissed"
const DISMISS_DAYS = 14

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return true
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const ts = Number(raw)
  if (Number.isNaN(ts)) return false
  return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export function PwaInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  /* ── listen for the browser install event ── */
  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return
    if (wasDismissedRecently()) return

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      // Small delay so the prompt doesn't flash on first paint
      setTimeout(() => setVisible(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  /* ── hide after the app is installed ── */
  useEffect(() => {
    const handler = () => dismiss()
    window.addEventListener("appinstalled", handler)
    return () => window.removeEventListener("appinstalled", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)
      setLeaving(false)
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }, 300)
  }, [])

  const install = useCallback(async () => {
    const prompt = deferredPrompt.current
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      dismiss()
    }
    deferredPrompt.current = null
  }, [dismiss])

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm transition-all duration-300 ${
        leaving
          ? "translate-y-4 opacity-0"
          : "translate-y-0 opacity-100 animate-in slide-in-from-bottom-6 fade-in duration-500"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
        {/* Decorative gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary" />

        <div className="p-5">
          {/* Close button */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4">
            <Image
              src="/logo.webp"
              alt="OpenStocky logo"
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1 pr-4">
              <h3 className="text-sm font-semibold text-foreground">
                Install OpenStocky
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Add to your home screen for a faster, app-like experience — works offline too.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={install}
              size="sm"
              className="flex-1 gap-2 rounded-lg font-semibold"
            >
              <Download className="h-4 w-4" />
              Install App
            </Button>
            <Button
              onClick={dismiss}
              variant="ghost"
              size="sm"
              className="rounded-lg text-muted-foreground"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

