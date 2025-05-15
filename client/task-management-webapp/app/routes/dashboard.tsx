"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { ThemeProvider } from "../components/ThemeProvider"
import Dashboard from "../pages/Dashboard"
import Boards from "../pages/Boards"
import MyTasks from "../pages/MyTasks"
import Notifications from "../pages/Notifications"
import Search from "../pages/Search"
import Chat from "../pages/Chat"
import Team from "../pages/Team"
import Settings from "../pages/Settings"

export function meta() {
  return [{ title: "Tickaway – Dashboard" }, { name: "description", content: "Manage your tasks with Tickaway." }]
}

export default function DashboardRoute() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(() => {
    // Get the current page from localStorage or default to dashboard
    const savedPage = localStorage.getItem("currentPage")
    return savedPage || "dashboard"
  })

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token")
    if (!token) {
      console.log("User not authenticated, redirecting to login")
      navigate("/auth")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [navigate])

  useEffect(() => {
    // Listen for navigation changes from the Sidebar component
    const handleNavigationChange = (event: CustomEvent) => {
      setCurrentPage(event.detail.page)
    }

    window.addEventListener("navigationChange", handleNavigationChange as EventListener)

    // Check if the URL path matches any of our pages
    const path = window.location.pathname.substring(1) // Remove the leading slash
    if (
      path &&
      ["dashboard", "boards", "tasks", "notifications", "search", "chat", "team", "settings"].includes(path)
    ) {
      setCurrentPage(path)
      localStorage.setItem("currentPage", path)
    }

    return () => {
      window.removeEventListener("navigationChange", handleNavigationChange as EventListener)
    }
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "boards":
        return <Boards />
      case "tasks":
        return <MyTasks />
      case "notifications":
        return <Notifications />
      case "search":
        return <Search />
      case "chat":
        return <Chat />
      case "team":
        return <Team />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return isAuthenticated ? <ThemeProvider>{renderCurrentPage()}</ThemeProvider> : null
}
