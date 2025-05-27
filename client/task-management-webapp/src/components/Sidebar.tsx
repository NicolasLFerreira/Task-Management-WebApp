"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Bell,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Moon,
  Sun,
  Users,
} from "lucide-react"

type SidebarProps = {
  darkMode: boolean
  toggleDarkMode: () => void
  onCollapsedChange: (collapsed: boolean) => void
  initialCollapsed?: boolean
  mobileVisible?: boolean
  onMobileClose?: () => void
}

const Sidebar = ({
  darkMode,
  toggleDarkMode,
  onCollapsedChange,
  initialCollapsed = false,
  mobileVisible,
  onMobileClose,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed || false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    // Get the current page from localStorage or default to dashboard
    const savedPage = localStorage.getItem("currentPage")
    return savedPage || "dashboard"
  })

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed
    setCollapsed(newCollapsedState)
    onCollapsedChange(newCollapsedState)
  }

  const navigateTo = (page: string) => {
    setCurrentPage(page)
    localStorage.setItem("currentPage", page)

    // Use window.history to update the URL without a page reload
    window.history.pushState({}, "", `/${page}`)

    // Dispatch a custom event that the App component can listen for
    window.dispatchEvent(new CustomEvent("navigationChange", { detail: { page } }))
  }

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } fixed left-0 top-16 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 transition-all duration-300 shadow-md z-20 ${
        isMobile ? (mobileVisible ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
      }`}
    >
      {isMobile && mobileVisible && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={onMobileClose} aria-hidden="true" />
      )}
      <button
        onClick={toggleSidebar}
        className={`absolute -right-3 top-6 bg-teal-600 text-white rounded-full p-1 shadow-md ${
          isMobile && collapsed ? "translate-x-full" : ""
        }`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="py-4">
        <ul className="space-y-2 px-2">
          <NavItem
            page="dashboard"
            currentPage={currentPage}
            onClick={() => navigateTo("dashboard")}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            collapsed={collapsed}
          />
          <NavItem
            page="boards"
            currentPage={currentPage}
            onClick={() => navigateTo("boards")}
            icon={<Kanban size={20} />}
            label="Boards"
            collapsed={collapsed}
          />
          <NavItem
            page="tasks"
            currentPage={currentPage}
            onClick={() => navigateTo("tasks")}
            icon={<CheckSquare size={20} />}
            label="My Tasks"
            collapsed={collapsed}
          />
          <NavItem
            page="notifications"
            currentPage={currentPage}
            onClick={() => navigateTo("notifications")}
            icon={<Bell size={20} />}
            label="Notifications"
            collapsed={collapsed}
          />
          <NavItem
            page="search"
            currentPage={currentPage}
            onClick={() => navigateTo("search")}
            icon={<Search size={20} />}
            label="Search"
            collapsed={collapsed}
          />
          <NavItem
            page="chat"
            currentPage={currentPage}
            onClick={() => navigateTo("chat")}
            icon={<MessageSquare size={20} />}
            label="Chat"
            collapsed={collapsed}
          />
          <NavItem
            page="team"
            currentPage={currentPage}
            onClick={() => navigateTo("team")}
            icon={<Users size={20} />}
            label="Team"
            collapsed={collapsed}
          />
          <NavItem
            page="settings"
            currentPage={currentPage}
            onClick={() => navigateTo("settings")}
            icon={<Settings size={20} />}
            label="Settings"
            collapsed={collapsed}
          />
        </ul>
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center ${
            collapsed ? "justify-center w-full" : "justify-between w-full"
          } p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span className="ml-3">{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>
    </div>
  )
}

type NavItemProps = {
  page: string
  currentPage: string
  onClick: () => void
  icon: React.ReactNode
  label: string
  collapsed: boolean
}

const NavItem = ({ page, currentPage, onClick, icon, label, collapsed }: NavItemProps) => {
  const isActive = currentPage === page

  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center w-full ${
          collapsed ? "justify-center" : "justify-start"
        } p-2 rounded-md transition-colors ${
          isActive
            ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!collapsed && <span className="ml-3">{label}</span>}
      </button>
    </li>
  )
}

export default Sidebar
