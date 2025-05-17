"use client"

import { useState } from "react"
import { useBoard } from "../../hooks/useBoard"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import type { ListDto } from "../../../api-client/types.gen"

interface ListDeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  list: ListDto
}

const ListDeleteConfirmation = ({ isOpen, onClose, list }: ListDeleteConfirmationProps) => {
  const { deleteList } = useBoard()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!list.id) return

    setIsDeleting(true)
    try {
      await deleteList(list.id)
      onClose()
    } catch {
      // Error is handled by the useBoard hook
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete List"
      message={`Are you sure you want to delete "${list.title}"? This action cannot be undone and all tasks within this list will be permanently deleted.`}
      confirmLabel={isDeleting ? <LoadingSpinner size="sm" /> : "Delete"}
      variant="danger"
      onConfirm={handleDelete}
      isLoading={isDeleting}
    />
  )
}

export default ListDeleteConfirmation
