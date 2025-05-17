"use client"

import type React from "react"

import { useState } from "react"
import { useBoard } from "../../hooks/useBoard"
import { useForm } from "../../hooks/useForm"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ErrorDisplay } from "../ui/ErrorDisplay"
import type { ListDto } from "../../../api-client/types.gen"

interface ListCreateFormProps {
  boardId: number
  onCancel: () => void
  onSuccess: () => void
}

interface ListFormValues {
  title: string
  [key: string]: unknown // Add index signature to satisfy Record<string, unknown>
}

const ListCreateForm = ({ boardId, onCancel, onSuccess }: ListCreateFormProps) => {
  const { createList, lists } = useBoard()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { values, handleChange, errors, validateForm } = useForm<ListFormValues>({
    initialValues: {
      title: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {}
      if (!values.title) {
        errors.title = "Title is required"
      } else if (values.title.length > 50) {
        errors.title = "Title must be less than 50 characters"
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
      const listData: ListDto = {
        title: values.title,
        boardId: boardId,
        position: lists.length, // Add to the end of the list
      }

      await createList(listData)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create list")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="mb-3">
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter list title"
            autoFocus
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {error && <ErrorDisplay message={error} className="mb-3" />}

        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner size="sm" /> : "Add List"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ListCreateForm
