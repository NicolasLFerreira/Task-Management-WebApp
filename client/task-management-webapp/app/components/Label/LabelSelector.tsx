"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LabelService, type LabelDto } from "api-client"
import { Check, Loader2, AlertCircle } from "lucide-react"

interface LabelSelectorProps {
  boardId: number
  selectedLabelIds: number[]
  onLabelToggle: (labelId: number, isSelected: boolean) => void
  disabled?: boolean
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  boardId,
  selectedLabelIds,
  onLabelToggle,
  disabled = false,
}) => {
  const [labels, setLabels] = useState<LabelDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const isLabelSelected = (labelId: number | undefined) => {
    return labelId !== undefined && selectedLabelIds.includes(labelId)
  }

  const handleLabelClick = (labelId: number | undefined) => {
    if (disabled || labelId === undefined) return
    onLabelToggle(labelId, !isLabelSelected(labelId))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md flex items-start">
        <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  if (labels.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400 text-sm p-2">No labels available for this board.</div>
  }

  return (
    <div className="space-y-1">
      {labels.map((label) => (
        <div
          key={label.id || 0}
          onClick={() => handleLabelClick(label.id)}
          className={`flex items-center p-2 rounded-md cursor-pointer ${
            disabled ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          } ${isLabelSelected(label.id) ? "bg-gray-100 dark:bg-gray-700" : ""}`}
        >
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: label.color || "#3B82F6" }} />
          <span className="text-gray-800 dark:text-gray-200 flex-1">{label.name}</span>
          {isLabelSelected(label.id) && <Check size={16} className="text-teal-600 dark:text-teal-400" />}
        </div>
      ))}
    </div>
  )
}

export default LabelSelector
