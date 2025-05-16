"use client"

import { useState, useEffect } from "react"

/**
 * A hook that returns whether a media query matches
 *
 * @param query The media query to match
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null to avoid hydration mismatch
  const [matches, setMatches] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(query)

      // Set initial value
      setMatches(mediaQuery.matches)

      // Create event listener function
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      // Add event listener
      mediaQuery.addEventListener("change", handleChange)

      // Clean up
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    }
  }, [query])

  // Return false during SSR to avoid hydration mismatch
  if (!mounted) return false

  return matches
}

// Predefined media query hooks for common breakpoints
export function useIsMobile() {
  return useMediaQuery("(max-width: 639px)")
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)")
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)")
}

export function useIsDarkMode() {
  return useMediaQuery("(prefers-color-scheme: dark)")
}
