"use client"

import React, { useEffect, useState } from "react"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Transaction } from "@/lib/portfolio-data"
import { updateTransaction } from "@/lib/transactions-store"

interface TransactionFormData {
  date: string
  type: "buy" | "sell"
  symbol: string
  shares: string
  pricePerShare: string
  fees: string
}

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    date: "",
    type: "buy",
    symbol: "",
    shares: "",
    pricePerShare: "",
    fees: "",
  })

  useEffect(() => {
    if (transaction && open) {
      setFormData({
        date: transaction.date,
        type: transaction.type,
        symbol: transaction.symbol,
        shares: String(transaction.shares),
        pricePerShare: String(transaction.pricePerShare),
        fees: String(transaction.fees),
      })
    }
  }, [transaction, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction) return

    const shares = Number.parseFloat(formData.shares)
    const price = Number.parseFloat(formData.pricePerShare)
    const fees = Number.parseFloat(formData.fees) || 0
    const total =
      formData.type === "buy"
        ? shares * price + fees
        : shares * price - fees

    updateTransaction(transaction.id, {
      date: formData.date,
      type: formData.type,
      symbol: formData.symbol.trim().toUpperCase(),
      shares,
      pricePerShare: price,
      fees,
      transactionCost: total,
    })

    onOpenChange(false)
  }

  const calculatedTotal = () => {
    const shares = Number.parseFloat(formData.shares) || 0
    const price = Number.parseFloat(formData.pricePerShare) || 0
    const fees = Number.parseFloat(formData.fees) || 0
    return formData.type === "buy"
      ? shares * price + fees
      : shares * price - fees
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Transaction</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date" className="text-foreground">
                Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type" className="text-foreground">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "buy" | "sell") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="buy" className="text-foreground">
                    <span className="flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-primary" />
                      Buy
                    </span>
                  </SelectItem>
                  <SelectItem value="sell" className="text-foreground">
                    <span className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                      Sell
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-symbol" className="text-foreground">
              Symbol
            </Label>
            <Input
              id="edit-symbol"
              placeholder="AAPL, GOOGL, MSFT..."
              value={formData.symbol}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  symbol: e.target.value.trim().toUpperCase(),
                })
              }
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-shares" className="text-foreground">
                Shares
              </Label>
              <Input
                id="edit-shares"
                type="number"
                step="0.01"
                min="0"
                placeholder="10"
                value={formData.shares}
                onChange={(e) =>
                  setFormData({ ...formData, shares: e.target.value })
                }
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price" className="text-foreground">
                Price per Share
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                value={formData.pricePerShare}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerShare: e.target.value })
                }
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-fees" className="text-foreground">
              Fees
            </Label>
            <Input
              id="edit-fees"
              type="number"
              step="0.01"
              min="0"
              placeholder="10.00"
              value={formData.fees}
              onChange={(e) =>
                setFormData({ ...formData, fees: e.target.value })
              }
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {formData.type === "buy" ? "Total Cost" : "Net Proceeds"}
              </span>
              <span className="text-xl font-bold text-foreground">
                $
                {calculatedTotal().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
