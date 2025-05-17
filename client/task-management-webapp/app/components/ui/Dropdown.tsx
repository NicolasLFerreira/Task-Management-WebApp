"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface DropdownItem<T = unknown> {
  label: string
  value?: T
  onClick?: () => void
  className?: string
  icon?: React.ReactNode
}

interface DropdownProps<T = unknown> {
  items: DropdownItem<T>[]
  value?: T | null
  onChange?: (value: T) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  trigger?: React.ReactNode
}

export function Dropdown<T = unknown>({
  items,
  value = null,
  onChange = () => {},
  placeholder = "Select an option",
  disabled = false,
  className,
  trigger,
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
    if (item.onClick) {
      item.onClick()
    } else if (item.value !== undefined) {
      onChange(item.value as T)
    }
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {trigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
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
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                item.value === value && "bg-gray-100 dark:bg-gray-700",
                item.className,
              )}
              onClick={() => handleSelect(item)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
