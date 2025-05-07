"use client"
import Dashboard from "../pages/Dashboard"
import { useEffect } from "react"
import { useNavigate } from "react-router"

export function meta() {
  return [{ title: "Tickway – Dashboard" }, { name: "description", content: "Manage your tasks with Tickway." }]
}

export default function DashboardRoute() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token")
    if (!token) {
      console.log("User not authenticated, redirecting to login")
      navigate("/auth")
    }
  }, [navigate])

  return <Dashboard />
}
