"use client"

import React from "react"

import { useMemo, useState } from "react"
import { FileSpreadsheet, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const requiredHeaders = [
  "Transaction Date",
  "Transaction Type",
  "Symbol",
  "Shares",
  "Price per Share",
  "Fees",
]

const normalizedHeader = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase()

const headerMatches = (headers: string[]) =>
  headers.length === requiredHeaders.length &&
  headers.every(
    (header, index) =>
      normalizedHeader(header) === normalizedHeader(requiredHeaders[index]),
  )

export function AddBatchDialog() {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [mode, setMode] = useState<"override" | "append">("append")
  const [error, setError] = useState<string | null>(null)

  const parsedHeaders = useMemo(() => {
    const firstLine = csvText.trim().split(/\r?\n/)[0]
    if (!firstLine) return null
    return firstLine.split(/,|\t/).map((value) => value.trim())
  }, [csvText])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!parsedHeaders || !headerMatches(parsedHeaders)) {
      setError(
        "CSV headers must match: Transaction Date, Transaction Type, Symbol, Shares, Price per Share, Fees.",
      )
      return
    }

    const rows = csvText
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .filter((line) => line.trim().length > 0)

    if (rows.length === 0) {
      setError("Please include at least one transaction row in the CSV.")
      return
    }

    setError(null)

    console.log("[v0] Batch import request:", {
      mode,
      headers: parsedHeaders,
      rowCount: rows.length,
    })

    alert(
      `Batch import ready!\n\nMode: ${
        mode === "override" ? "Override database" : "Add to database"
      }\nRows detected: ${rows.length}\n\nTo persist this, parse the CSV and update lib/portfolio-data.ts.`,
    )

    setCsvText("")
    setMode("append")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Batch Transactions
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste CSV data from Excel using the required columns. Calculated
            columns will be derived automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border border-dashed border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
            Required headers:{" "}
            <span className="font-medium text-foreground">
              {requiredHeaders.join(", ")}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv" className="text-foreground">
              CSV Input
            </Label>
            <Textarea
              id="csv"
              placeholder={`Transaction Date,Transaction Type,Symbol,Shares,Price per Share,Fees\n2024-06-01,Buy,AAPL,10,185.12,1.00`}
              value={csvText}
              onChange={(event) => {
                setCsvText(event.target.value)
                if (error) setError(null)
              }}
              className="min-h-[160px] bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              required
            />
            <p className="text-xs text-muted-foreground">
              Paste comma- or tab-separated data directly from Excel.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Import Mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(value: "override" | "append") => setMode(value)}
              className="gap-3"
            >
              <label className="flex items-start gap-3 text-sm text-foreground">
                <RadioGroupItem value="append" />
                <span>
                  Add to current database
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Appends new transactions to existing records.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-foreground">
                <RadioGroupItem value="override" />
                <span>
                  Override current database
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Replaces all existing transactions with this batch.
                  </span>
                </span>
              </label>
            </RadioGroup>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              Import Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
