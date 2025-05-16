"use client"

import type React from "react"
import { createContext, useState, useEffect, useCallback } from "react"
import { ApiService } from "../services/api-service"
import type { UserDtoReadable } from "../../api-client/types.gen"

interface AuthContextType {
  isAuthenticated: boolean
  user: UserDtoReadable | null
  token: string | null
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
  getToken: () => string | null
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  getToken: () => null,
})

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<UserDtoReadable | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)

      // Fetch user profile
      ApiService.getUserProfile()
        .then((userProfile) => {
          setUser(userProfile)
        })
        .catch((error: unknown) => {
          console.error("Failed to fetch user profile:", error)
          // If token is invalid, clear auth state
          localStorage.removeItem("auth_token")
          setToken(null)
          setIsAuthenticated(false)
          setUser(null)
        })
        .finally(() => {
          setIsInitialized(true)
        })
    } else {
      setIsInitialized(true)
    }
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<void> => {
    try {
      const authToken = await ApiService.login(email, password, rememberMe)
      localStorage.setItem("auth_token", authToken)
      setToken(authToken)
      setIsAuthenticated(true)

      // Fetch user profile after successful login
      const userProfile = await ApiService.getUserProfile()
      setUser(userProfile)
    } catch (error: unknown) {
      console.error("Login failed:", error)
      throw error
    }
  }, [])

  const register = useCallback(
    async (userData: {
      name: string
      email: string
      password: string
      username: string
      firstName?: string
      lastName?: string
    }): Promise<void> => {
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
      } catch (error: unknown) {
        console.error("Registration failed:", error)
        throw error
      }
    },
    [login],
  )

  const logout = useCallback((): void => {
    localStorage.removeItem("auth_token")
    setToken(null)
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  const getToken = useCallback((): string | null => {
    return token
  }, [token])

  if (!isInitialized) {
    // You could return a loading spinner here
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        register,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
