"use client"

import type React from "react"
import { useState } from "react"
import { TaskItemService, LabelService, TaskItemPriority, TaskItemStatus, type ListDto } from "api-client"
import { X, Calendar, Tag, AlertCircle } from "lucide-react"
import LabelSelector from "../Label/LabelSelector"

interface TaskCreationModalProps {
  onClose: () => void
  listDto: ListDto
  onTaskCreated?: () => void
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ onClose, listDto, onTaskCreated }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<string>("")
  const [priority, setPriority] = useState<TaskItemPriority>(TaskItemPriority._0) // Default to Low
  const [status, setStatus] = useState<TaskItemStatus>(TaskItemStatus._0) // Default to Todo
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLabelSelector, setShowLabelSelector] = useState(false)

  // Get boardId from the list's board
  // For now, we'll need to pass boardId separately or fetch it
  // Since ListDto doesn't have board property, we'll use a default
  const boardId = 1 // Using boardId 1 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First create the task
      const taskResponse = await TaskItemService.postApiTasks({
        body: {
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: priority,
          progressStatus: status,
          listId: listDto.id,
        },
      })

      // If we have labels to add and the task was created successfully
      if (selectedLabelIds.length > 0 && taskResponse.data) {
        const taskId = taskResponse.data?.id
        if (!taskId) {
          throw new Error("Task created but no ID returned")
        }

        // Add each label to the task
        for (const labelId of selectedLabelIds) {
          await LabelService.postApiLabelsTaskByTaskIdAddByLabelId({
            path: { taskId, labelId },
          })
        }
      }

      if (onTaskCreated) {
        onTaskCreated()
      }
      onClose()
    } catch (err) {
      console.error("Error creating task:", err)
      setError("Failed to create task. Please try again.")
      // Log more detailed error information
      if (err instanceof Error) {
        console.error("Error details:", err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLabelToggle = (labelId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLabelIds((prev) => [...prev, labelId])
    } else {
      setSelectedLabelIds((prev) => prev.filter((id) => id !== labelId))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              placeholder="Task title"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
            >
              <Calendar size={16} className="mr-1" />
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
              >
                <Tag size={16} className="mr-1" />
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as TaskItemPriority)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={TaskItemPriority._0}>Low</option>
                <option value={TaskItemPriority._1}>Medium</option>
                <option value={TaskItemPriority._2}>High</option>
                <option value={TaskItemPriority._3}>Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status !== undefined ? status : TaskItemStatus._0}
                onChange={(e) => setStatus(Number(e.target.value) as TaskItemStatus)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={TaskItemStatus._0}>To Do</option>
                <option value={TaskItemStatus._1}>In Progress</option>
                <option value={TaskItemStatus._2}>In Review</option>
                <option value={TaskItemStatus._3}>Completed</option>
                <option value={TaskItemStatus._4}>Archived</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Labels</label>
              <button
                type="button"
                onClick={() => setShowLabelSelector(!showLabelSelector)}
                className="text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {showLabelSelector ? "Hide Labels" : "Select Labels"}
              </button>
            </div>

            {showLabelSelector && (
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md p-2 max-h-40 overflow-y-auto">
                <LabelSelector
                  boardId={boardId}
                  selectedLabelIds={selectedLabelIds}
                  onLabelToggle={handleLabelToggle}
                />
              </div>
            )}

            {selectedLabelIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedLabelIds.length} label{selectedLabelIds.length !== 1 ? "s" : ""} selected
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskCreationModal
