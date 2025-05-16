"use client"

import type React from "react"
import { createContext, useState, useEffect, useCallback, useContext } from "react"
import { ApiService } from "../services/api-service"
import { ToastContext } from "./ToastContext"
import { AuthContext } from "./AuthContext"
import type { NotificationDto } from "../../api-client/types.gen"

interface NotificationContextType {
  notifications: NotificationDto[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
})

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const { showError } = useContext(ToastContext)
  const { isAuthenticated } = useContext(AuthContext)

  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      const fetchedNotifications = await ApiService.getNotifications()
      setNotifications(fetchedNotifications)

      // Calculate unread count
      const unreadNotifications = fetchedNotifications.filter((notification) => !notification.isRead)
      setUnreadCount(unreadNotifications.length)
    } catch (error: unknown) {
      console.error("Failed to fetch notifications:", error)
      showError("Failed to fetch notifications")
    }
  }, [isAuthenticated, showError])

  const markAsRead = useCallback(
    async (notificationId: number): Promise<void> => {
      try {
        await ApiService.markNotificationAsRead(notificationId)

        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification: NotificationDto) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification,
          ),
        )

        // Recalculate unread count
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
      } catch (error: unknown) {
        console.error("Failed to mark notification as read:", error)
        showError("Failed to mark notification as read")
      }
    },
    [showError],
  )

  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await ApiService.markAllNotificationsAsRead()

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, isRead: true })),
      )

      // Reset unread count
      setUnreadCount(0)
    } catch (error: unknown) {
      console.error("Failed to mark all notifications as read:", error)
      showError("Failed to mark all notifications as read")
    }
  }, [showError])

  // Fetch notifications on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated, fetchNotifications])

  // Set up polling for new notifications
  useEffect(() => {
    if (!isAuthenticated) return

    const intervalId = setInterval(() => {
      fetchNotifications()
    }, 60000) // Poll every minute

    return () => clearInterval(intervalId)
  }, [isAuthenticated, fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
