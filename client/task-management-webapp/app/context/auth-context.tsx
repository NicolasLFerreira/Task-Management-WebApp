"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "../types"
import { jwtDecode } from "jwt-decode"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface JwtPayload {
  sub: string
  email: string
  name: string
  exp: number
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken)

        // Check if token is expired
        const currentTime = Date.now() / 1000
        if (decoded.exp < currentTime) {
          // Token expired, log out
          logout()
          return
        }

        // Set user from token
        setUser({
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
        })
        setToken(storedToken)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Invalid token:", error)
        logout()
      }
    }
  }, [])

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken)

      // Set user from token
      const userData: User = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
      }

      setUser(userData)
      setToken(newToken)
      setIsAuthenticated(true)

      // Store in localStorage
      localStorage.setItem("token", newToken)
      localStorage.setItem("userId", userData.id)
    } catch (error) {
      console.error("Error decoding token:", error)
      logout()
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
  }

  return <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
