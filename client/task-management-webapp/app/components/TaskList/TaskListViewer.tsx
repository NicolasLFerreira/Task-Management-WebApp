"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { TaskItemService, type TaskItemDto } from "api-client"
import { Loader2, AlertCircle, Calendar, Tag, Clock } from "lucide-react"

interface TaskListViewerProps {
  listId: number
  onTaskClick: (taskId: number) => void
}

const TaskListViewer: React.FC<TaskListViewerProps> = ({ listId, onTaskClick }) => {
  const [tasks, setTasks] = useState<TaskItemDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [listId])

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await TaskItemService.getApiTasksListByListId({
        path: { listId },
      })

      setTasks(response.data || [])
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to load tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: Date) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 0:
        return "Low"
      case 1:
        return "Medium"
      case 2:
        return "High"
      case 3:
        return "Critical"
      default:
        return "Not set"
    }
  }

  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 0:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case 2:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case 3:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status?: number) => {
    switch (status) {
      case 0:
        return "To Do"
      case 1:
        return "In Progress"
      case 2:
        return "In Review"
      case 3:
        return "Completed"
      case 4:
        return "Archived"
      default:
        return "Not set"
    }
  }

  const getStatusColor = (status?: number) => {
    switch (status) {
      case 0:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case 2:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case 3:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case 4:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tasks in List {listId}</h2>
        <button
          onClick={fetchTasks}
          className="mt-2 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Refresh Tasks
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No tasks found in this list.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => task.id && onTaskClick(task.id)}
            >
              <div className="flex flex-col">
                <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>

                {task.description && (
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</div>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  {task.priority !== undefined && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority,
                      )}`}
                    >
                      <Tag size={12} className="mr-1" />
                      {getPriorityLabel(task.priority)}
                    </span>
                  )}

                  {task.progressStatus !== undefined && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        task.progressStatus,
                      )}`}
                    >
                      {getStatusLabel(task.progressStatus)}
                    </span>
                  )}

                  {task.dueDate && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Created: {formatDate(task.createdAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TaskListViewer
