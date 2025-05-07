"use client"

import type React from "react"

import { Navigate, Outlet, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "../context/auth-context"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // If user is already authenticated and tries to access login/register, redirect to dashboard
  if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/register")) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function Component() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}

function Routes() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Handle the root path redirect
  if (location.pathname === "/") {
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
  }

  // Public routes (login, register)
  if (location.pathname === "/login" || location.pathname === "/register") {
    return (
      <PublicRoute>
        <Outlet />
      </PublicRoute>
    )
  }

  // Protected routes (everything else)
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  )
}
