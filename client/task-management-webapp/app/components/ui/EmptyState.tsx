"use client"

import type React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700",
        className,
      )}
    >
      {icon && <div className="mb-4 text-gray-400 dark:text-gray-500">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
