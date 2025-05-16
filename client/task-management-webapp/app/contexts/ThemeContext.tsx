"use client"

import type React from "react"
import { createContext, useState, useEffect } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  isDarkMode: false,
})

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme | null
    return savedTheme || "system"
  })

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme)

    // Apply theme to document
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    // Determine if dark mode should be applied
    let darkModeActive = false

    if (theme === "system") {
      darkModeActive = window.matchMedia("(prefers-color-scheme: dark)").matches
    } else {
      darkModeActive = theme === "dark"
    }

    if (darkModeActive) {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }

    setIsDarkMode(darkModeActive)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        if (mediaQuery.matches) {
          root.classList.add("dark")
          setIsDarkMode(true)
        } else {
          root.classList.add("light")
          setIsDarkMode(false)
        }
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        isDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
