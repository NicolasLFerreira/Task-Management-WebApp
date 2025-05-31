"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  TaskItemService,
  AttachmentService,
  LabelService,
  TaskItemPriority,
  TaskItemStatus,
  type TaskItemDto,
  type AttachmentDto,
  type LabelDto,
} from "api-client"
import {
  X,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
  PauseCircle,
  XCircle,
  Trash2,
} from "lucide-react"
import FileAttachmentUploader from "./FileAttachmentUploader"
import AttachmentList from "./AttachmentList"
import CommentSection from "./CommentSection"
import LabelSelector from "../Label/LabelSelector"
import LabelManager from "../Label/LabelManager"

interface TaskDetailModalProps {
  taskId: number
  boardId: number 
  onClose: () => void
  onTaskUpdated?: () => void
  onTaskDeleted?: () => void
}

type ButtonReuseProps = {
  onClickCallback: () => void
  isActive: boolean
  name: string
}

const TabSwitchButton = ({ onClickCallback, isActive, name }: ButtonReuseProps) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium ${
        isActive
          ? "text-teal-600 border-b-2 border-teal-600 dark:text-teal-400 dark:border-teal-400"
          : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
      onClick={onClickCallback}
    >
      {name}
    </button>
  )
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  boardId, // Destructure boardId from props
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [task, setTask] = useState<TaskItemDto | null>(null)
  const [attachments, setAttachments] = useState<AttachmentDto[]>([])
  const [taskLabels, setTaskLabels] = useState<LabelDto[]>([])
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<TaskItemDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLabelLoading, setIsLabelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"details" | "attachments" | "comments" | "labels">("details")
  const [isManagingLabels, setIsManagingLabels] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLabelsOfTaskLoading, setIsLabelsOfTaskLoading] = useState(false)

  useEffect(() => {
    fetchTaskDetails()
    fetchAttachments()
    fetchTaskLabels()
  }, [taskId])

  const fetchTaskDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await TaskItemService.getApiTasksByTaskId({
        path: { taskId },
      })

      if (response.data) {
        setTask(response.data)
        setEditedTask(response.data)
      } else {
        setError("Task not found")
      }
    } catch (err) {
      console.error("Error fetching task details:", err)
      setError("Failed to load task details")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttachments = async () => {
    try {
      const response = await AttachmentService.getApiAttachmentTaskByTaskId({
        path: { taskId },
      })
      setAttachments(response.data || [])
    } catch (err) {
      console.error("Error fetching attachments:", err)
    }
  }

  const fetchTaskLabels = async () => {
    if (!taskId) return
    setIsLabelsOfTaskLoading(true)
    // setError(null); // Clear previous label-specific errors if any

    try {
      const response = await LabelService.getApiLabelsTaskByTaskId({
        path: { taskId },
      })
      const fetchedLabels = response.data || []
      setTaskLabels(fetchedLabels)
      setSelectedLabelIds(fetchedLabels.map((label) => label.id).filter((id) => id !== undefined) as number[])
    } catch (err) {
      console.error("Error fetching task labels:", err)
      // setError("Failed to load task labels"); // You might want a separate error state for task labels
      setTaskLabels([])
      setSelectedLabelIds([])
    } finally {
      setIsLabelsOfTaskLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!editedTask) return

    setIsSaving(true)
    setError(null)

    try {
      await TaskItemService.putApiTasksByTaskId({
        path: { taskId },
        body: editedTask,
      })

      setTask(editedTask)
      setIsEditing(false)
      if (onTaskUpdated) {
        onTaskUpdated()
      }
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof TaskItemDto, value: string | number | Date | null | undefined) => {
    if (!editedTask) return

    setEditedTask({
      ...editedTask,
      [field]: value,
    })
  }

  const handleLabelToggle = async (labelId: number, isSelected: boolean) => {
    setIsLabelLoading(true)

    try {
      if (isSelected) {
        await LabelService.postApiLabelsTaskByTaskIdAddByLabelId({
          path: { taskId, labelId },
        })
      } else {
        await LabelService.postApiLabelsTaskByTaskIdRemoveByLabelId({
          path: { taskId, labelId },
        })
      }

      // Update the selected labels
      if (isSelected) {
        setSelectedLabelIds((prev) => [...prev, labelId])
      } else {
        setSelectedLabelIds((prev) => prev.filter((id) => id !== labelId))
      }

      // Refresh task labels
      fetchTaskLabels()
      if (onTaskUpdated) {
        onTaskUpdated()
      }
    } catch (err) {
      console.error("Error toggling label:", err)
      setError(isSelected ? "Failed to add label" : "Failed to remove label")
    } finally {
      setIsLabelLoading(false)
    }
  }

  const formatDate = (dateString?: Date) => {
    if (!dateString) return "No date set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
    } else if (diffDays === 0) {
      return "Due today"
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} left`
    }
  }

  const getPriorityLabel = (priority?: TaskItemPriority) => {
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
        return "Not set"
    }
  }

  const getPriorityColor = (priority?: TaskItemPriority) => {
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
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status?: TaskItemStatus) => {
    switch (status) {
      case TaskItemStatus._0:
        return "To Do"
      case TaskItemStatus._1:
        return "In Progress"
      case TaskItemStatus._2:
        return "In Review"
      case TaskItemStatus._3:
        return "Completed"
      case TaskItemStatus._4:
        return "Archived"
      default:
        return "Not set"
    }
  }

  const getStatusIcon = (status?: TaskItemStatus) => {
    switch (status) {
      case TaskItemStatus._0:
        return <AlertTriangle size={16} className="text-yellow-500" />
      case TaskItemStatus._1:
        return <Clock size={16} className="text-blue-500" />
      case TaskItemStatus._2:
        return <PauseCircle size={16} className="text-purple-500" />
      case TaskItemStatus._3:
        return <CheckCircle size={16} className="text-green-500" />
      case TaskItemStatus._4:
        return <XCircle size={16} className="text-gray-500" />
      default:
        return null
    }
  }

  const handleFileUploaded = (attachment: AttachmentDto) => {
    setAttachments((prev) => [...prev, attachment])
  }

  const handleAttachmentDeleted = (attachmentId: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
  }

  const handleDeleteTask = async () => {
    if (!task?.id) return

    setIsDeleting(true)
    setError(null)

    try {
      await TaskItemService.deleteApiTasksByTaskId({
        path: { taskId: task.id },
      })

      setShowDeleteConfirm(false)
      if (onTaskDeleted) {
        onTaskDeleted()
      }
      onClose()
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task. Please try again.")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6">
          <div className="text-center">
            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{error || "Failed to load task details"}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // boardId is now from props
  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
              {isEditing ? "Edit Task" : task.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex border-b dark:border-gray-700">
            <TabSwitchButton
              isActive={activeTab === "details"}
              name="Details"
              onClickCallback={() => setActiveTab("details")}
            />
            <TabSwitchButton
              isActive={activeTab === "labels"}
              name="Labels"
              onClickCallback={() => setActiveTab("labels")}
            />
            <TabSwitchButton
              isActive={activeTab === "attachments"}
              name="Attachments"
              onClickCallback={() => setActiveTab("attachments")}
            />
            <TabSwitchButton
              isActive={activeTab === "comments"}
              name="Comments"
              onClickCallback={() => setActiveTab("comments")}
            />
          </div>

          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === "details" && (
              <>
                {isEditing && editedTask ? (
                  <div className="space-y-4">
                    <div>
                      <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                      <input
                        type="text"
                        value={editedTask.title || ""}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editedTask.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <Calendar size={16} className="mr-1" />
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleChange("dueDate", e.target.value ? new Date(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 items-center">
                          <Tag size={16} className="mr-1" />
                          Priority
                        </label>
                        <select
                          value={editedTask.priority !== undefined ? editedTask.priority : ""}
                          onChange={(e) =>
                            handleChange("priority", e.target.value ? Number(e.target.value) : undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select priority</option>
                          <option value={TaskItemPriority._0}>Low</option>
                          <option value={TaskItemPriority._1}>Medium</option>
                          <option value={TaskItemPriority._2}>High</option>
                          <option value={TaskItemPriority._3}>Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={editedTask.progressStatus !== undefined ? editedTask.progressStatus : ""}
                          onChange={(e) =>
                            handleChange("progressStatus", e.target.value ? Number(e.target.value) : undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select status</option>
                          <option value={TaskItemStatus._0}>To Do</option>
                          <option value={TaskItemStatus._1}>In Progress</option>
                          <option value={TaskItemStatus._2}>In Review</option>
                          <option value={TaskItemStatus._3}>Completed</option>
                          <option value={TaskItemStatus._4}>Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedTask(task)
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <span className="flex items-center">
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{task.title}</h3>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.priority !== undefined && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            <Tag size={12} className="mr-1" />
                            {getPriorityLabel(task.priority)}
                          </span>
                        )}

                        {task.progressStatus !== undefined && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {getStatusIcon(task.progressStatus)}
                            <span className="ml-1">{getStatusLabel(task.progressStatus)}</span>
                          </span>
                        )}

                        {task.dueDate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(task.dueDate)}
                            <span className="ml-1 font-semibold">({getDaysRemaining(task.dueDate)})</span>
                          </span>
                        )}
                      </div>

                      {taskLabels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {taskLabels.map((label) => (
                            <span
                              key={label.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{
                                backgroundColor: label.color || "#3B82F6",
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {task.description && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {task.description}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</h4>
                      <div className="text-gray-600 dark:text-gray-400 flex items-center">
                        <Clock size={16} className="mr-1" />
                        {formatDate(task.createdAt)}
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 flex items-center"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800"
                      >
                        Edit Task
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "labels" && (
              <div className="space-y-4">
                {isManagingLabels ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Labels</h3>
                      <button
                        onClick={() => setIsManagingLabels(false)}
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Back to Labels
                      </button>
                    </div>
                    <LabelManager
                      boardId={boardId} // Use boardId from props
                      onLabelsChange={() => {
                        fetchTaskLabels() // Refresh task labels after managing board labels
                        setIsManagingLabels(false)
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Labels</h3>
                      <button
                        onClick={() => setIsManagingLabels(true)}
                        className="text-sm text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        Manage Labels
                      </button>
                    </div>

                    {isLabelsOfTaskLoading || isLabelLoading ? (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                      </div>
                    ) : (
                      <LabelSelector
                        boardId={boardId} // Use boardId from props
                        selectedLabelIds={selectedLabelIds}
                        onLabelToggle={handleLabelToggle}
                        disabled={isLabelLoading}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "attachments" && (
              <div className="space-y-4">
                <FileAttachmentUploader taskId={taskId} onFileUploaded={handleFileUploaded} />

                <AttachmentList attachments={attachments} onAttachmentDeleted={handleAttachmentDeleted} />
              </div>
            )}

            {activeTab === "comments" && <CommentSection taskId={taskId} />}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700 focus:outline-none"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskDetailModal
