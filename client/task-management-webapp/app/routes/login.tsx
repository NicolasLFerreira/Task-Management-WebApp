"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Form, FormError, FormField, FormLabel } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { useAuth } from "../context/auth-context"
import { authApi } from "../services/api"
import type { LoginRequest } from "../types"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginRequest>({
    email: "test@example.com", // Pre-fill with test user
    password: "Password123!", // Pre-fill with test password
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<string>("Checking API...")

  // Display any messages passed via location state
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message)
    }

    // Check API health
    const checkApiHealth = async () => {
      try {
        const health = await authApi.checkHealth()
        setApiStatus(`API is ${health.status} as of ${new Date(health.timestamp).toLocaleTimeString()}`)
      } catch (err) {
        setApiStatus("API is unreachable")
        console.error("API health check failed:", err)
      }
    }

    checkApiHealth()
  }, [location.state])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log("Submitting login form:", formData)
      const token = await authApi.login(formData)
      console.log("Login successful, received token")
      login(token)
      navigate("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              create a new account
            </Link>
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <p>Status: {apiStatus}</p>
            <p className="mt-1 text-green-500">Use the pre-filled test account credentials</p>
          </div>
        </div>

        <div className="mt-8 bg-white px-6 py-8 shadow-md rounded-lg dark:bg-gray-800">
          <Form onSubmit={handleSubmit}>
            <FormField>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </FormField>

            <FormError>{error}</FormError>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
