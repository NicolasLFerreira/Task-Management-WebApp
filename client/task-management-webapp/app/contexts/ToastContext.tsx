import type React from "react"
import { createContext } from "react"
import { toast, ToastContainer, type ToastOptions } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface ToastContextType {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  showWarning: (message: string) => void
}

export const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
})

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }

  const showSuccess = (message: string) => {
    toast.success(message, defaultOptions)
  }

  const showError = (message: string) => {
    toast.error(message, defaultOptions)
  }

  const showInfo = (message: string) => {
    toast.info(message, defaultOptions)
  }

  const showWarning = (message: string) => {
    toast.warning(message, defaultOptions)
  }

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}
