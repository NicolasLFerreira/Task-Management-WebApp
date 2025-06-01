"use client"

import type React from "react"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { ListService, type ListDto } from "api-client"
import { X } from "lucide-react"
import FormInputField from "../Common/FormInputField" // Assuming this can be reused
import FormTitle from "../Common/FormTitle"

type Props = {
  list: ListDto
  boardId: number // Needed if API requires it for context, though ListDto has id
  closeModal: () => void
}

const ListEditModal: React.FC<Props> = ({ list, closeModal }) => {
  const [title, setTitle] = useState(list.title || "")
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitle(list.title || "")
  }, [list])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (title.trim().length === 0) {
      setError("Title cannot be empty.")
      return
    }
    setLoading(true)
    try {
      const updatedList: ListDto = {
        ...list,
        title: title.trim(),
      }
      await ListService.putApiListsByListId({
        path: { listId: list.id },
        body: updatedList,
      })
      closeModal()
    } catch (err) {
      console.error("Failed to update list:", err)
      setError("Failed to update list. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Focus trap and Escape key handling (similar to BoardEditModal)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closeModal()
      }
    }
    document.addEventListener("keydown", onKeyDown)

    const modal = modalRef.current
    if (!modal) return
    const focusableElements = Array.from(
      modal.querySelectorAll<HTMLElement>("input, button, [tabindex]:not([tabindex='-1'])"),
    )
    if (focusableElements.length > 0) {
      const firstEl = focusableElements[0]
      firstEl.focus()
      // Basic focus trap, can be enhanced
      modal.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstEl) {
            focusableElements[focusableElements.length - 1].focus()
            e.preventDefault()
          } else if (!e.shiftKey && document.activeElement === focusableElements[focusableElements.length - 1]) {
            firstEl.focus()
            e.preventDefault()
          }
        }
      })
    }
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [closeModal])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-list-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <FormTitle content="Edit List Title" id="edit-list-title" />
          <button
            onClick={closeModal}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <FormInputField name="title" placeHolder="List title" property={title} handleChange={handleChange} autoFocus>
            Title
          </FormInputField>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ListEditModal
