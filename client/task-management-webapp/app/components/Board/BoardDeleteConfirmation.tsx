"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import { useBoard } from "../../hooks/useBoard"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import type { BoardDto } from "../../../api-client/types.gen"

interface BoardDeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  board: BoardDto
}

const BoardDeleteConfirmation = ({ isOpen, onClose, board }: BoardDeleteConfirmationProps) => {
  const { deleteBoard } = useBoard()
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!board.id) return

    setIsDeleting(true)
    try {
      await deleteBoard(board.id)
      onClose()
      // If we're currently viewing this board, navigate back to boards list
      if (window.location.pathname.includes(`/boards/${board.id}`)) {
        navigate("/boards")
      }
    } catch { // Removed unused error variable
      // Error is handled by the useBoard hook
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Board"
      message={`Are you sure you want to delete "${board.title}"? This action cannot be undone and all lists and tasks within this board will be permanently deleted.`}
      confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      cancelLabel="Cancel"
      variant="danger"
      isLoading={isDeleting}
      onConfirm={handleDelete}
    />
  )
}

export default BoardDeleteConfirmation
