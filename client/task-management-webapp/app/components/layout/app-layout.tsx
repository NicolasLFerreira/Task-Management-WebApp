"use client"

import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CheckSquare, LogOut, Plus, User } from "lucide-react"
import { useAuth } from "../../context/auth-context"
import { Button } from "../ui/button"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TaskManager</span>
              </Link>
              <nav className="ml-10 hidden space-x-8 md:flex">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/tasks"
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
                >
                  Tasks
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Link to="/tasks/new">
                <Button variant="primary" size="sm" className="mr-4">
                  <Plus className="h-4 w-4 mr-1" />
                  New Task
                </Button>
              </Link>
              <div className="relative ml-3">
                <div className="flex items-center">
                  <Link to="/profile" className="flex items-center mr-4">
                    <User className="h-8 w-8 rounded-full bg-gray-200 p-1 text-gray-700 dark:bg-gray-700 dark:text-gray-200" />
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

export default AppLayout
