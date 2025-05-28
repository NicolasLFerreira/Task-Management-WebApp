"use client"

import { useState, useEffect, useRef } from "react"
import PageContainer from "../components/PageContainer"
import { NotificationService, type NotificationDto } from "../../api-client"
import { Bell, RefreshCw, Loader2, CheckCircle, MessageSquare, Calendar, AlertCircle, Info } from "lucide-react"
import { useNavigate } from "react-router"

const POLLING_INTERVAL = 30000 // Poll every 30 seconds

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up polling
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications(false) // Don't show loading state for polling
    }, POLLING_INTERVAL)

    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await NotificationService.getApiNotifications()
      setNotifications(response.data || [])
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications. Please try again.")
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      await NotificationService.postApiNotificationsReadAll()
      // Update local state to mark all as read
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    } catch (err) {
      console.error("Error marking notifications as read:", err)
      setError("Failed to mark notifications as read")
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await NotificationService.postApiNotificationsByNotificationIdRead({
        path: { notificationId },
      })

      // Update the local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const handleNotificationClick = (notification: NotificationDto) => {
    // If notification is not read, mark it as read
    if (!notification.isRead && notification.id) {
      markAsRead(notification.id)
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
        return <CheckCircle size={18} className="text-blue-500" />
      case 1: // TaskCompleted
        return <CheckCircle size={18} className="text-green-500" />
      case 2: // TaskDueSoon
        return <Calendar size={18} className="text-amber-500" />
      case 3: // CommentAdded
        return <MessageSquare size={18} className="text-purple-500" />
      case 4: // MentionedInComment
        return <Bell size={18} className="text-pink-500" />
      case 5: // SystemNotification
      default:
        return <Info size={18} className="text-gray-500" />
    }
  }

  const getNotificationTypeText = (type?: number) => {
    switch (type) {
      case 0:
        return "Task Assigned"
      case 1:
        return "Task Completed"
      case 2:
        return "Due Soon"
      case 3:
        return "New Comment"
      case 4:
        return "Mentioned"
      case 5:
        return "System"
      default:
        return "Notification"
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <PageContainer>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => fetchNotifications()}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            </button>

            <button
              onClick={markAllAsRead}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isLoading || notifications.every((n) => n.isRead)}
            >
              Mark all as read
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-teal-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">No notifications</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! No new notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    notification.isRead ? "opacity-75" : "bg-teal-50 dark:bg-teal-900/10"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{notification.content}</div>
                        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(notification.creationDate)}
                        </div>
                      </div>
                      <div className="mt-1 text-xs flex items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          {getNotificationTypeText(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-teal-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Notifications
