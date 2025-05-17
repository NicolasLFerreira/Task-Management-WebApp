"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { TaskItemService, ListService } from "api-client"
import type { TaskItemDto, ListDto } from "api-client"
import { Calendar, AlertCircle } from "lucide-react"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { useToast } from "../../hooks/useToast"

interface TaskFormProps {
  task?: TaskItemDto
  listId?: number
  boardId?: number
  onSuccess: (task: TaskItemDto) => void
  onCancel: () => void
}

const TaskForm = ({ task, listId, boardId, onSuccess, onCancel }: TaskFormProps) => {
  const toast = useToast()
  const isEditing = !!task

  const [formData, setFormData] = useState<TaskItemDto>({
    title: "",
    description: "",
    dueDate: undefined,
    priority: undefined,
    progressStatus: undefined,
    listId: listId,
    ...task,
  })

  const [lists, setLists] = useState<ListDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // If we have a boardId, fetch the lists for that board
    if (boardId) {
      const fetchLists = async () => {
        setIsLoading(true)
        try {
          const response = await ListService.getApiListsBoardByBoardId({
            path: { boardId },
          })
          setLists(response.data || [])
        } catch (error) {
          console.error("Failed to load lists:", error)
          toast.error("Failed to load lists")
        } finally {
          setIsLoading(false)
        }
      }

      fetchLists()
    }
  }, [boardId, toast])

  const handleChange = (field: keyof TaskItemDto, value: string | number | Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.listId) {
      newErrors.listId = "List is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      let response

      if (isEditing && task?.id) {
        // Update existing task
        await TaskItemService.putApiTasksByTaskId({
          path: { taskId: task.id },
          body: formData,
        })

        // Fetch the updated task to get the latest data
        response = await TaskItemService.getApiTasksByTaskId({
          path: { taskId: task.id },
        })
      } else {
        // Create new task
        response = await TaskItemService.postApiTasks({
          body: formData,
        })
      }

      if (response?.data) {
        onSuccess(response.data)
        toast.success(isEditing ? "Task updated successfully" : "Task created successfully")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save task"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.title
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
          } dark:bg-gray-700 dark:text-white`}
          placeholder="Task title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
          placeholder="Task description"
        />
      </div>

      {/* List selection */}
      {lists.length > 0 && (
        <div>
          <label htmlFor="listId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            List *
          </label>
          <select
            id="listId"
            value={formData.listId || ""}
            onChange={(e) => handleChange("listId", Number(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.listId
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"
            } dark:bg-gray-700 dark:text-white`}
          >
            <option value="">Select a list</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          {errors.listId && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.listId}
            </p>
          )}
        </div>
      )}

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-gray-400" />
          </div>
          <input
            id="dueDate"
            type="date"
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().split("T")[0] : ""}
            onChange={(e) => handleChange("dueDate", e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={formData.priority || ""}
          onChange={(e) => handleChange("priority", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="progressStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          id="progressStatus"
          value={formData.progressStatus || ""}
          onChange={(e) => handleChange("progressStatus", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select status</option>
          <option value="Not started">Not started</option>
          <option value="In progress">In progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Task"
          ) : (
            "Create Task"
          )}
        </Button>
      </div>
    </form>
  )
}

export default TaskForm
