"use client"

import { useState } from "react"
import type { TaskItemDto } from "api-client"
import { Calendar, Clock, Tag } from "lucide-react"

interface TaskCardProps {
  task: TaskItemDto
}

const TaskCard = ({ task }: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    const due = new Date(dueDate)
    const now = new Date()
    return due < now
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            <Calendar size={14} className="mr-1" />
            <span className={isOverdue(task.dueDate) ? "text-red-500 dark:text-red-400" : ""}>
              {formatDate(task.dueDate)}
              {isOverdue(task.dueDate) && " (Overdue)"}
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
            onClick={() => setExpanded(!expanded)}
            className="text-teal-600 dark:text-teal-400 text-xs mt-1 hover:underline focus:outline-none"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {task.labels?.map((label, index) => (
            <div
              key={index}
              className="flex items-center text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
            >
              <Tag size={12} className="mr-1" />
              {label.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Clock size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Created {formatDate(task.createdAt)}</span>
        </div>
        <button className="text-teal-600 dark:text-teal-400 text-sm hover:underline">View</button>
      </div>
    </div>
  )
}

export default TaskCard
