"use client"

import { useState, useEffect } from "react"
import { useBoard } from "../../hooks/useBoard"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { useToast } from "../../hooks/useToast"
import type { ListDto } from "../../../api-client/types.gen"

interface ListReorderProps {
  boardId: number
  lists: ListDto[]
  onReorderComplete?: () => void
}

const ListReorder = ({ boardId, lists, onReorderComplete }: ListReorderProps) => {
  const { reorderLists } = useBoard()
  const toast = useToast()
  const [isReordering, setIsReordering] = useState(false)

  const handleReorder = async (listIds: number[]) => {
    if (!listIds.length) return

    setIsReordering(true)
    try {
      await reorderLists(boardId, listIds)
      toast.success("Lists reordered successfully")
      if (onReorderComplete) {
        onReorderComplete()
      }
    } catch (error) {
      toast.error("Failed to reorder lists")
      console.error("Error reordering lists:", error)
    } finally {
      setIsReordering(false)
    }
  }

  useEffect(() => {
    // Example of using lists and handleReorder
    if (lists.length > 0) {
      handleReorder(lists.map((list) => list.id!).filter(Boolean) as number[])
    }
  }, [])

  return isReordering ? <LoadingSpinner size="sm" /> : null
}

export default ListReorder
