"use client"

import type React from "react"
import { createContext, useState, useCallback, useContext } from "react"
import { ApiService } from "../services/api-service"
import { ToastContext } from "./ToastContext"
import type { TaskItemDto } from "../../api-client/types.gen"

interface TaskContextType {
  currentTask: TaskItemDto | null
  setCurrentTask: (task: TaskItemDto) => void
  refreshTask: () => Promise<void>
}

export const TaskContext = createContext<TaskContextType>({
  currentTask: null,
  setCurrentTask: () => {},
  refreshTask: async () => {},
})

interface TaskProviderProps {
  children: React.ReactNode
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [currentTask, setCurrentTask] = useState<TaskItemDto | null>(null)
  const { showError } = useContext(ToastContext)

  const refreshTask = useCallback(async (): Promise<void> => {
    if (!currentTask?.id) return

    try {
      const updatedTask = await ApiService.getTaskById(currentTask.id)
      setCurrentTask(updatedTask)
    } catch (error: unknown) {
      console.error("Failed to refresh task:", error)
      showError("Failed to refresh task")
    }
  }, [currentTask?.id, showError])

  const updateCurrentTask = (task: TaskItemDto) => {
    setCurrentTask(task)
  }

  return (
    <TaskContext.Provider
      value={{
        currentTask,
        setCurrentTask: updateCurrentTask,
        refreshTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
