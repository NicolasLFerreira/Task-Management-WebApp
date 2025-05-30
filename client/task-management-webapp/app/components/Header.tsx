"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { Bell, Search, User, Menu, X, CheckCircle, MessageSquare, Calendar, Info } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "./ThemeProvider"
import { UserService, NotificationService, type NotificationDto } from "../../api-client"
import type { UserDtoReadable } from "../../api-client/types.gen"

type HeaderProps = {
  toggleSidebarMobile?: () => void
  sidebarVisible?: boolean
}

const Header = ({ toggleSidebarMobile, sidebarVisible }: HeaderProps) => {
  const { logout, user, isAuthenticated } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserDtoReadable | null>(null)

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const response = await UserService.getApiUsersProfile()
          if (response.data) {
            setUserProfile(response.data)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [isAuthenticated, user])

  useEffect(() => {
    // Initial fetch of notifications
    fetchNotifications()

    // Set up polling for notifications
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications(false) // Don't show loading state for polling
    }, 30000) // Poll every 30 seconds

    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [isAuthenticated])

  const fetchNotifications = async (showLoading = true) => {
    if (!isAuthenticated) return

    if (showLoading) {
      setNotificationsLoading(true)
    }

    try {
      const response = await NotificationService.getApiNotificationsUnread()
      setNotifications(response.data || [])
    } catch (err) {
      console.error("Error fetching notifications:", err)
    } finally {
      if (showLoading) {
        setNotificationsLoading(false)
      }
    }
  }

  const handleNotificationClick = (notification: NotificationDto) => {
    // If notification is not read, mark it as read
    if (!notification.isRead && notification.id) {
      NotificationService.postApiNotificationsByNotificationIdRead({
        path: { notificationId: notification.id },
      }).catch((err) => console.error("Error marking notification as read:", err))
    }

    // Navigate based on notification type
    if (notification.actionLink) {
      // If there's a specific action link, use it
      navigate(notification.actionLink)
    } else if (notification.entityType === "TaskItem" && notification.entityId) {
      // Navigate to the task detail page or board containing the task
      navigate(`/boards?taskId=${notification.entityId}`)
    } else if (notification.entityType === "Board" && notification.entityId) {
      // Navigate to the board
      navigate(`/boards?boardId=${notification.entityId}`)
    }

    setShowNotifications(false)
  }

  const formatDate = (dateString?: Date) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (type?: number) => {
    switch (type) {
      case 0: // TaskAssigned
        return <CheckCircle size={16} className="text-blue-500" />
      case 1: // TaskCompleted
        return <CheckCircle size={16} className="text-green-500" />
      case 2: // TaskDueSoon
        return <Calendar size={16} className="text-amber-500" />
      case 3: // CommentAdded
        return <MessageSquare size={16} className="text-purple-500" />
      case 4: // MentionedInComment
        return <Bell size={16} className="text-pink-500" />
      case 5: // SystemNotification
      default:
        return <Info size={16} className="text-gray-500" />
    }
  }

  const handleLogout = () => {
    logout()
  }

  const navigateTo = (path: string) => {
    navigate(path)
    setShowUserMenu(false)
    setShowNotifications(false)
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = searchTerm.trim()
      if (term) {
        navigate(`/search?q=${encodeURIComponent(term)}`)
        setSearchTerm("")
      }
    }
  }

  // Get display name from user profile or auth context
  const getDisplayName = () => {
    if (userProfile) {
      return userProfile.fullName || userProfile.username || "User"
    }
    return user?.username || "User"
  }

  const markAllAsRead = async () => {
    try {
      await NotificationService.postApiNotificationsReadAll()
      setNotifications([]) // Clear notifications after marking all as read
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
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
            onClick={() => {
              setShowNotifications(!showNotifications)
              if (!showNotifications) {
                setShowUserMenu(false)
              }
            }}
            className="p-2 rounded-full hover:bg-teal-700 transition-colors relative"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
              </span>
)}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-20 text-gray-800"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="notifications-menu"
            >
              <div className="py-2 px-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-teal-600 hover:text-teal-800">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationsLoading && notifications.length === 0 ? (
                  <div className="py-4 px-3 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-4 px-3 text-center text-gray-500">No new notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="py-2 px-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                      role="menuitem"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5 mr-2">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm">{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notification.creationDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="py-2 px-3 text-center border-t border-gray-100">
                <button
                  className="text-sm text-teal-600 hover:text-teal-800"
                  onClick={() => {
                    navigateTo("/notifications")
                    setShowNotifications(false)
                  }}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
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
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              if (!showUserMenu) {
                setShowNotifications(false)
              }
            }}
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
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">{getDisplayName()}</div>
                <button
                  onClick={() => navigateTo("/dashboard")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigateTo("/settings")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Profile
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
