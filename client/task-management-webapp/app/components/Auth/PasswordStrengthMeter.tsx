"use client"

import { useState, useEffect } from "react"
import { cn } from "../../lib/utils"

interface PasswordStrengthMeterProps {
  password: string
  onScoreChange?: (score: number) => void
}

export function PasswordStrengthMeter({ password, onScoreChange }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0)
  const [criteria, setCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Add a small delay to trigger the entrance animation
    const timer = setTimeout(() => {
      setMounted(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const calculateStrength = () => {
      const newCriteria = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^a-zA-Z0-9]/.test(password),
      }

      setCriteria(newCriteria)

      const score = Object.values(newCriteria).filter(Boolean).length
      setStrength(score)

      // Call the onScoreChange callback if provided
      if (onScoreChange) {
        onScoreChange(score)
      }
    }

    calculateStrength()
  }, [password, onScoreChange])

  const getStrengthText = () => {
    switch (strength) {
      case 0:
        return "Very Weak"
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      case 5:
        return "Very Strong"
      default:
        return ""
    }
  }

  const getStrengthIcon = () => {
    switch (strength) {
      case 0:
        return <span className="text-red-500">✗</span>
      case 1:
        return <span className="text-red-500">⚠</span>
      case 2:
        return <span className="text-orange-500">⚠</span>
      case 3:
        return <span className="text-yellow-500">⚠</span>
      case 4:
        return <span className="text-green-500">✓</span>
      case 5:
        return <span className="text-green-700">✓</span>
      default:
        return <span className="text-gray-400">⚠</span>
    }
  }

  return (
    <div
      className={cn(
        "space-y-3 mt-2 transition-all duration-300 ease-in-out",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {getStrengthIcon()}
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            strength === 0 && "text-red-500",
            strength === 1 && "text-red-500",
            strength === 2 && "text-orange-500",
            strength === 3 && "text-yellow-500",
            strength === 4 && "text-green-500",
            strength === 5 && "text-green-700",
          )}
        >
          {getStrengthText()}
        </span>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            strength === 0 && "bg-red-500 w-0",
            strength === 1 && "bg-red-500 w-1/5",
            strength === 2 && "bg-orange-500 w-2/5",
            strength === 3 && "bg-yellow-500 w-3/5",
            strength === 4 && "bg-green-500 w-4/5",
            strength === 5 && "bg-green-700 w-full",
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={cn("flex items-center gap-1", criteria.length ? "text-green-600" : "text-gray-500")}>
          <div className={cn("w-2 h-2 rounded-full", criteria.length ? "bg-green-600" : "bg-gray-300")}></div>
          At least 8 characters
        </div>
        <div className={cn("flex items-center gap-1", criteria.lowercase ? "text-green-600" : "text-gray-500")}>
          <div className={cn("w-2 h-2 rounded-full", criteria.lowercase ? "bg-green-600" : "bg-gray-300")}></div>
          Lowercase letter
        </div>
        <div className={cn("flex items-center gap-1", criteria.uppercase ? "text-green-600" : "text-gray-500")}>
          <div className={cn("w-2 h-2 rounded-full", criteria.uppercase ? "bg-green-600" : "bg-gray-300")}></div>
          Uppercase letter
        </div>
        <div className={cn("flex items-center gap-1", criteria.number ? "text-green-600" : "text-gray-500")}>
          <div className={cn("w-2 h-2 rounded-full", criteria.number ? "bg-green-600" : "bg-gray-300")}></div>
          Number
        </div>
        <div className={cn("flex items-center gap-1", criteria.special ? "text-green-600" : "text-gray-500")}>
          <div className={cn("w-2 h-2 rounded-full", criteria.special ? "bg-green-600" : "bg-gray-300")}></div>
          Special character
        </div>
      </div>
    </div>
  )
}
