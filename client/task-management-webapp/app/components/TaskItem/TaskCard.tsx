"use client"

import { useState } from "react"
import { TaskItemPriority, type TaskItemDto } from "api-client"
import { Calendar, Clock } from "lucide-react"

interface TaskCardProps {
  task: TaskItemDto
  onClick?: () => void
  onViewClick?: () => void
}

const TaskCard = ({ task, onClick, onViewClick }: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false)

  const calculateDiffDays = (dueDateString?: Date) => {
    if (!dueDateString) return null
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const diffTime = dueDateNormalized.getTime() - todayNormalized.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const diffDays = task.dueDate ? calculateDiffDays(task.dueDate) : null

  const formatDate = (dateString?: Date) => {
    if (!dateString) return "No date set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case TaskItemPriority._0:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case TaskItemPriority._1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case TaskItemPriority._2:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case TaskItemPriority._3:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case TaskItemPriority._0:
        return "Low"
      case TaskItemPriority._1:
        return "Medium"
      case TaskItemPriority._2:
        return "High"
      case TaskItemPriority._3:
        return "Critical"
      default:
        return "None"
    }
  }

  const getDaysRemaining = (dueDateString?: Date): string => {
    if (!dueDateString) return "" // Return empty string if no due date

    const dueDate = new Date(dueDateString)
    const today = new Date()

    // Normalize dates to midnight to compare day differences accurately
    const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const diffTime = dueDateNormalized.getTime() - todayNormalized.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return ` (Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""})`
    } else if (diffDays === 0) {
      return " (Due today)"
    } else {
      return ` (${diffDays} day${diffDays > 1 ? "s" : ""} left)`
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
          {task.priority !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            <Calendar size={14} className="mr-1" />
            <span
              className={
                diffDays !== null && diffDays < 0
                  ? "text-red-500 dark:text-red-400 font-semibold"
                  : diffDays !== null && diffDays === 0
                    ? "text-orange-500 dark:text-orange-400 font-semibold"
                    : "text-green-600 dark:text-green-400"
              }
            >
              {formatDate(task.dueDate)}
              <span
                className={
                  diffDays !== null && diffDays < 0
                    ? "text-red-500 dark:text-red-400 font-semibold"
                    : diffDays !== null && diffDays === 0
                      ? "text-orange-500 dark:text-orange-400 font-semibold"
                      : "text-green-600 dark:text-green-400"
                }
              >
                {getDaysRemaining(task.dueDate)}
              </span>
            </span>
          </div>
        )}

        {task.description && (
          <p className={`text-gray-600 dark:text-gray-300 text-sm mt-2 ${expanded ? "" : "line-clamp-2"}`}>
            {task.description}
          </p>
        )}

        {task.description && task.description.length > 100 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="text-teal-600 dark:text-teal-400 text-xs mt-1 hover:underline focus:outline-none"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Clock size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Created {formatDate(task.createdAt)}</span>
        </div>
        <button
          className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            if (onViewClick) {
              onViewClick()
            } else if (onClick) {
              onClick()
            }
          }}
        >
          View
        </button>
      </div>
    </div>
  )
}

export default TaskCard
