"use client"

import { useState, useEffect } from "react"
import { Plus, X, Search } from "lucide-react"
import { TaskItemService, UserService } from "api-client"
import type { UserDtoReadable } from "api-client"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { useToast } from "../../hooks/useToast"
import { useDebounce } from "../../hooks/useDebounce"

// Create a custom interface for TaskAssignee since it's not exported from the API client
interface TaskAssignee {
  taskId: number
  userId: number
  user?: UserDtoReadable
}

interface TaskAssigneesProps {
  taskId: number
  assignees: TaskAssignee[]
  onUpdate: (newAssignees: TaskAssignee[]) => void
}

const TaskAssignees = ({ taskId, assignees, onUpdate }: TaskAssigneesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserDtoReadable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<UserDtoReadable[]>([])
  const toast = useToast()

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Initialize selected users from current assignees
  useEffect(() => {
    if (assignees.length > 0) {
      const initialSelectedUsers = assignees
        .filter((assignee) => assignee.user)
        .map((assignee) => assignee.user as UserDtoReadable)

      setSelectedUsers(initialSelectedUsers)
    }
  }, [assignees])

  // Search for users when query changes
  useEffect(() => {
    if (!debouncedSearchQuery) return

    const searchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await UserService.getApiUsersSearch({
          query: { query: debouncedSearchQuery },
        })
        setUsers(response.data || [])
      } catch (error) {
        console.error("Error searching users:", error)
        toast.error("Failed to search users")
      } finally {
        setIsLoading(false)
      }
    }

    searchUsers()
  }, [debouncedSearchQuery, toast])

  const handleAddUser = (user: UserDtoReadable) => {
    // Check if user is already selected
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      // Get the current task details first
      const taskResponse = await TaskItemService.getApiTasksByTaskId({
        path: { taskId },
      })

      // Update the task with the selected assignees
      await TaskItemService.putApiTasksByTaskId({
        path: { taskId },
        body: {
          ...taskResponse.data,
          assignees: selectedUsers,
        },
      })

      // Create new assignees array for UI update
      const newAssignees: TaskAssignee[] = selectedUsers.map((user) => ({
        taskId,
        userId: user.id!,
        user,
      }))

      onUpdate(newAssignees)
      toast.success("Assignees updated successfully")
      setIsModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update assignees"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignees</h3>
        <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={14} className="mr-1" />
          Manage
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {assignees.length > 0 ? (
          assignees.map((assignee, index) => (
            <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
              <Avatar name={assignee.user?.fullName || "User"} size="xs" className="mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {assignee.user?.fullName || "Unknown User"}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">No assignees</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manage Assignees">
        <div className="p-4">
          {/* Search input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selected users */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected ({selectedUsers.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.length > 0 ? (
                selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                    <Avatar name={user.fullName || "User"} size="xs" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{user.fullName}</span>
                    <button
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => handleRemoveUser(user.id!)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">No users selected</div>
              )}
            </div>
          </div>

          {/* Search results */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Results</h4>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                      onClick={() => handleAddUser(user)}
                    >
                      <div className="flex items-center">
                        <Avatar name={user.fullName || "User"} size="sm" className="mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" disabled={selectedUsers.some((u) => u.id === user.id)}>
                        {selectedUsers.some((u) => u.id === user.id) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic p-2">
                    {debouncedSearchQuery ? "No users found" : "Type to search users"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
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
    </div>
  )
}

export default TaskAssignees
