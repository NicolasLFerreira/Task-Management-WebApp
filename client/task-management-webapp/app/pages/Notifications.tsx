"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"
import { NotificationService } from "api-client"
import type { NotificationDto, TaskItemDto, TaskItemPriority, TaskItemStatus } from "api-client"
import {
  Bell,
  Calendar,
  CheckCircle,
  MessageSquare,
  UserPlus,
  AtSign,
  Clock
} from "lucide-react"
// If using Next.js and internal routing:
import TaskCard from "../components/TaskItem/TaskCard"

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sample task for demo purposes
  const sampleTask: TaskItemDto = {
    id: 1,
    title: "Complete project documentation",
    description: "Finish writing the technical documentation for the new feature implementation. Include API endpoints, data models, and usage examples for the development team.",
    dueDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    creationTime: new Date(),
    priority: "High" as TaskItemPriority,
    progressStatus: "InProgress" as TaskItemStatus,
    ownerUserName: "John Doe",
    labels: [
      { id: 1, name: "Documentation", color: "#4299E1" },
      { id: 2, name: "Urgent", color: "#F56565" }
    ],
    createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }

  // Sample overdue task
  const overdueTask: TaskItemDto = {
    id: 2,
    title: "Review pull request #42",
    description: "Review the code changes in PR #42 for the authentication module. Check for security issues and code quality.",
    dueDate: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
    creationTime: new Date(),
    priority: "Medium" as TaskItemPriority,
    progressStatus: "Todo" as TaskItemStatus,
    ownerUserName: "Jane Smith",
    labels: [
      { id: 3, name: "Code Review", color: "#805AD5" }
    ],
    createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await NotificationService.getApiNotifications()
        setNotifications(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError("Failed to load notifications. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (notificationId: number) => {
    try {
      await NotificationService.postApiNotificationsByNotificationIdRead({
        params: { notificationId }
      })
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await NotificationService.postApiNotificationsReadAll()
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const getNotificationIcon = (type?: number) => {
    switch (type) {
      case 0:
        return <Bell className="h-5 w-5 text-gray-500" />
      case 1:
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 2:
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 3:
        return <UserPlus className="h-5 w-5 text-purple-500" />
      case 4:
        return <AtSign className="h-5 w-5 text-orange-500" />
      case 5:
        return <Calendar className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return "Unknown date"
    const now = new Date()
    const notificationDate = new Date(date)

    const isToday = notificationDate.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = notificationDate.toDateString() === yesterday.toDateString()

    if (isToday) {
      return `Today at ${notificationDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    } else if (isYesterday) {
      return `Yesterday at ${notificationDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    } else {
      return notificationDate.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  }

  return (
    <PageContainer>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Task Card Demo Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Task Card Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TaskCard task={sampleTask} />
            <TaskCard task={overdueTask} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all ${
                  !notification.isRead ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.content}
                      </p>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDate(notification.creationDate)}</span>
                    </div>
                    {notification.actionLink && (
                      notification.actionLink.startsWith("/") ? (
                        <Link href={notification.actionLink} className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          View details
                        </Link>
                      ) : (
                        <a
                          href={notification.actionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View details
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Notifications
