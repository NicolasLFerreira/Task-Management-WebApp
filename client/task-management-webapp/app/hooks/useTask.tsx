"use client"

import { createContext, useState, type ReactNode, useContext } from "react"
import { ApiService } from "../services/api-service"
import { useToast } from "./useToast"
import type {
  TaskItemDto,
  CommentDto,
  ChecklistDtoReadable,
  ChecklistDtoWritable,
  ChecklistItemDto,
  AttachmentDto,
  TaskItemStatus,
  TaskItemPriority,
} from "../../api-client/types.gen"

interface TaskContextType {
  currentTask: TaskItemDto | null
  tasks: TaskItemDto[]
  comments: CommentDto[]
  checklists: ChecklistDtoReadable[]
  attachments: AttachmentDto[]
  isLoading: boolean
  error: string | null
  fetchTasks: (listId?: number) => Promise<void>
  fetchTaskById: (taskId: number) => Promise<void>
  createTask: (taskData: TaskItemDto) => Promise<TaskItemDto>
  updateTask: (taskId: number, taskData: TaskItemDto) => Promise<void>
  deleteTask: (taskId: number) => Promise<void>
  moveTask: (taskId: number, targetListId: number, position: number) => Promise<void>
  reorderTasks: (listId: number, taskIds: number[]) => Promise<void>
  updateTaskStatus: (taskId: number, status: TaskItemStatus) => Promise<void>
  updateTaskPriority: (taskId: number, priority: TaskItemPriority) => Promise<void>
  fetchComments: (taskId: number) => Promise<void>
  addComment: (commentData: CommentDto) => Promise<CommentDto>
  updateComment: (commentId: number, commentData: CommentDto) => Promise<void>
  deleteComment: (commentId: number) => Promise<void>
  fetchChecklists: (taskId: number) => Promise<void>
  addChecklist: (checklistData: ChecklistDtoWritable) => Promise<ChecklistDtoReadable>
  updateChecklist: (checklistId: number, checklistData: ChecklistDtoWritable) => Promise<void>
  deleteChecklist: (checklistId: number) => Promise<void>
  addChecklistItem: (itemData: ChecklistItemDto) => Promise<ChecklistItemDto>
  updateChecklistItem: (itemId: number, itemData: ChecklistItemDto) => Promise<void>
  deleteChecklistItem: (itemId: number) => Promise<void>
  fetchAttachments: (taskId: number) => Promise<void>
  uploadAttachment: (taskId: number, file: File) => Promise<AttachmentDto>
  deleteAttachment: (attachmentId: number) => Promise<void>
  getAttachmentUrl: (attachmentId: number) => string
  clearCurrentTask: () => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [currentTask, setCurrentTask] = useState<TaskItemDto | null>(null)
  const [tasks, setTasks] = useState<TaskItemDto[]>([])
  const [comments, setComments] = useState<CommentDto[]>([])
  const [checklists, setChecklists] = useState<ChecklistDtoReadable[]>([])
  const [attachments, setAttachments] = useState<AttachmentDto[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchTasks = async (listId?: number) => {
    setIsLoading(true)
    setError(null)
    try {
      let fetchedTasks: TaskItemDto[]

      if (listId) {
        fetchedTasks = await ApiService.getTasksByListId(listId)
      } else {
        fetchedTasks = await ApiService.getTasks()
      }

      // Sort tasks by position
      const sortedTasks = [...fetchedTasks].sort((a, b) => (a.position || 0) - (b.position || 0))
      setTasks(sortedTasks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTaskById = async (taskId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const task = await ApiService.getTaskById(taskId)
      setCurrentTask(task)

      // Also fetch related data
      await Promise.all([fetchComments(taskId), fetchChecklists(taskId), fetchAttachments(taskId)])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch task #${taskId}`
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (taskData: TaskItemDto): Promise<TaskItemDto> => {
    setIsLoading(true)
    setError(null)
    try {
      const newTask = await ApiService.createTask(taskData)
      setTasks((prevTasks) => [...prevTasks, newTask])
      toast.success("Task created successfully")
      return newTask
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (taskId: number, taskData: TaskItemDto) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.updateTask(taskId, taskData)

      // Update tasks list
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, ...taskData } : task)))

      // Update current task if it's the one being edited
      if (currentTask && currentTask.id === taskId) {
        setCurrentTask({ ...currentTask, ...taskData })
      }

      toast.success("Task updated successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (taskId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteTask(taskId)

      // Remove from tasks list
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

      // Clear current task if it's the one being deleted
      if (currentTask && currentTask.id === taskId) {
        setCurrentTask(null)
      }

      toast.success("Task deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const moveTask = async (taskId: number, targetListId: number, position: number) => {
    setError(null)
    try {
      // Optimistically update UI
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, listId: targetListId, position }
          }
          return task
        })
        return updatedTasks
      })

      // Call API to persist changes
      await ApiService.moveTask(taskId, targetListId, position)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to move task"
      setError(errorMessage)
      toast.error(errorMessage)

      // Revert optimistic update by refetching tasks
      if (currentTask?.listId) {
        await fetchTasks(currentTask.listId)
      }
      throw err
    }
  }

  const reorderTasks = async (listId: number, taskIds: number[]) => {
    setError(null)
    try {
      // Optimistically update the UI
      const reorderedTasks = [...tasks]
      taskIds.forEach((id, index) => {
        const taskIndex = reorderedTasks.findIndex((task) => task.id === id)
        if (taskIndex !== -1) {
          reorderedTasks[taskIndex] = { ...reorderedTasks[taskIndex], position: index }
        }
      })

      // Sort by new positions
      const sortedTasks = [...reorderedTasks].sort((a, b) => (a.position || 0) - (b.position || 0))
      setTasks(sortedTasks)

      // Call API to persist changes
      await ApiService.reorderTasks(listId, taskIds)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reorder tasks"
      setError(errorMessage)
      toast.error(errorMessage)

      // Revert optimistic update by refetching tasks
      await fetchTasks(listId)
      throw err
    }
  }

  const updateTaskStatus = async (taskId: number, status: TaskItemStatus) => {
    setError(null)
    try {
      // Optimistically update UI
      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, progressStatus: status }
          }
          return task
        })
      })

      if (currentTask && currentTask.id === taskId) {
        setCurrentTask({ ...currentTask, progressStatus: status })
      }

      // Call API to persist changes
      await ApiService.updateTaskStatusOrPriority(taskId, status)
      toast.success("Task status updated")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task status"
      setError(errorMessage)
      toast.error(errorMessage)

      // Revert optimistic update
      if (currentTask?.id === taskId) {
        await fetchTaskById(taskId)
      }
      throw err
    }
  }

  const updateTaskPriority = async (taskId: number, priority: TaskItemPriority) => {
    setError(null)
    try {
      // Optimistically update UI
      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, priority }
          }
          return task
        })
      })

      if (currentTask && currentTask.id === taskId) {
        setCurrentTask({ ...currentTask, priority })
      }

      // Call API to persist changes
      await ApiService.updateTaskStatusOrPriority(taskId, undefined, priority)
      toast.success("Task priority updated")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task priority"
      setError(errorMessage)
      toast.error(errorMessage)

      // Revert optimistic update
      if (currentTask?.id === taskId) {
        await fetchTaskById(taskId)
      }
      throw err
    }
  }

  const fetchComments = async (taskId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedComments = await ApiService.getCommentsByTaskId(taskId)
      // Sort comments by creation date (newest first)
      const sortedComments = [...fetchedComments].sort(
        (a, b) => new Date(b.creationDate || 0).getTime() - new Date(a.creationDate || 0).getTime(),
      )
      setComments(sortedComments)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch comments"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const addComment = async (commentData: CommentDto): Promise<CommentDto> => {
    setIsLoading(true)
    setError(null)
    try {
      const newComment = await ApiService.createComment(commentData)
      setComments((prevComments) => [newComment, ...prevComments])
      toast.success("Comment added")
      return newComment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add comment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateComment = async (commentId: number, commentData: CommentDto) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.updateComment(commentId, commentData)

      // Update comments list
      setComments((prevComments) =>
        prevComments.map((comment) => (comment.id === commentId ? { ...comment, ...commentData } : comment)),
      )

      toast.success("Comment updated")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update comment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteComment = async (commentId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteComment(commentId)

      // Remove from comments list
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))

      toast.success("Comment deleted")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete comment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChecklists = async (taskId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedChecklists = await ApiService.getChecklistsByTaskId(taskId)
      setChecklists(fetchedChecklists)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch checklists"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const addChecklist = async (checklistData: ChecklistDtoWritable): Promise<ChecklistDtoReadable> => {
    setIsLoading(true)
    setError(null)
    try {
      const newChecklist = await ApiService.createChecklist(checklistData)
      setChecklists((prevChecklists) => [...prevChecklists, newChecklist])
      toast.success("Checklist added")
      return newChecklist
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add checklist"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateChecklist = async (checklistId: number, checklistData: ChecklistDtoWritable) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.updateChecklist(checklistId, checklistData)

      // Update checklists list
      setChecklists((prevChecklists) =>
        prevChecklists.map((checklist) =>
          checklist.id === checklistId ? { ...checklist, ...checklistData } : checklist,
        ),
      )

      toast.success("Checklist updated")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update checklist"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChecklist = async (checklistId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteChecklist(checklistId)

      // Remove from checklists list
      setChecklists((prevChecklists) => prevChecklists.filter((checklist) => checklist.id !== checklistId))

      toast.success("Checklist deleted")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete checklist"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const addChecklistItem = async (itemData: ChecklistItemDto): Promise<ChecklistItemDto> => {
    setIsLoading(true)
    setError(null)
    try {
      const newItem = await ApiService.createChecklistItem(itemData)

      // Update the checklist with the new item
      setChecklists((prevChecklists) => {
        return prevChecklists.map((checklist) => {
          if (checklist.id === itemData.checklistId) {
            return {
              ...checklist,
              items: [...(checklist.items || []), newItem],
            }
          }
          return checklist
        })
      })

      toast.success("Item added to checklist")
      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add checklist item"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateChecklistItem = async (itemId: number, itemData: ChecklistItemDto) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.updateChecklistItem(itemId, itemData)

      // Update the checklist item
      setChecklists((prevChecklists) => {
        return prevChecklists.map((checklist) => {
          if (checklist.items?.some((item) => item.id === itemId)) {
            return {
              ...checklist,
              items: checklist.items.map((item) => (item.id === itemId ? { ...item, ...itemData } : item)),
            }
          }
          return checklist
        })
      })

      toast.success("Checklist item updated")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update checklist item"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChecklistItem = async (itemId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteChecklistItem(itemId)

      // Remove the item from its checklist
      setChecklists((prevChecklists) => {
        return prevChecklists.map((checklist) => {
          if (checklist.items?.some((item) => item.id === itemId)) {
            return {
              ...checklist,
              items: checklist.items.filter((item) => item.id !== itemId),
            }
          }
          return checklist
        })
      })

      toast.success("Checklist item deleted")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete checklist item"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttachments = async (taskId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedAttachments = await ApiService.getAttachmentsByTaskId(taskId)
      setAttachments(fetchedAttachments)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch attachments"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const uploadAttachment = async (taskId: number, file: File): Promise<AttachmentDto> => {
    setIsLoading(true)
    setError(null)
    try {
      const newAttachment = await ApiService.uploadAttachment(taskId, file)
      setAttachments((prevAttachments) => [...prevAttachments, newAttachment])
      toast.success("File uploaded successfully")
      return newAttachment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAttachment = async (attachmentId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteAttachment(attachmentId)

      // Remove from attachments list
      setAttachments((prevAttachments) => prevAttachments.filter((attachment) => attachment.id !== attachmentId))

      toast.success("Attachment deleted")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete attachment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getAttachmentUrl = (attachmentId: number): string => {
    return ApiService.getAttachmentDownloadUrl(attachmentId)
  }

  const clearCurrentTask = () => {
    setCurrentTask(null)
    setComments([])
    setChecklists([])
    setAttachments([])
  }

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        tasks,
        comments,
        checklists,
        attachments,
        isLoading,
        error,
        fetchTasks,
        fetchTaskById,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        reorderTasks,
        updateTaskStatus,
        updateTaskPriority,
        fetchComments,
        addComment,
        updateComment,
        deleteComment,
        fetchChecklists,
        addChecklist,
        updateChecklist,
        deleteChecklist,
        addChecklistItem,
        updateChecklistItem,
        deleteChecklistItem,
        fetchAttachments,
        uploadAttachment,
        deleteAttachment,
        getAttachmentUrl,
        clearCurrentTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

/**
 * Custom hook for accessing task context
 * @returns Task context values and methods
 */
export const useTask = () => {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error("useTask must be used within a TaskProvider")
  }

  return context
}
