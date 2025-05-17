"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useBoard } from "../../hooks/useBoard"
import { useTask } from "../../hooks/useTask"
import { useDragDrop } from "../../hooks/useDragDrop"
import { Button } from "../ui/Button"
import { IconButton } from "../ui/IconButton"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ErrorDisplay } from "../ui/ErrorDisplay"
import { EmptyState } from "../ui/EmptyState"
import BoardEditModal from "./BoardEditModal"
import BoardDeleteConfirmation from "./BoardDeleteConfirmation"
import BoardMembers from "./BoardMembers"
import ListComponent from "../List/List"
import ListCreateForm from "../List/ListCreateForm"
import ListReorder from "../List/ListReorder"
import { Plus, Edit, Trash, Users } from "lucide-react"
import type { ListDto } from "../../../api-client/types.gen"

interface BoardViewProps {
  boardId?: string
}

const BoardView: React.FC<BoardViewProps> = ({ boardId }) => {
  const { currentBoard, lists, isLoading, error, fetchBoardById, reorderLists } = useBoard()
  const { fetchTasksByBoardId } = useTask()
  const { startDrag, handleDragOver, drop, draggedItem } = useDragDrop()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [showAddList, setShowAddList] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    if (boardId) {
      const id = Number.parseInt(boardId)
      fetchBoardById(id)
      fetchTasksByBoardId(id)
    }
  }, [boardId, fetchBoardById, fetchTasksByBoardId])

  const handleListDragStart = (id: number) => {
    startDrag(id, "list")
  }

  const handleListDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    handleDragOver(id)
  }

  const handleListDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedItem && draggedItem.type === "list" && currentBoard) {
      setIsReordering(true)
      try {
        const newOrder = lists.map((list) => list.id!).filter((id) => id !== draggedItem.id)
        const targetIndex = lists.findIndex((list) => list.id === draggedItem.overItemId)

        if (targetIndex !== -1) {
          newOrder.splice(targetIndex, 0, draggedItem.id)
        } else {
          newOrder.push(draggedItem.id)
        }

        await reorderLists(currentBoard.id!, newOrder)
      } catch (error) {
        console.error("Error reordering lists:", error)
      } finally {
        setIsReordering(false)
        drop()
      }
    } else {
      drop()
    }
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

  if (!currentBoard) {
    return (
      <EmptyState
        title="Board not found"
        description="The board you're looking for doesn't exist or you don't have access to it."
        action={{
          label: "Go Back",
          onClick: () => window.history.back(),
        }}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{currentBoard.title}</h1>
          {currentBoard.description && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">{currentBoard.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <IconButton
            icon={<Users size={18} />}
            onClick={() => setIsMembersModalOpen(true)}
            variant="secondary"
            ariaLabel="Manage board members"
          />
          <IconButton
            icon={<Edit size={18} />}
            onClick={() => setIsEditModalOpen(true)}
            variant="secondary"
            ariaLabel="Edit board"
          />
          <IconButton
            icon={<Trash size={18} />}
            onClick={() => setIsDeleteModalOpen(true)}
            variant="danger"
            ariaLabel="Delete board"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        {isReordering && (
          <div className="px-4 py-2">
            <ListReorder boardId={currentBoard.id!} lists={lists} onReorderComplete={() => setIsReordering(false)} />
          </div>
        )}
        <div className="flex h-full items-start space-x-4 px-4">
          {lists.length === 0 && !showAddList ? (
            <EmptyState
              title="No lists found"
              description="Create your first list to start organizing your tasks."
              action={{
                label: "Create List",
                onClick: () => setShowAddList(true),
              }}
              className="w-full"
            />
          ) : (
            <>
              {lists.map((list: ListDto) => (
                <div
                  key={list.id}
                  draggable
                  onDragStart={() => handleListDragStart(list.id!)}
                  onDragOver={(e) => handleListDragOver(e, list.id!)}
                  onDrop={handleListDrop}
                  className={`w-80 flex-shrink-0 ${
                    draggedItem?.type === "list" && draggedItem.id === list.id ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <ListComponent list={list} />
                </div>
              ))}

              {showAddList ? (
                <div className="w-80 flex-shrink-0">
                  <ListCreateForm
                    boardId={currentBoard.id!}
                    onCancel={() => setShowAddList(false)}
                    onSuccess={() => setShowAddList(false)}
                  />
                </div>
              ) : (
                <Button
                  onClick={() => setShowAddList(true)}
                  variant="secondary"
                  className="w-80 flex-shrink-0 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <Plus size={20} className="mr-2" />
                  Add List
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <BoardEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} board={currentBoard} />
      )}

      {isDeleteModalOpen && (
        <BoardDeleteConfirmation
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          board={currentBoard}
        />
      )}

      {isMembersModalOpen && (
        <BoardMembers isOpen={isMembersModalOpen} onClose={() => setIsMembersModalOpen(false)} board={currentBoard} />
      )}
    </div>
  )
}

export default BoardView
