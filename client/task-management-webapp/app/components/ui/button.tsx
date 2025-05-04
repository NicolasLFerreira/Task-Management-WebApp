import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "../../utils/cn"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700":
              variant === "secondary",
            "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800":
              variant === "outline",
            "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "h-9 px-3 text-sm": size === "sm",
            "h-10 px-4": size === "md",
            "h-11 px-6": size === "lg",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button }
