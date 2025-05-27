/**
 * Error handler utility functions for consistent error handling across the application
 */

// Define specific error types
export interface ApiErrorResponse {
  status?: number
  data?: {
    message?: string
    error?: string
    errors?: Record<string, string[]>
  }
  statusText?: string
}

export interface ErrorWithMessage {
  message: string
}

// Type guard to check if the error has a message property
export function hasMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

// Type guard to check if the error is an API error response
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return typeof error === "object" && error !== null && ("status" in error || "data" in error || "statusText" in error)
}

/**
 * Extract error message from various error types
 * @param error The error object
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // Default error message
  let message = "An unexpected error occurred. Please try again."

  if (hasMessage(error)) {
    message = error.message
  } else if (isApiErrorResponse(error)) {
    // Handle API error responses
    if (error.data?.message) {
      message = error.data.message
    } else if (error.data?.error) {
      message = error.data.error
    } else if (error.statusText) {
      message = `Error: ${error.statusText}`
    } else if (error.status) {
      message = `Error: ${getHttpStatusMessage(error.status)}`
    }

    // Handle validation errors
    if (error.data?.errors) {
      const validationErrors = Object.values(error.data.errors).flat()
      if (validationErrors.length > 0) {
        message = validationErrors.join(". ")
      }
    }
  } else if (typeof error === "string") {
    message = error
  }

  return message
}

/**
 * Handle API errors and return a user-friendly error message
 * @param error The error object from an API call
 * @returns A user-friendly error message
 */
export function handleApiError(error: unknown): string {
  logError(error)
  return getErrorMessage(error)
}

/**
 * Log error details to console for debugging
 * @param error The error object
 * @param context Optional context information
 */
export function logError(error: unknown, context?: string): void {
  console.error(`Error${context ? ` in ${context}` : ""}:`, error)

  if (hasMessage(error)) {
    console.error("Error message:", error.message)
  }

  if (isApiErrorResponse(error)) {
    console.error("Response status:", error.status)
    console.error("Response status text:", error.statusText)
    console.error("Response data:", error.data)
  }
}

/**
 * Get a human-readable message for HTTP status codes
 * @param status HTTP status code
 * @returns Human-readable status message
 */
function getHttpStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Validation Error",
    500: "Server Error",
    503: "Service Unavailable",
  }

  return statusMessages[status] || `HTTP Error ${status}`
}
