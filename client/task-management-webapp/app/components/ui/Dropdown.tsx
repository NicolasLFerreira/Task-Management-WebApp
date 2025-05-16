"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface DropdownItem<T = unknown> {
  label: string
  value: T
}

interface DropdownProps<T = unknown> {
  items: DropdownItem<T>[]
  value: T | null
  onChange: (value: T) => void
  placeholder: string
  disabled?: boolean
  className?: string
}

export function Dropdown<T = unknown>({
  items,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedItem = items.find((item) => item.value === value) || null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (item: DropdownItem<T>) => {
    onChange(item.value)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={!selectedItem ? "text-gray-400 dark:text-gray-400" : ""}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                item.value === value && "bg-gray-100 dark:bg-gray-700",
              )}
              onClick={() => handleSelect(item)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
