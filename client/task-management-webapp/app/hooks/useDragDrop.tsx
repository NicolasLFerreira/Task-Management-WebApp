"use client"

import { useState, useCallback } from "react"
import { createContext, useContext, type ReactNode } from "react"

interface DraggedItem {
  id: number
  type: "list" | "task"
  overItemId?: number
}

export function useDragDrop() {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)

  const startDrag = useCallback((id: number, type: "list" | "task") => {
    setDraggedItem({ id, type })
  }, [])

  const handleDragOver = useCallback(
    (id: number) => {
      if (!draggedItem || draggedItem.overItemId === id || draggedItem.id === id) return

      setDraggedItem((prev) => {
        if (!prev) return null
        return { ...prev, overItemId: id }
      })
    },
    [draggedItem],
  )

  // Rename handleDrop to drop for consistency with how it's used
  const drop = useCallback(() => {
    setDraggedItem(null)
  }, [])

  // Then update the return object
  return {
    draggedItem,
    startDrag,
    handleDragOver,
    drop, // Changed from handleDrop to drop
  }
}

// Create context
const DragDropContext = createContext<ReturnType<typeof useDragDrop> | undefined>(undefined)

// Provider component
interface DragDropProviderProps {
  children: ReactNode
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const dragDropValue = useDragDrop()

  return <DragDropContext.Provider value={dragDropValue}>{children}</DragDropContext.Provider>
}

// Hook to use the context
export function useDragDropContext() {
  const context = useContext(DragDropContext)
  if (context === undefined) {
    throw new Error("useDragDropContext must be used within a DragDropProvider")
  }
  return context
}
