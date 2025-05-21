"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AccountService } from "../../../api-client"
import { PasswordStrengthMeter } from "./PasswordStrengthMeter"
import { cn } from "../../lib/utils"

interface RegisterFormProps {
  onSuccess: () => void
  onLoginClick: () => void
}

const RegisterForm = ({ onSuccess, onLoginClick }: RegisterFormProps) => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [passwordScore, setPasswordScore] = useState(0)
  const [success, setSuccess] = useState(false)

  // Generate username suggestion from email when email changes
  useEffect(() => {
    if (email && !username) {
      setUsername(email.split("@")[0])
    }
  }, [email, username])

  const emailRegexString = "^[a-z]*[a-z0-9]@.*[a-z].[com,net]";
  const emailRegex = /^[a-z]*[a-z0-9]@.*[a-z].[com,net]/;

  const handleSubmit = async () => {
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (passwordScore < 3) {
      setError("Please create a stronger password")
      return
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    // Validate username
    if (!username) {
      setError("Username is required")
      return
    }

    setIsLoading(true)

    try {
      // Construct the full name by combining firstName and lastName
      const name = `${firstName} ${lastName}`.trim()

      // Log the exact request body we're sending
      const requestBody = {
        name,
        email,
        password,
        username,
        firstName,
        lastName,
      }

      console.log("Registration request body:", JSON.stringify(requestBody))

      const response = await AccountService.register({
        body: requestBody,
      })

      console.log("Registration API response:", response)

      if (response.data) {
        // Registration successful
        console.log("Registration successful:", response.data)
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError("Registration failed")
      }
    } catch (err: unknown) {
      console.error("Registration error:", err)
      // Enhanced error logging
      if (err instanceof Error) {
        console.error("Error name:", err.name)
        console.error("Error message:", err.message)
      }
      const error = err as { response?: { data?: { message?: string }; status?: number; statusText?: string } }
      console.error("Response status:", error.response?.status)
      console.error("Response status text:", error.response?.statusText)
      console.error("Response data:", error.response?.data)

      setError(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordScoreChange = (score: number) => {
    setPasswordScore(score)
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 h-16 w-16 text-green-500 flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Registration Successful!</h3>
            <p className="text-gray-600">
              Your account has been created successfully. You can now log in with your credentials.
            </p>
            <button
              onClick={onLoginClick}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-teal-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
            TW
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Tickaway</h2>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create an Account</h2>
        <p className="text-gray-600 mb-6">Enter your information to create an account</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                placeholder="First Name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
              placeholder="Username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              pattern={emailRegexString}
              title="Please enter a valid email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              required
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-gray-900",
                passwordScore >= 3
                  ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500",
              )}
            />
            {passwordFocused && password.length > 0 && (
              <PasswordStrengthMeter password={password} onScoreChange={handlePasswordScoreChange} />
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-gray-900",
                confirmPassword && password === confirmPassword
                  ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500",
              )}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <div>
            <button
              disabled={isLoading}
              onClick={() => handleSubmit()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={onLoginClick} className="font-medium text-teal-600 hover:text-teal-500 focus:outline-none">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
