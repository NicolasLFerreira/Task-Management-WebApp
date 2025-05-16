"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { ApiService } from "../services/api-service"
import type { UserDtoReadable } from "../../api-client/types.gen"

interface AuthContextType {
  user: UserDtoReadable | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (userData: {
    name: string
    email: string
    password: string
    username: string
    firstName?: string
    lastName?: string
  }) => Promise<void>
  logout: () => void
  updateUser: (user: UserDtoReadable) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserDtoReadable | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch user profile
        const userProfile = await ApiService.getUserProfile()
        setUser(userProfile)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Authentication check failed:", error)
        localStorage.removeItem("auth_token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true)
    try {
      const token = await ApiService.login(email, password, rememberMe)
      localStorage.setItem("auth_token", token)

      // Fetch user profile after successful login
      const userProfile = await ApiService.getUserProfile()
      setUser(userProfile)
      setIsAuthenticated(true)
      navigate("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    username: string
    firstName?: string
    lastName?: string
  }) => {
    setIsLoading(true)
    try {
      await ApiService.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })

      // Auto login after registration
      await login(userData.email, userData.password)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    setIsAuthenticated(false)
    navigate("/auth")
  }

  const updateUser = (updatedUser: UserDtoReadable) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook for accessing authentication context
 * @returns Authentication context values and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
