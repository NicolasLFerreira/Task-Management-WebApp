"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import {
  TaskItemService,
  CommentService,
  ChecklistService,
  AttachmentService,
  LabelService,
  ListService,
} from "api-client"
import type { TaskItemDto, CommentDto, ChecklistDtoReadable, AttachmentDto, LabelDto } from "api-client"
import { ArrowLeft, Edit, Trash, AlertTriangle } from "lucide-react"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ErrorDisplay } from "../ui/ErrorDisplay"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { useToast } from "../../hooks/useToast"
import TaskForm from "./TaskForm"
import TaskDueDate from "./TaskDueDate"
import TaskAssignees from "./TaskAssignees"
import TaskComments from "./TaskComments"
import TaskChecklists from "./TaskChecklists"
import TaskAttachments from "./TaskAttachments"
import TaskLabels from "./TaskLabels"

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [task, setTask] = useState<TaskItemDto | null>(null)
  const [comments, setComments] = useState<CommentDto[]>([])
  const [checklists, setChecklists] = useState<ChecklistDtoReadable[]>([])
  const [attachments, setAttachments] = useState<AttachmentDto[]>([])
  const [labels, setLabels] = useState<LabelDto[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (!taskId) return

    const fetchTaskData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch task details
        const taskResponse = await TaskItemService.getApiTasksByTaskId({
          path: { taskId: Number(taskId) },
        })

        if (taskResponse.data) {
          setTask(taskResponse.data)

          // Fetch related data in parallel
          const [commentsResponse, checklistsResponse, attachmentsResponse] = await Promise.all([
            CommentService.getApiCommentsTaskByTaskId({ path: { taskId: Number(taskId) } }),
            ChecklistService.getApiChecklistsTaskByTaskId({ path: { taskId: Number(taskId) } }),
            AttachmentService.getApiAttachmentTaskByTaskId({ path: { taskId: Number(taskId) } }),
          ])

          setComments(commentsResponse.data || [])
          setChecklists(checklistsResponse.data || [])
          setAttachments(attachmentsResponse.data || [])

          // If task has a boardId, fetch labels for that board
          if (taskResponse.data.listId) {
            // First get the list to find its boardId
            const listResponse = await ListService.getApiListsByListId({
              path: { listId: taskResponse.data.listId },
            })

            if (listResponse.data?.boardId) {
              const labelsResponse = await LabelService.getApiLabelsBoardByBoardId({
                path: { boardId: listResponse.data.boardId },
              })
              setLabels(labelsResponse.data || [])
            }
          } else {
            // If no listId, set empty labels array
            setLabels([])
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load task details"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskData()
  }, [taskId, toast])

  const handleBack = () => {
    navigate(-1)
  }

  const handleDelete = async () => {
    if (!task?.id) return

    try {
      await TaskItemService.deleteApiTasksByTaskId({
        path: { taskId: task.id },
      })

      toast.success("Task deleted successfully")
      navigate(-1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task"
      toast.error(errorMessage)
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const handleTaskUpdate = (updatedTask: TaskItemDto) => {
    setTask(updatedTask)
    setIsEditModalOpen(false)
    toast.success("Task updated successfully")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorDisplay title="Error loading task" message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-4">
        <ErrorDisplay title="Task not found" message="The requested task could not be found" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack} className="mr-2">
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>

        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Task content */}
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h1>

          <div className="flex flex-wrap gap-4 mb-4">
            {/* Due date */}
            <TaskDueDate
              dueDate={task.dueDate || undefined}
              taskId={task.id!}
              onUpdate={(newDate) => setTask({ ...task, dueDate: new Date(newDate) })}
            />

            {/* Priority */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Priority:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 2
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : task.priority === 1
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {task.priority || "None"}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.progressStatus === 2
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : task.progressStatus === 1
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {task.progressStatus || "Not started"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {task.description || "No description provided"}
            </p>
          </div>

          {/* Assignees */}
          <TaskAssignees
            taskId={task.id!}
            assignees={(task.assignees || []).map((user) => ({
              taskId: task.id!,
              userId: user.id!,
              user,
            }))}
            onUpdate={(newAssignees) =>
              setTask({
                ...task,
                assignees: newAssignees.map((assignee) => assignee.user!),
              })
            }
          />

          {/* Labels */}
          <TaskLabels
            taskId={task.id!}
            taskLabels={task.labels || []}
            availableLabels={labels}
            boardId={task.listId ? task.listId : 0}
            onUpdate={(newLabels) => setTask({ ...task, labels: newLabels })}
          />
        </div>

        {/* Tabs for comments, checklists, attachments */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col space-y-6">
            {/* Checklists */}
            <TaskChecklists taskId={task.id!} checklists={checklists} onUpdate={setChecklists} />

            {/* Attachments */}
            <TaskAttachments taskId={task.id!} attachments={attachments} onUpdate={setAttachments} />

            {/* Comments */}
            <TaskComments taskId={task.id!} comments={comments} onUpdate={setComments} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task" size="lg">
        <TaskForm task={task} onSuccess={handleTaskUpdate} onCancel={() => setIsEditModalOpen(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Task">
        <div className="p-4">
          <div className="flex items-center text-amber-600 dark:text-amber-500 mb-4">
            <AlertTriangle size={24} className="mr-2" />
            <p className="font-medium">Are you sure you want to delete this task?</p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This action cannot be undone. This will permanently delete the task and all associated data.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TaskDetail
