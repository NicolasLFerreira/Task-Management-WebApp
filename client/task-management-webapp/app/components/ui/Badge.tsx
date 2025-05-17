import type React from "react"

export interface BadgeProps {
  children: React.ReactNode
  variant?: "success" | "warning" | "error" | "info" | "outline"
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className = "" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "outline":
        return "bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()} ${className}`}
    >
      {children}
    </span>
  )
}
