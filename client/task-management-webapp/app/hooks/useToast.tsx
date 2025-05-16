"use client"

import { createContext, useContext, type ReactNode } from "react"
import { toast, ToastContainer, type ToastOptions, type Id } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface ToastContextType {
  success: (message: string, options?: ToastOptions) => Id
  error: (message: string, options?: ToastOptions) => Id
  info: (message: string, options?: ToastOptions) => Id
  warning: (message: string, options?: ToastOptions) => Id
  dismiss: (id?: Id) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }

  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...defaultOptions, ...options })
  }

  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...defaultOptions, ...options })
  }

  const info = (message: string, options?: ToastOptions) => {
    return toast.info(message, { ...defaultOptions, ...options })
  }

  const warning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, { ...defaultOptions, ...options })
  }

  const dismiss = (id?: Id) => {
    if (id) {
      toast.dismiss(id)
    }
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  return (
    <ToastContext.Provider
      value={{
        success,
        error,
        info,
        warning,
        dismiss,
        dismissAll,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

/**
 * Custom hook for accessing toast notification context
 * @returns Toast context values and methods
 */
export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}
