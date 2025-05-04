import { type SelectHTMLAttributes, forwardRef } from "react"
import { cn } from "../../utils/cn"

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
})

Select.displayName = "Select"

export { Select }
