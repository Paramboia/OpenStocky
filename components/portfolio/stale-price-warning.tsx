"use client"

import { AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Yellow warning icon shown next to a symbol when its latest price fetch
 * failed and we're displaying the last successfully fetched price instead.
 */
export function StalePriceWarning() {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help" aria-label="Price fetch error">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">Error when fetching, showing last price fetched as fallback</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
