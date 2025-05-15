"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import LoginForm from "../components/Auth/LoginForm"
import RegisterForm from "../components/Auth/RegisterForm"
import ApiDebugger from "../components/ApiDebugger"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showDebugger, setShowDebugger] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token")
    if (token) {
      console.log("User already logged in, redirecting to dashboard")
      navigate("/dashboard")
    }
    setIsLoading(false)
  }, [navigate])

  const handleLoginSuccess = (token: string) => {
    // Store token and redirect to dashboard
    localStorage.setItem("auth_token", token)
    console.log("Login successful, redirecting to dashboard")
    navigate("/dashboard")
  }

  const handleRegisterSuccess = () => {
    // Switch to login view after successful registration
    console.log("Registration successful, switching to login view")
    setIsLogin(true)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-indigo-600">Tickway</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Task Management Made Simple</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm onSuccess={handleLoginSuccess} onRegisterClick={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSuccess={handleRegisterSuccess} onLoginClick={() => setIsLogin(true)} />
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => setShowDebugger(!showDebugger)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {showDebugger ? "Hide API Debugger" : "Show API Debugger"}
        </button>
      </div>

      {showDebugger && (
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-lg">
          <ApiDebugger />
        </div>
      )}
    </div>
  )
}

export default Auth
