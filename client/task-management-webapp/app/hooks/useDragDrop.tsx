"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useBoard } from "./useBoard"
import { useTask } from "./useTask"
import { useToast } from "./useToast"

interface DragDropContextType {
  isDragging: boolean
  dragType: "task" | "list" | null
  draggedItemId: number | null
  sourceListId: number | null
  startDragging: (type: "task" | "list", itemId: number, sourceListId?: number) => void
  stopDragging: () => void
  moveTaskBetweenLists: (taskId: number, sourceListId: number, targetListId: number, position: number) => Promise<void>
  reorderTasksInList: (listId: number, taskIds: number[]) => Promise<void>
  reorderLists: (boardId: number, listIds: number[]) => Promise<void>
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined)

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<"task" | "list" | null>(null)
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null)
  const [sourceListId, setSourceListId] = useState<number | null>(null)

  const { reorderLists } = useBoard()
  const { moveTask, reorderTasks } = useTask()
  const toast = useToast()

  const startDragging = (type: "task" | "list", itemId: number, sourceList?: number) => {
    setIsDragging(true)
    setDragType(type)
    setDraggedItemId(itemId)
    if (type === "task" && sourceList !== undefined) {
      setSourceListId(sourceList)
    }
  }

  const stopDragging = () => {
    setIsDragging(false)
    setDragType(null)
    setDraggedItemId(null)
    setSourceListId(null)
  }

  const moveTaskBetweenLists = async (taskId: number, sourceListId: number, targetListId: number, position: number) => {
    try {
      await moveTask(taskId, targetListId, position)
    } catch (error) {
      toast.error("Failed to move task. Please try again.")
      console.error("Error moving task:", error)
    } finally {
      stopDragging()
    }
  }

  const reorderTasksInList = async (listId: number, taskIds: number[]) => {
    try {
      await reorderTasks(listId, taskIds)
    } catch (error) {
      toast.error("Failed to reorder tasks. Please try again.")
      console.error("Error reordering tasks:", error)
    } finally {
      stopDragging()
    }
  }

  const reorderListsInBoard = async (boardId: number, listIds: number[]) => {
    try {
      await reorderLists(boardId, listIds)
    } catch (error) {
      toast.error("Failed to reorder lists. Please try again.")
      console.error("Error reordering lists:", error)
    } finally {
      stopDragging()
    }
  }

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        dragType,
        draggedItemId,
        sourceListId,
        startDragging,
        stopDragging,
        moveTaskBetweenLists,
        reorderTasksInList,
        reorderLists: reorderListsInBoard,
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}

/**
 * Custom hook for accessing drag and drop context
 * @returns Drag and drop context values and methods
 */
export const useDragDrop = () => {
  const context = useContext(DragDropContext)

  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }

  return context
}
