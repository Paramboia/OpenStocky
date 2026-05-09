"use client"

import { cn } from "@/lib/utils"
import type { PositionChartView } from "@/components/portfolio/position-chart-data"

const options: { value: PositionChartView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "closed", label: "Closed" },
  { value: "open", label: "Open" },
]

interface PositionChartFilterProps {
  value: PositionChartView
  onChange: (value: PositionChartView) => void
  className?: string
}

export function PositionChartFilter({ value, onChange, className }: PositionChartFilterProps) {
  return (
    <div className={cn("flex w-full bg-secondary border border-border rounded-md overflow-hidden sm:w-fit", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium transition-colors ${
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
