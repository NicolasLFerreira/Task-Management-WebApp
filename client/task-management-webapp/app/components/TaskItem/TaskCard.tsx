"use client"

import type React from "react"
import { type TaskItemDto, TaskItemPriority, TaskItemStatus } from "../../../api-client/types.gen"
import { Badge } from "../ui/Badge"
import { Avatar } from "../ui/Avatar"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, Clock, ListChecks } from "lucide-react"
import { useDragDrop } from "../../hooks/useDragDrop"

interface TaskCardProps {
  task: TaskItemDto
  listId: number
  index: number
  onClick?: (task: TaskItemDto) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, listId, index, onClick }) => {
  const { startDrag, handleDragOver, drop } = useDragDrop()

  // Helper functions
  const getPriorityLabel = (priority: TaskItemPriority | undefined) => {
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

  const getPriorityColor = (priority: TaskItemPriority | undefined) => {
    switch (priority) {
      case TaskItemPriority._0:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case TaskItemPriority._1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case TaskItemPriority._2:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case TaskItemPriority._3:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Calculate checklist completion if available
  const checklistItems = task.checklists?.flatMap((cl) => cl.items || []) || []
  const completedItems = checklistItems.filter((item) => item.isChecked).length
  const totalItems = checklistItems.length

  // Check if task is overdue
  const isOverdue = (dueDate: Date | null | undefined): boolean => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  // Use listId and index in a data attribute to avoid unused variable warnings
  const dataAttributes = {
    "data-list-id": listId,
    "data-index": index,
  }

  return (
    <div
      draggable
      onDragStart={() => startDrag(task.id || 0, "task")}
      onDragOver={(e) => {
        e.preventDefault()
        handleDragOver(task.id || 0)
      }}
      onDragEnd={() => drop()}
      className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 mb-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick && onClick(task)}
      {...dataAttributes}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{task.title}</h3>
        <div className="flex items-center space-x-1">
          {task.progressStatus === TaskItemStatus._3 && (
            <CheckCircle size={16} className="text-green-500 dark:text-green-400" />
          )}
          <Badge className={`${getPriorityColor(task.priority)}`}>{getPriorityLabel(task.priority)}</Badge>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.dueDate && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Clock size={14} className="mr-1" />
          <span className={isOverdue(task.dueDate) ? "text-red-500 dark:text-red-400" : ""}>
            Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            {isOverdue(task.dueDate) && " (Overdue)"}
          </span>
        </div>
      )}

      {totalItems > 0 && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <ListChecks size={14} className="mr-1" />
          <span>
            {completedItems}/{totalItems} completed
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <div className="flex -space-x-2">
          {task.assignees && task.assignees.length > 0 ? (
            task.assignees
              .slice(0, 3)
              .map((assignee, i) => (
                <Avatar
                  key={i}
                  name={assignee.firstName || assignee.lastName || assignee.username || "User"}
                  size="sm"
                  className="border-2 border-white dark:border-gray-800"
                />
              ))
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">No assignees</span>
          )}
          {task.assignees && task.assignees.length > 3 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          {task.labels && task.labels.length > 0 && (
            <div className="flex space-x-1">
              {task.labels.slice(0, 3).map((label, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: label.color || "#cbd5e1" }}
                  title={label.name || ""}
                />
              ))}
              {task.labels.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{task.labels.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
