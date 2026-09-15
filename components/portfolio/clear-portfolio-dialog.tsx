"use client"

import { useRef, useState, type ReactNode } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { clearTransactions } from "@/lib/transactions-store"

export function ClearPortfolioDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="icon"
            aria-label="Clear portfolio"
            title="Clear portfolio"
            className="border-border text-muted-foreground hover:text-destructive bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border text-foreground sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          cancelRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>Clear all portfolio data?</DialogTitle>
          <DialogDescription>
            This deletes all transactions and resets your holdings and performance in this browser.
            This cannot be undone. Export a CSV first if you want to keep a backup.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button ref={cancelRef} variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => {
            if (clearTransactions()) setOpen(false)
          }}>
            Clear all data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
