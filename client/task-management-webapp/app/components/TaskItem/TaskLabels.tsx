"use client"

import { useState, useEffect } from "react"
import { Tag, Plus, X, Edit2, Trash2 } from "lucide-react"
import { LabelService } from "api-client"
import type { LabelDto } from "api-client"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { useToast } from "../../hooks/useToast"

interface TaskLabelsProps {
  taskId: number
  taskLabels: LabelDto[]
  availableLabels: LabelDto[]
  boardId: number
  onUpdate: (newLabels: LabelDto[]) => void
}

const TaskLabels = ({ taskId, taskLabels, availableLabels, boardId, onUpdate }: TaskLabelsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState<LabelDto[]>([])
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState("#10B981") // Default teal color
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [labelToDelete, setLabelToDelete] = useState<number | null>(null)
  const [labelToEdit, setLabelToEdit] = useState<LabelDto | null>(null)
  const [editLabelName, setEditLabelName] = useState("")
  const [editLabelColor, setEditLabelColor] = useState("")
  const toast = useToast()

  // Initialize selected labels from task labels
  useEffect(() => {
    setSelectedLabels([...taskLabels])
  }, [taskLabels])

  const handleToggleLabel = (label: LabelDto) => {
    const isSelected = selectedLabels.some((l) => l.id === label.id)

    if (isSelected) {
      setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id))
    } else {
      setSelectedLabels([...selectedLabels, label])
    }
  }

  const handleSaveLabels = async () => {
    setIsSubmitting(true)

    try {
      // First remove all labels
      for (const label of taskLabels) {
        if (label.id) {
          await LabelService.postApiLabelsTaskByTaskIdRemoveByLabelId({
            path: { taskId, labelId: label.id },
          })
        }
      }

      // Then add selected labels
      for (const label of selectedLabels) {
        if (label.id) {
          await LabelService.postApiLabelsTaskByTaskIdAddByLabelId({
            path: { taskId, labelId: label.id },
          })
        }
      }

      onUpdate(selectedLabels)
      toast.success("Labels updated successfully")
      setIsModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update labels"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return

    setIsSubmitting(true)

    try {
      const labelData: LabelDto = {
        name: newLabelName,
        color: newLabelColor,
        boardId,
      }

      const response = await LabelService.postApiLabels({
        body: labelData,
      })

      if (response.data) {
        // Add to available labels and select it
        availableLabels.push(response.data)
        setSelectedLabels([...selectedLabels, response.data])
        setNewLabelName("")
        setIsCreatingLabel(false)
        toast.success("Label created successfully")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create label"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateLabel = async () => {
    if (!labelToEdit || !editLabelName.trim()) return

    setIsSubmitting(true)

    try {
      const updatedLabel: LabelDto = {
        ...labelToEdit,
        name: editLabelName,
        color: editLabelColor,
      }

      await LabelService.putApiLabelsByLabelId({
        path: { labelId: labelToEdit.id! },
        body: updatedLabel,
      })

      // Update in available labels
      const updatedAvailableLabels = availableLabels.map((l) =>
        l.id === labelToEdit.id ? { ...l, name: editLabelName, color: editLabelColor } : l,
      )

      // Update in selected labels if present
      const updatedSelectedLabels = selectedLabels.map((l) =>
        l.id === labelToEdit.id ? { ...l, name: editLabelName, color: editLabelColor } : l,
      )

      // Update task labels if present
      const updatedTaskLabels = taskLabels.map((l) =>
        l.id === labelToEdit.id ? { ...l, name: editLabelName, color: editLabelColor } : l,
      )

      // Update state
      availableLabels.splice(0, availableLabels.length, ...updatedAvailableLabels)
      setSelectedLabels(updatedSelectedLabels)
      onUpdate(updatedTaskLabels)

      setLabelToEdit(null)
      toast.success("Label updated successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update label"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLabel = async () => {
    if (labelToDelete === null) return

    setIsSubmitting(true)

    try {
      await LabelService.deleteApiLabelsByLabelId({
        path: { labelId: labelToDelete },
      })

      // Remove from available labels
      const updatedAvailableLabels = availableLabels.filter((l) => l.id !== labelToDelete)

      // Remove from selected labels if present
      const updatedSelectedLabels = selectedLabels.filter((l) => l.id !== labelToDelete)

      // Remove from task labels if present
      const updatedTaskLabels = taskLabels.filter((l) => l.id !== labelToDelete)

      // Update state
      availableLabels.splice(0, availableLabels.length, ...updatedAvailableLabels)
      setSelectedLabels(updatedSelectedLabels)
      onUpdate(updatedTaskLabels)

      toast.success("Label deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete label"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setLabelToDelete(null)
    }
  }

  // Helper to get contrasting text color for a background color
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF"
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Labels</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={14} className="mr-1" />
          Manage
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {taskLabels.length > 0 ? (
          taskLabels.map((label) => (
            <div
              key={label.id}
              className="flex items-center rounded-full px-3 py-1"
              style={{
                backgroundColor: label.color || "#10B981",
                color: getContrastColor(label.color || "#10B981"),
              }}
            >
              <Tag size={12} className="mr-1" />
              <span className="text-sm">{label.name}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">No labels</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manage Labels">
        <div className="p-4">
          {/* Selected labels */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected ({selectedLabels.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center rounded-full px-3 py-1"
                    style={{
                      backgroundColor: label.color || "#10B981",
                      color: getContrastColor(label.color || "#10B981"),
                    }}
                  >
                    <Tag size={12} className="mr-1" />
                    <span className="text-sm">{label.name}</span>
                    <button className="ml-2 opacity-70 hover:opacity-100" onClick={() => handleToggleLabel(label)}>
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">No labels selected</div>
              )}
            </div>
          </div>

          {/* Available labels */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Labels</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsCreatingLabel(true)} disabled={isCreatingLabel}>
                <Plus size={14} className="mr-1" />
                New Label
              </Button>
            </div>

            {/* Create new label form */}
            {isCreatingLabel && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="mb-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Label Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Bug, Feature, Documentation"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={newLabelColor}
                      onChange={(e) => setNewLabelColor(e.target.value)}
                      className="w-10 h-10 rounded-md border-0 p-0 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <div
                      className="ml-3 px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: newLabelColor,
                        color: getContrastColor(newLabelColor),
                      }}
                    >
                      Preview
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingLabel(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateLabel} disabled={!newLabelName.trim() || isSubmitting}>
                    {isSubmitting ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                    Create
                  </Button>
                </div>
              </div>
            )}

            {/* Available labels list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableLabels.length > 0 ? (
                availableLabels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    <div
                      className="flex items-center rounded-full px-3 py-1 cursor-pointer"
                      style={{
                        backgroundColor: label.color || "#10B981",
                        color: getContrastColor(label.color || "#10B981"),
                      }}
                      onClick={() => handleToggleLabel(label)}
                    >
                      <Tag size={12} className="mr-1" />
                      <span className="text-sm">{label.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLabelToEdit(label)
                          setEditLabelName(label.name || "")
                          setEditLabelColor(label.color || "#10B981")
                        }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLabelToDelete(label.id!)}
                        title="Delete"
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic p-2">
                  No labels available. Create a new label to get started.
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveLabels} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Label Modal */}
      <Modal isOpen={labelToEdit !== null} onClose={() => setLabelToEdit(null)} title="Edit Label">
        <div className="p-4">
          <div className="mb-3">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Label Name</label>
            <input
              type="text"
              value={editLabelName}
              onChange={(e) => setEditLabelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={editLabelColor}
                onChange={(e) => setEditLabelColor(e.target.value)}
                className="w-10 h-10 rounded-md border-0 p-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <div
                className="ml-3 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: editLabelColor,
                  color: getContrastColor(editLabelColor),
                }}
              >
                Preview
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setLabelToEdit(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLabel} disabled={!editLabelName.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Label Confirmation */}
      <ConfirmDialog
        isOpen={labelToDelete !== null}
        onClose={() => setLabelToDelete(null)}
        onConfirm={handleDeleteLabel}
        title="Delete Label"
        message="Are you sure you want to delete this label? It will be removed from all tasks that use it."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  )
}

export default TaskLabels
