import type React from "react"
import type { ReactNode } from "react"
import { cn } from "../../utils/cn"

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn("space-y-6", className)} {...props}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
}

export function FormLabel({ children, className, ...props }: FormLabelProps) {
  return (
    <label className={cn("text-sm font-medium text-gray-700 dark:text-gray-300", className)} {...props}>
      {children}
    </label>
  )
}

interface FormErrorProps {
  children?: ReactNode
  className?: string
}

export function FormError({ children, className }: FormErrorProps) {
  if (!children) return null
  return <p className={cn("text-sm text-red-500", className)}>{children}</p>
}
