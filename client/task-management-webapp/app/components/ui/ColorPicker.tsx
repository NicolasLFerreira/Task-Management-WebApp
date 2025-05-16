"use client"

import { useState, useRef, useEffect } from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presetColors?: string[]
  className?: string
}

export function ColorPicker({
  value,
  onChange,
  presetColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
  ],
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleColorSelect = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)} ref={colorPickerRef}>
      <button
        type="button"
        className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: value || "#3b82f6" }} />
        <span className="text-gray-700 dark:text-gray-300">{value || "Select color"}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              >
                {value === color && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
