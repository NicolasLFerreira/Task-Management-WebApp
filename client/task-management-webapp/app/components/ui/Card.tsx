import type React from "react"
import { cn } from "../../lib/utils"

interface CardProps {
  variant?: "default" | "outlined" | "elevated"
  children: React.ReactNode
  className?: string
}

export function Card({ variant = "default", children, className }: CardProps) {
  const variantClasses = {
    default: "bg-white dark:bg-gray-800",
    outlined: "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
    elevated: "bg-white shadow-md dark:bg-gray-800",
  }

  return <div className={cn("rounded-lg p-4", variantClasses[variant], className)}>{children}</div>
}
