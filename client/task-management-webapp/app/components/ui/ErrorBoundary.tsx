import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  fallback?: ReactNode | ((error: Error) => ReactNode)
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        // Check if fallback is a function and we have an error
        if (typeof this.props.fallback === "function" && this.state.error) {
          // If it's a function, call it with the error
          return this.props.fallback(this.state.error);
        } else if (typeof this.props.fallback !== "function") {
          // If it's not a function, it must be a ReactNode (based on the prop type)
          // Return the fallback directly
          return this.props.fallback;
        }
        // If fallback exists but is a function and there's no error,
        // or if it's a function but the error state is null,
        // we might fall through to the default UI. This seems acceptable.
      }

      // Default fallback UI
      return (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Something went wrong</h3>
              {this.state.error && (
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{this.state.error.message}</div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
