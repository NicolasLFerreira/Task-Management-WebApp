"use client"

import type React from "react"
import { createContext, useState, useCallback } from "react"
import { ApiService } from "../services/api-service"

interface DragSource {
  type: "list" | "task"
  id: number
}

interface DragDropContextType {
  isDragging: boolean
  dragSource: DragSource | null
  startDrag: (type: "list" | "task", id: number) => void
  endDrag: () => void
  moveTask: (taskId: number, targetListId: number, position: number) => Promise<void>
  reorderTasks: (listId: number, taskIds: number[]) => Promise<void>
  reorderLists: (boardId: number, listIds: number[]) => Promise<void>
}

export const DragDropContext = createContext<DragDropContextType>({
  isDragging: false,
  dragSource: null,
  startDrag: () => {},
  endDrag: () => {},
  moveTask: async () => {},
  reorderTasks: async () => {},
  reorderLists: async () => {},
})

interface DragDropProviderProps {
  children: React.ReactNode
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragSource, setDragSource] = useState<DragSource | null>(null)

  const startDrag = useCallback((type: "list" | "task", id: number): void => {
    setIsDragging(true)
    setDragSource({ type, id })
  }, [])

  const endDrag = useCallback((): void => {
    setIsDragging(false)
    setDragSource(null)
  }, [])

  const moveTask = useCallback(
    async (taskId: number, targetListId: number, position: number): Promise<void> => {
      try {
        await ApiService.moveTask(taskId, targetListId, position)
      } catch (error: unknown) {
        console.error("Failed to move task:", error)
        throw error
      } finally {
        endDrag()
      }
    },
    [endDrag],
  )

  const reorderTasks = useCallback(
    async (listId: number, taskIds: number[]): Promise<void> => {
      try {
        await ApiService.reorderTasks(listId, taskIds)
      } catch (error: unknown) {
        console.error("Failed to reorder tasks:", error)
        throw error
      } finally {
        endDrag()
      }
    },
    [endDrag],
  )

  const reorderLists = useCallback(
    async (boardId: number, listIds: number[]): Promise<void> => {
      try {
        await ApiService.reorderLists(boardId, listIds)
      } catch (error: unknown) {
        console.error("Failed to reorder lists:", error)
        throw error
      } finally {
        endDrag()
      }
    },
    [endDrag],
  )

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        dragSource,
        startDrag,
        endDrag,
        moveTask,
        reorderTasks,
        reorderLists,
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}
