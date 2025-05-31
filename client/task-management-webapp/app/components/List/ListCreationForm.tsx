"use client"

import React, { useState } from "react"
import { ListService, type ListCreationDto } from "api-client"
import { Plus, X } from "lucide-react"

interface ListCreationFormProps {
  boardId: number
  onListCreated: () => void
}

const ListCreationForm: React.FC<ListCreationFormProps> = ({ boardId, onListCreated }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title cannot be empty.")
      return
    }
    setError(null)
    setIsLoading(true)

    const newList: ListCreationDto = {
      title: title.trim(),
      boardId: boardId,
      position: 0, // API should handle position logic or it needs to be passed
    }

    try {
      await ListService.postApiLists({ body: newList })
      onListCreated()
      setTitle("")
      setIsCreating(false)
    } catch (err) {
      console.error("Failed to create list:", err)
      setError("Failed to create list. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isCreating) {
    return (
      <button
        onClick={() => {
          setIsCreating(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className="flex-shrink-0 w-72 h-12 flex items-center justify-start p-3 bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 rounded-lg text-slate-100 dark:text-slate-300 transition-colors"
      >
        <Plus size={18} className="mr-2" /> Add another list
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex-shrink-0 w-72 p-3 bg-slate-200 dark:bg-slate-700 rounded-lg shadow">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter list title..."
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="mt-3 flex items-center space-x-2">
        <button
          type="submit"
          className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add List"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false)
            setTitle("")
            setError(null)
          }}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Cancel adding list"
        >
          <X size={20} />
        </button>
      </div>
    </form>
  )
}

export default ListCreationForm
