"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Calendar, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value || new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const formatDate = (date: Date | null): string => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selectedDate)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    // Add weekday headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`weekday-${i}`} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          {weekdays[i]}
        </div>,
      )
    }

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isSelected =
        value &&
        date.getDate() === value.getDate() &&
        date.getMonth() === value.getMonth() &&
        date.getFullYear() === value.getFullYear()

      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm",
            isSelected && "bg-blue-600 text-white",
            !isSelected && isToday && "border border-blue-600 text-blue-600",
            !isSelected && !isToday && "hover:bg-gray-100 dark:hover:bg-gray-800",
          )}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className={cn("relative", className)} ref={datePickerRef}>
      <div
        className={cn(
          "flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500",
          "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          readOnly
          value={formatDate(value)}
          placeholder={placeholder}
          className="w-full bg-transparent focus:outline-none dark:text-white"
          disabled={disabled}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="h-5 w-5 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="h-5 w-5 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}
    </div>
  )
}
