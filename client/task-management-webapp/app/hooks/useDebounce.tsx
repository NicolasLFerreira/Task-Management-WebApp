"use client"

import { useState, useEffect } from "react"

/**
 * A hook that delays updating a value until a specified delay has passed
 * Useful for search inputs, to avoid making API calls on every keystroke
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
