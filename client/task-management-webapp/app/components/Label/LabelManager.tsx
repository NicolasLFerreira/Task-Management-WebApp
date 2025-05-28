"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LabelService, type LabelDto } from "api-client"
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Loader2 } from "lucide-react"

interface LabelManagerProps {
  boardId: number
  onLabelsChange?: () => void
}

const LabelManager: React.FC<LabelManagerProps> = ({ boardId, onLabelsChange }) => {
  const [labels, setLabels] = useState<LabelDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingLabelId, setEditingLabelId] = useState<number | null>(null)

  // Form states
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6") // Default blue color

  // Predefined colors
  const colorOptions = [
    { value: "#EF4444", name: "Red" },
    { value: "#F97316", name: "Orange" },
    { value: "#EAB308", name: "Yellow" },
    { value: "#22C55E", name: "Green" },
    { value: "#3B82F6", name: "Blue" },
    { value: "#8B5CF6", name: "Purple" },
    { value: "#EC4899", name: "Pink" },
    { value: "#6B7280", name: "Gray" },
  ]

  useEffect(() => {
    fetchLabels()
  }, [boardId])

  const fetchLabels = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await LabelService.getApiLabelsBoardByBoardId({
        path: { boardId },
      })

      setLabels(response.data || [])
    } catch (err) {
      console.error("Error fetching labels:", err)
      setError("Failed to load labels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      setError("Label name is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await LabelService.postApiLabels({
        body: {
          name: newLabelName.trim(),
          color: newLabelColor,
          boardId,
        },
      })

      setNewLabelName("")
      setNewLabelColor("#3B82F6")
      setIsCreating(false)
      fetchLabels()
      if (onLabelsChange) onLabelsChange()
    } catch (err) {
      console.error("Error creating label:", err)
      setError("Failed to create label")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateLabel = async (label: LabelDto) => {
    if (!label.name?.trim()) {
      setError("Label name is required")
      return
    }

    setIsLoading(true)
    setError(null)

    if (!label.id) {
      setError("Label ID is missing")
      return
    }

    try {
      await LabelService.putApiLabelsByLabelId({
        path: { labelId: label.id },
        body: label,
      })

      setEditingLabelId(null)
      fetchLabels()
      if (onLabelsChange) onLabelsChange()
    } catch (err) {
      console.error("Error updating label:", err)
      setError("Failed to update label")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLabel = async (labelId: number) => {
    if (!labelId) {
      setError("Label ID is missing")
      return
    }

    if (!confirm("Are you sure you want to delete this label?")) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await LabelService.deleteApiLabelsByLabelId({
        path: { labelId },
      })

      fetchLabels()
      if (onLabelsChange) onLabelsChange()
    } catch (err) {
      console.error("Error deleting label:", err)
      setError("Failed to delete label")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && labels.length === 0) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Labels</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
          >
            <Plus size={16} className="mr-1" />
            Add Label
          </button>
        )}
      </div>

      {/* Create new label form */}
      {isCreating && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label Name</label>
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter label name"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewLabelColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newLabelColor === color.value ? "border-gray-900 dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsCreating(false)
                setNewLabelName("")
                setNewLabelColor("#3B82F6")
                setError(null)
              }}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLabel}
              disabled={isLoading}
              className="px-3 py-1.5 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Label"}
            </button>
          </div>
        </div>
      )}

      {/* Labels list */}
      <div className="space-y-2">
        {labels.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No labels created yet.</p>
        ) : (
          labels.map((label) => (
            <div
              key={label.id || 0}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
            >
              {editingLabelId === label.id ? (
                <div className="flex-1 mr-2">
                  <input
                    type="text"
                    value={label.name || ""}
                    onChange={(e) => {
                      const updatedLabels = labels.map((l) => (l.id === label.id ? { ...l, name: e.target.value } : l))
                      setLabels(updatedLabels)
                    }}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: label.color || "#3B82F6" }} />
                  <span className="text-gray-800 dark:text-gray-200">{label.name}</span>
                </div>
              )}

              <div className="flex items-center space-x-1">
                {editingLabelId === label.id ? (
                  <>
                    <div className="flex space-x-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            const updatedLabels = labels.map((l) =>
                              l.id === label.id ? { ...l, color: color.value } : l,
                            )
                            setLabels(updatedLabels)
                          }}
                          className={`w-5 h-5 rounded-full border ${
                            label.color === color.value ? "border-gray-900 dark:border-white" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdateLabel(label)}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingLabelId(null)}
                      className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => label.id && setEditingLabelId(label.id)}
                      className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => label.id && handleDeleteLabel(label.id)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LabelManager
