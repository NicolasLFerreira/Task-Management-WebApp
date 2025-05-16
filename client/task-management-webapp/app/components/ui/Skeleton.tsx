import type React from "react"
import { cn } from "../../lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = "text", width, height }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700"

  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  }

  const style: React.CSSProperties = {}

  if (width) {
    style.width = typeof width === "number" ? `${width}px` : width
  }

  if (height) {
    style.height = typeof height === "number" ? `${height}px` : height
  }

  return <div className={cn(baseClasses, variantClasses[variant], className)} style={style} />
}
