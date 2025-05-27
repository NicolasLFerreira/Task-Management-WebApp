"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import { Bell, Search, User, Menu, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "./ThemeProvider"

type HeaderProps = {
  toggleSidebarMobile?: () => void
  sidebarVisible?: boolean
}

const Header = ({ toggleSidebarMobile, sidebarVisible }: HeaderProps) => {
  const { logout, user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    { id: 1, text: "New task assigned to you", time: "5 min ago" },
    { id: 2, text: "Comment on 'Project Plan'", time: "1 hour ago" },
    { id: 3, text: "Due date approaching for 'Submit Report'", time: "3 hours ago" },
  ])

  const handleLogout = () => {
    logout()
  }

  const navigateTo = (path: string) => {
    navigate(path)
    setShowUserMenu(false)
  }

  return (
    <header className="bg-teal-600 text-white py-3 px-4 shadow-md flex justify-between items-center h-16 fixed top-0 left-0 right-0 z-20">
      <div className="flex items-center">
        <button
          onClick={toggleSidebarMobile}
          className="mr-3 md:hidden text-white focus:outline-none"
          aria-label={sidebarVisible ? "Close menu" : "Open menu"}
        >
          {sidebarVisible ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-2xl font-bold tracking-wide">Tickaway</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-teal-700 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-teal-700 transition-colors relative"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-20 text-gray-800"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="notifications-menu"
            >
              <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="py-2 px-3 hover:bg-gray-50 border-b border-gray-100"
                    role="menuitem"
                  >
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="py-2 px-3 text-center border-t border-gray-100">
                <button
                  className="text-sm text-teal-600 hover:text-teal-800"
                  onClick={() => navigateTo("/notifications")}
                  role="menuitem"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Quick search..."
              className="bg-teal-700 text-white placeholder-teal-200 rounded-full py-1 px-4 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Quick search"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-200"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1 focus:outline-none"
            aria-label="User menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center">
              <User size={18} aria-hidden="true" />
            </div>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 text-gray-800"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  {user?.username || "User"}
                </div>
                <button
                  onClick={() => navigateTo("/profile")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigateTo("/settings")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
