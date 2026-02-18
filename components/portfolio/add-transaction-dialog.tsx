"use client"

import React from "react"

import { useState } from "react"
import { Plus, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addTransactions } from "@/lib/transactions-store"

interface TransactionFormData {
  date: string
  type: "buy" | "sell"
  symbol: string
  shares: string
  pricePerShare: string
  fees: string
}

interface AddTransactionDialogProps {
  trigger?: React.ReactNode
}

export function AddTransactionDialog({ trigger }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split("T")[0],
    type: "buy",
    symbol: "",
    shares: "",
    pricePerShare: "",
    fees: "10",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const shares = Number.parseFloat(formData.shares)
    const price = Number.parseFloat(formData.pricePerShare)
    const fees = Number.parseFloat(formData.fees) || 0
    // For buys: cost = price + fees (you pay more)
    // For sells: proceeds = price - fees (you receive less)
    const total = formData.type === "buy"
      ? shares * price + fees
      : shares * price - fees

    const newTransaction = {
      date: formData.date,
      type: formData.type,
      symbol: formData.symbol.trim().toUpperCase(),
      shares,
      pricePerShare: price,
      fees,
      transactionCost: total,
    }

    addTransactions([
      {
        ...newTransaction,
        id: typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      },
    ])

    // For now, log the transaction - in a real app you'd save this to a database
    console.log("[v0] New transaction to add:", newTransaction)
    
    // Show the transaction data that would be added
    alert(`Transaction created!\n\n${formData.type.toUpperCase()} ${shares} shares of ${formData.symbol.toUpperCase()}\nPrice: $${price.toFixed(2)}\nFees: $${fees.toFixed(2)}\nTotal: $${total.toFixed(2)}\n\nData is stored in session memory and will reset when the browser tab is closed or refreshed.`)
    
    // Reset form and close dialog
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "buy",
      symbol: "",
      shares: "",
      pricePerShare: "",
      fees: "10",
    })
    setOpen(false)
  }

  const calculatedTotal = () => {
    const shares = Number.parseFloat(formData.shares) || 0
    const price = Number.parseFloat(formData.pricePerShare) || 0
    const fees = Number.parseFloat(formData.fees) || 0
    // For buys: cost = price + fees (you pay more)
    // For sells: proceeds = price - fees (you receive less)
    return formData.type === "buy"
      ? shares * price + fees
      : shares * price - fees
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Transaction</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record a new buy or sell transaction for your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "buy" | "sell") => setFormData({ ...formData, type: value })}
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
            <Label htmlFor="symbol" className="text-foreground">Symbol</Label>
            <Input
              id="symbol"
              placeholder="AAPL, GOOGL, MSFT..."
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.trim().toUpperCase() })}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shares" className="text-foreground">Shares</Label>
              <Input
                id="shares"
                type="number"
                step="0.01"
                min="0"
                placeholder="10"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Price per Share</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                value={formData.pricePerShare}
                onChange={(e) => setFormData({ ...formData, pricePerShare: e.target.value })}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fees" className="text-foreground">Fees</Label>
            <Input
              id="fees"
              type="number"
              step="0.01"
              min="0"
              placeholder="10.00"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{formData.type === "buy" ? "Total Cost" : "Net Proceeds"}</span>
              <span className="text-xl font-bold text-foreground">
                ${calculatedTotal().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
