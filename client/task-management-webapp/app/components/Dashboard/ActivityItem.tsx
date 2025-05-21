"use client"

import type { RecentActivityDto } from "api-client"
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "../../lib/utils"

interface ActivityItemProps {
  activity: RecentActivityDto
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const getActivityIcon = () => {
    switch (activity.type?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "due":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityColor = () => {
    switch (activity.type?.toLowerCase()) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
      case "due":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
      case "overdue":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="flex items-start space-x-4 py-3">
      <div className={`p-2 rounded-full ${getActivityColor()}`}>{getActivityIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
        <div className="flex items-center mt-1">
          <span className={`text-xs px-2 py-1 rounded-full ${getActivityColor()}`}>{activity.status}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {activity.date ? formatDistanceToNow(new Date(activity.date)) : "Unknown time"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ActivityItem
