"use client"

import type React from "react"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { BoardService, type BoardDto } from "api-client"
import { X } from "lucide-react"
import FormInputField from "../Common/FormInputField"
import FormTitle from "../Common/FormTitle"

type Props = {
  board: BoardDto
  closeModal: () => void
}

const BoardEditModal = ({ board, closeModal }: Props) => {
  const [formData, setFormData] = useState({
    title: board.title || "",
    description: board.description || "",
  })
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFormData({
      title: board.title || "",
      description: board.description || "",
    })
  }, [board])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (formData.title.trim().length < 3) {
      setError("Title must be at least 3 characters.")
      return
    }

    setLoading(true)
    try {
      const updatedBoardData: BoardDto = {
        ...board, // Spread existing board data
        title: formData.title.trim(),
        description: formData.description.trim(),
      }

      await BoardService.putApiBoardsByBoardId({
        path: { boardId: board.id },
        body: updatedBoardData,
      })
      closeModal()
    } catch (err) {
      console.error("Failed to update board:", err)
      setError("Failed to update board. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Close on escape key & focus trap (similar to BoardCreationModal)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closeModal()
      }
    }
    document.addEventListener("keydown", onKeyDown)

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ]
    const modal = modalRef.current
    if (!modal) return

    const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors.join(",")))
    if (focusableElements.length === 0) return

    const firstEl = focusableElements[0]
    const lastEl = focusableElements[focusableElements.length - 1]
    firstEl.focus()

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
    modal.addEventListener("keydown", trapFocus)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      modal.removeEventListener("keydown", trapFocus)
    }
  }, [closeModal])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-board-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <FormTitle content="Edit Board" id="edit-board-title" />
          <button
            onClick={closeModal}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <FormInputField
            name="title"
            placeHolder="Board title"
            property={formData.title}
            handleChange={handleChange}
            autoFocus
          >
            Title
          </FormInputField>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Board description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BoardEditModal
