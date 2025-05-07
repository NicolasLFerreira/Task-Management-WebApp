"use client"

import { CheckCircle, Clock, Edit, Trash } from "lucide-react"
import { type Task, TaskPriority, TaskStatus } from "../../types"
import { Button } from "../ui/button"
import { formatDate } from "../../utils/date-formatter"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case TaskPriority.Medium:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case TaskPriority.High:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Todo:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case TaskStatus.InProgress:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case TaskStatus.Completed:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low:
        return "Low"
      case TaskPriority.Medium:
        return "Medium"
      case TaskPriority.High:
        return "High"
      default:
        return "Unknown"
    }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Todo:
        return "To Do"
      case TaskStatus.InProgress:
        return "In Progress"
      case TaskStatus.Completed:
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const handleStatusChange = () => {
    let newStatus: TaskStatus

    switch (task.progressStatus) {
      case TaskStatus.Todo:
        newStatus = TaskStatus.InProgress
        break
      case TaskStatus.InProgress:
        newStatus = TaskStatus.Completed
        break
      case TaskStatus.Completed:
        newStatus = TaskStatus.Todo
        break
      default:
        newStatus = TaskStatus.Todo
    }

    onStatusChange(task.id, newStatus)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.progressStatus)}`}>
              {getStatusLabel(task.progressStatus)}
            </span>
          </div>
        </div>

        {task.description && <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{task.description}</p>}

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Clock className="w-4 h-4 mr-1" />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>

        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>

          <Button variant="ghost" size="sm" onClick={handleStatusChange}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Change Status
          </Button>

          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
            <Trash className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
