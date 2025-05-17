"use client"

import type React from "react"

import { useState } from "react"
import { useBoard } from "../../hooks/useBoard"
import { useForm } from "../../hooks/useForm"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ErrorDisplay } from "../ui/ErrorDisplay"
import type { BoardDto } from "../../../api-client/types.gen"

interface BoardEditModalProps {
  isOpen: boolean
  onClose: () => void
  board: BoardDto
}

interface BoardFormValues extends Record<string, unknown> {
  title: string
  description: string
}

const BoardEditModal = ({ isOpen, onClose, board }: BoardEditModalProps) => {
  const { updateBoard } = useBoard()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { values, handleChange, errors, validateForm } = useForm<BoardFormValues>({
    initialValues: {
      title: board.title || "",
      description: board.description || "",
    },
    validate: (values: BoardFormValues) => {
      const errors: Partial<Record<keyof BoardFormValues, string>> = {}

      if (!values.title) {
        errors.title = "Title is required"
      } else if (values.title.length < 3) {
        errors.title = "Title must be at least 3 characters"
      } else if (values.title.length > 50) {
        errors.title = "Title must be less than 50 characters"
      }

      if (values.description && typeof values.description === "string" && values.description.length > 200) {
        errors.description = "Description must be less than 200 characters"
      }

      return errors
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const boardData: BoardDto = {
        ...board,
        title: values.title,
        description: values.description,
      }

      await updateBoard(board.id!, boardData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Board">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter board title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description as string}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter board description (optional)"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {error && <ErrorDisplay message={error} />}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner size="sm" /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default BoardEditModal
