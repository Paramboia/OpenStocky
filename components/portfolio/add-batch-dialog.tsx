"use client"

import React from "react"

import { useMemo, useRef, useState } from "react"
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
import { addTransactions, setTransactions } from "@/lib/transactions-store"
import type { Transaction } from "@/lib/portfolio-data"

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

interface AddBatchDialogProps {
  trigger?: React.ReactNode
}

export function AddBatchDialog({ trigger }: AddBatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [mode, setMode] = useState<"override" | "append">("append")
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [readingFile, setReadingFile] = useState(false)
  const [fileName, setFileName] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const fileReadId = useRef(0)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      fileReadId.current++
      setReadingFile(false)
      setIsDragging(false)
    }
  }

  const loadFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const readId = ++fileReadId.current
    setReadingFile(false)
    setError(null)
    if (files.length !== 1) {
      setError("Please choose or drop one CSV file at a time.")
      return
    }
    const file = files[0]
    if (!/\.csv$/i.test(file.name)) {
      setError("Please choose a .csv file. Export Excel workbooks as CSV first.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("This file is too large. Choose a CSV file smaller than 5 MB.")
      return
    }
    setReadingFile(true)
    try {
      const text = (await file.text()).replace(/^\uFEFF/, "")
      if (readId !== fileReadId.current) return
      if (!text.trim()) {
        setError("This CSV file is empty. Choose a file containing transactions.")
        return
      }
      setCsvText(text)
      setFileName(file.name)
    } catch {
      if (readId === fileReadId.current) setError("Could not read this file. Try again or paste its contents.")
    } finally {
      if (readId === fileReadId.current) setReadingFile(false)
    }
  }

  const parsedLines = useMemo(() => {
    return csvText
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
  }, [csvText])

  const parsedHeaders = useMemo(() => {
    const firstLine = parsedLines[0]
    if (!firstLine) return null
    return firstLine.split(/,|\t/).map((value) => value.trim())
  }, [parsedLines])

  const createId = (index: number) => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${index}`
  }

  const parseTransactionRow = (line: string, index: number): Transaction | null => {
    const [date, rawType, symbol, rawShares, rawPrice, rawFees] = line
      .split(/,|\t/)
      .map((value) => value.trim())

    const normalizedType = rawType?.toLowerCase()
    if (!date || (normalizedType !== "buy" && normalizedType !== "sell")) {
      return null
    }

    const shares = Number.parseFloat(rawShares)
    const pricePerShare = Number.parseFloat(rawPrice)
    const fees = Number.parseFloat(rawFees)

    if (
      !symbol ||
      Number.isNaN(shares) ||
      Number.isNaN(pricePerShare) ||
      Number.isNaN(fees)
    ) {
      return null
    }

    const transactionCost =
      normalizedType === "buy"
        ? shares * pricePerShare + fees
        : shares * pricePerShare - fees

    return {
      id: createId(index),
      date,
      type: normalizedType,
      symbol: symbol.trim().toUpperCase(),
      shares,
      pricePerShare,
      fees,
      transactionCost,
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (readingFile) return

    if (!parsedHeaders) {
      setError("Please paste data or choose a CSV file containing transactions.")
      return
    }

    const hasHeaderRow = headerMatches(parsedHeaders)
    const rows = hasHeaderRow ? parsedLines.slice(1) : parsedLines

    if (!hasHeaderRow && parsedHeaders.length !== requiredHeaders.length) {
      setError(
        "CSV must include a header row or each row must have 6 columns: Transaction Date, Transaction Type, Symbol, Shares, Price per Share, Fees.",
      )
      return
    }

    const invalidRow = rows.find(
      (line) => line.split(/,|\t/).length !== requiredHeaders.length,
    )

    if (rows.length === 0 || invalidRow) {
      setError(
        "Please include at least one valid transaction row with 6 columns.",
      )
      return
    }

    const parsedTransactions = rows
      .map((line, index) => parseTransactionRow(line, index))
      .filter((value): value is Transaction => Boolean(value))

    if (parsedTransactions.length !== rows.length) {
      setError(
        "One or more rows are invalid. Please check dates, types (buy/sell), and numeric values.",
      )
      return
    }

    setError(null)

    if (mode === "override") {
      if (!setTransactions(parsedTransactions)) return
    } else {
      if (!addTransactions(parsedTransactions)) return
    }

    console.log("[v0] Batch import request:", {
      mode,
      headers: hasHeaderRow ? parsedHeaders : requiredHeaders,
      rowCount: rows.length,
    })

    alert(
      `Batch import complete!\n\nMode: ${
        mode === "override" ? "Override database" : "Add to database"
      }\nRows detected: ${rows.length}\n\nYour portfolio is saved in this browser and will be restored when you return.`,
    )

    setCsvText("")
    setMode("append")
    setFileName("")
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Add Batch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-card border-border text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Batch Transactions
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Drop a CSV file or paste data from Excel using the required columns.
            Review the data below, then import. Calculated columns are derived automatically.
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
                fileReadId.current++
                setReadingFile(false)
                setCsvText(event.target.value)
                setFileName("")
                if (error) setError(null)
              }}
              onDragOver={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return
                event.preventDefault()
                event.dataTransfer.dropEffect = "copy"
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return
                event.preventDefault()
                setIsDragging(false)
                void loadFiles(event.dataTransfer.files)
              }}
              aria-describedby="csv-help csv-file-status"
              aria-busy={readingFile}
              className={`min-h-[160px] bg-secondary text-foreground placeholder:text-muted-foreground ${isDragging ? "border-primary ring-2 ring-primary bg-primary/10" : "border-border"}`}
              required
            />
            <div className="flex items-center justify-between gap-3">
              <p id="csv-help" className="text-xs text-muted-foreground">
                Drop a CSV here, choose a file, or paste comma- or tab-separated data.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                tabIndex={-1}
                aria-label="Choose CSV file"
                onChange={(event) => {
                  void loadFiles(event.target.files)
                  event.target.value = ""
                }}
              />
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => fileInput.current?.click()}>
                Choose file
              </Button>
            </div>
            <p id="csv-file-status" role="status" className="break-all text-xs text-muted-foreground">
              {readingFile ? "Reading file…" : fileName ? `Loaded ${fileName}` : ""}
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
            <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={readingFile} className="bg-primary text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              Import Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
