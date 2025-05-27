"use client"

import type React from "react"
import { Navigate, useLocation } from "react-router"
import { useAuth } from "../contexts/AuthContext"

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, redirectTo = "/dashboard" }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || redirectTo

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  // Redirect to dashboard or previous location if authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  // Render children if not authenticated
  return <>{children}</>
}

export default PublicRoute
