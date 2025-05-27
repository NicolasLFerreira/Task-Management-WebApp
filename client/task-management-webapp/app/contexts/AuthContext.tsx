"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { UserService } from "../../api-client"

interface AuthContextType {
  isAuthenticated: boolean
  user: UserInfo | null
  login: (token: string) => void
  logout: () => void
  loading: boolean
}

interface UserInfo {
  username: string
  email: string
  id?: number
  firstName?: string
  lastName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }

      try {
        // Validate token by making a request to get current user info
        // Using the correct method from UserService to get the profile
        const response = await UserService.getApiUsersProfile()

        if (response.data) {
          setUser({
            id: response.data.id,
            username: response.data.username || "",
            email: response.data.email || "",
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
          })
          setIsAuthenticated(true)
        } else {
          // Token is invalid
          localStorage.removeItem("auth_token")
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error("Error validating auth token:", error)
        localStorage.removeItem("auth_token")
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (token: string) => {
    localStorage.setItem("auth_token", token)
    setIsAuthenticated(true)
    // Don't navigate here, let the protected route handle it
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setIsAuthenticated(false)
    setUser(null)
    navigate("/auth")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
