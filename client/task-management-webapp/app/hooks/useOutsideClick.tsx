"use client"

import { useEffect, type RefObject } from "react"

/**
 * A hook that detects clicks outside of a specified element
 *
 * @param ref Reference to the element to detect clicks outside of
 * @param callback Function to call when a click outside is detected
 * @param exceptionalRefs Optional array of refs to exclude from outside click detection
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  callback: () => void,
  exceptionalRefs: RefObject<HTMLElement>[] = [],
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click was outside the main ref
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Check if the click was inside any of the exceptional refs
        const clickedInsideExceptionalRef = exceptionalRefs.some(
          (exceptionalRef) => exceptionalRef.current && exceptionalRef.current.contains(event.target as Node),
        )

        // Only call the callback if the click was not inside any exceptional ref
        if (!clickedInsideExceptionalRef) {
          callback()
        }
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside)

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, callback, exceptionalRefs])
}
