"use client"

import { useState } from "react"
import { Calendar, Edit2 } from "lucide-react"
import { TaskItemService } from "api-client"
import { formatDate } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { useToast } from "../../hooks/useToast"

interface TaskDueDateProps {
  dueDate?: string | Date
  taskId: number
  onUpdate: (newDate: string) => void
}

const TaskDueDate = ({ dueDate, taskId, onUpdate }: TaskDueDateProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newDueDate, setNewDueDate] = useState<string>(dueDate ? new Date(dueDate).toISOString().split("T")[0] : "")
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const isOverdue = (date?: string | Date) => {
    if (!date) return false
    const dueDateTime = new Date(date).getTime()
    const now = new Date().getTime()
    return dueDateTime < now
  }

  const handleSave = async () => {
    if (!newDueDate) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      // Use the general task update endpoint instead of the specialized editing endpoint
      await TaskItemService.putApiTasksByTaskId({
        path: { taskId },
        body: {
          id: taskId,
          dueDate: new Date(newDueDate),
        },
      })

      // Update the UI
      onUpdate(new Date(newDueDate).toISOString())
      toast.success("Due date updated successfully")
      setIsEditing(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update due date"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center">
        <Calendar size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Due date:</span>
        <span
          className={`text-sm font-medium ${
            isOverdue(dueDate) ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
          }`}
        >
          {dueDate ? formatDate(dueDate) : "Not set"}
          {isOverdue(dueDate) && " (Overdue)"}
        </span>
        <Button variant="ghost" size="sm" className="ml-2 p-1 h-auto" onClick={() => setIsEditing(true)}>
          <Edit2 size={14} />
        </Button>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Change Due Date">
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TaskDueDate
