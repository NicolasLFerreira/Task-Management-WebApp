"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Form, FormError, FormField, FormLabel } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { authApi } from "../services/api"
import type { RegisterRequest } from "../types"

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<string>("Checking API...")

  useEffect(() => {
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
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log("Submitting registration form:", formData)
      await authApi.register(formData)
      console.log("Registration successful")
      navigate("/login", { state: { message: "Registration successful! Please sign in." } })
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              sign in to your existing account
            </Link>
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <p>Status: {apiStatus}</p>
          </div>
        </div>

        <div className="mt-8 bg-white px-6 py-8 shadow-md rounded-lg dark:bg-gray-800">
          <Form onSubmit={handleSubmit}>
            <FormField>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </FormField>

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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </FormField>

            <FormError>{error}</FormError>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
