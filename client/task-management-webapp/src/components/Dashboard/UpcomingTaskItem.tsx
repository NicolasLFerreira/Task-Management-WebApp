"use client"

import type { UpcomingTaskDto } from "api-client"
import { Calendar, Flag } from "lucide-react"
import { formatDate } from "../../lib/utils"

interface UpcomingTaskItemProps {
  task: UpcomingTaskDto
}

const UpcomingTaskItem = ({ task }: UpcomingTaskItemProps) => {
  const getPriorityColor = () => {
    switch (task.priority?.toLowerCase()) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBadge = () => {
    switch (task.status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
      case "in progress":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
      case "todo":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
      case "overdue":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
        <span className={`inline-flex items-center ${getPriorityColor()}`}>
          <Flag className="h-4 w-4 mr-1" />
          <span className="text-xs">{task.priority}</span>
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{task.dueDate ? formatDate(new Date(task.dueDate)) : "No due date"}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge()}`}>{task.status}</span>
      </div>
    </div>
  )
}

export default UpcomingTaskItem
