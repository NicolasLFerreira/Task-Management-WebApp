"use client"

import { useEffect, useState } from "react"
import { useBoard } from "../../hooks/useBoard"
import { useAuth } from "../../hooks/useAuth"
import BoardCard from "./BoardCard"
import BoardCreateModal from "./BoardCreateModal"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { EmptyState } from "../ui/EmptyState"
import { ErrorDisplay } from "../ui/ErrorDisplay"
import { Plus } from "lucide-react"

const BoardList = () => {
  const { boards, isLoading, error, fetchBoards } = useBoard()
  const { user } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBoards()
    }
  }, [user, fetchBoards])

  const handleCreateBoard = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Boards</h1>
        <Button onClick={handleCreateBoard} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Create Board</span>
        </Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          title="No boards found"
          description="Create your first board to get started with organizing your tasks."
          action={{
            label: "Create Board",
            onClick: handleCreateBoard,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      {isCreateModalOpen && <BoardCreateModal isOpen={isCreateModalOpen} onClose={handleCloseModal} />}
    </div>
  )
}

export default BoardList
