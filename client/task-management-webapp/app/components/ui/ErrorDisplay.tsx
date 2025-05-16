"use client"

import { AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

interface ErrorDisplayProps {
  title?: string
  message: string
  className?: string
  onRetry?: () => void
}

export function ErrorDisplay({ title = "An error occurred", message, className, onRetry }: ErrorDisplayProps) {
  return (
    <div className={cn("rounded-md bg-red-50 p-4 dark:bg-red-900/20", className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{title}</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
                onClick={onRetry}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
