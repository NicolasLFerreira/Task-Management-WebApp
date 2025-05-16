"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "../../lib/utils"

interface TooltipProps {
  content: string | React.ReactNode
  position?: "top" | "right" | "bottom" | "left"
  children: React.ReactNode
  delay?: number
  className?: string
}

export function Tooltip({ content, position = "top", children, delay = 300, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }

  const arrowClasses = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent",
    right:
      "left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent",
    bottom:
      "top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent",
  }

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 max-w-xs px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded shadow-sm dark:bg-gray-800",
            positionClasses[position],
            className,
          )}
        >
          {content}
          <div className={cn("absolute w-0 h-0 border-4", arrowClasses[position])} />
        </div>
      )}
    </div>
  )
}
