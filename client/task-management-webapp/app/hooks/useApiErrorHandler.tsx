"use client"

import { useState, useCallback } from "react"

interface ApiError {
  message: string
  statusCode: number | null
}

// Define interfaces for the expected error structure
interface ApiErrorResponse {
  data?: {
    message?: string
    error?: string
  }
  status?: number
}

interface ApiErrorObject {
  message?: string
  status?: number
  response?: ApiErrorResponse
}

export function useApiErrorHandler() {
  const [error, setError] = useState<ApiError | null>(null)

  const handleError = useCallback((err: unknown): ApiError => {
    let message = "An unexpected error occurred"
    let statusCode: number | null = null

    if (err instanceof Error) {
      message = err.message
    }

    // Handle Axios error structure
    if (typeof err === "object" && err !== null) {
      const errorObj = err as ApiErrorObject

      // Extract status code if available
      if (typeof errorObj.status === "number") {
        statusCode = errorObj.status
      } else if (typeof errorObj.response?.status === "number") {
        statusCode = errorObj.response.status
      }

      // Extract error message
      if (typeof errorObj.message === "string") {
        message = errorObj.message
      } else if (typeof errorObj.response?.data?.message === "string") {
        message = errorObj.response.data.message
      } else if (typeof errorObj.response?.data?.error === "string") {
        message = errorObj.response.data.error
      } else if (typeof errorObj.response?.data === "string") {
        message = errorObj.response.data
      }
    }

    // Format message based on status code
    if (statusCode) {
      switch (statusCode) {
        case 400:
          message = `Bad Request: ${message}`
          break
        case 401:
          message = "You are not authorized to perform this action"
          break
        case 403:
          message = "You don't have permission to access this resource"
          break
        case 404:
          message = "The requested resource was not found"
          break
        case 409:
          message = `Conflict: ${message}`
          break
        case 422:
          message = `Validation Error: ${message}`
          break
        case 500:
          message = "Server error. Please try again later"
          break
      }
    }

    const errorInfo = { message, statusCode }
    setError(errorInfo)
    return errorInfo
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
  }
}
