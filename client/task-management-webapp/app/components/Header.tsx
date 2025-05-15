"use client"

import { useState } from "react"
import { Bell, Search, User, Menu, X } from "lucide-react"

type HeaderProps = {
  toggleSidebarMobile?: () => void
  sidebarVisible?: boolean
}

const Header = ({ toggleSidebarMobile, sidebarVisible }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    { id: 1, text: "New task assigned to you", time: "5 min ago" },
    { id: 2, text: "Comment on 'Project Plan'", time: "1 hour ago" },
    { id: 3, text: "Due date approaching for 'Submit Report'", time: "3 hours ago" },
  ])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    window.location.href = "/auth"
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
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-teal-700 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-20 text-gray-800">
              <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="py-2 px-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="py-2 px-3 text-center border-t border-gray-100">
                <button className="text-sm text-teal-600 hover:text-teal-800">View all notifications</button>
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
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-200" />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1 focus:outline-none"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center">
              <User size={18} />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 text-gray-800">
              <div className="py-2">
                <a href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
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
