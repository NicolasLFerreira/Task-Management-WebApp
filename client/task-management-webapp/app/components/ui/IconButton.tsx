import type React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  tooltip?: string
  ariaLabel: string
}

export function IconButton({
  icon,
  variant = "primary",
  size = "md",
  isLoading = false,
  tooltip,
  ariaLabel,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
  }

  const sizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  }

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const button = (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        variantClasses[variant],
        sizeClasses[size],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className,
      )}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      title={tooltip}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", iconSizeClasses[size])} />
      ) : (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </button>
  )

  return button
}
