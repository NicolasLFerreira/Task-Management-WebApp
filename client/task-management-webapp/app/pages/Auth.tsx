"use client"

import { useState } from "react"
import LoginForm from "../components/Auth/LoginForm"
import RegisterForm from "../components/Auth/RegisterForm"
import ApiDebugger from "../components/ApiDebugger"
import { useAuth } from "../contexts/AuthContext"
import { Helmet } from "react-helmet-async"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showDebugger, setShowDebugger] = useState(false)
  const { login } = useAuth()

  const handleLoginSuccess = (token: string) => {
    // Store token and redirect to dashboard
    login(token)
  }

  const handleRegisterSuccess = () => {
    // Switch to login view after successful registration
    console.log("Registration successful, switching to login view")
    setIsLogin(true)
  }

  return (
    <>
      <Helmet>
        <title>Tickway – Login or Register</title>
        <meta name="description" content="Login or create an account for Tickway Task Manager." />
      </Helmet>

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-extrabold text-teal-600">Tickway</h1>
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
          <button onClick={() => setShowDebugger(!showDebugger)} className="text-sm text-teal-600 hover:text-teal-500">
            {showDebugger ? "Hide API Debugger" : "Show API Debugger"}
          </button>
        </div>

        {showDebugger && (
          <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-lg">
            <ApiDebugger />
          </div>
        )}
      </div>
    </>
  )
}

export default Auth
