"use client"

import { useState } from "react"
import { CheckSquare, Plus, Edit2, Trash2, MoreVertical, Check, Square } from "lucide-react"
import { ChecklistService } from "api-client"
import type { ChecklistDtoReadable, ChecklistDtoWritable, ChecklistItemDto } from "api-client"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Dropdown } from "../ui/Dropdown"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { Modal } from "../ui/Modal"
import { useToast } from "../../hooks/useToast"

interface TaskChecklistsProps {
  taskId: number
  checklists: ChecklistDtoReadable[]
  onUpdate: (checklists: ChecklistDtoReadable[]) => void
}

const TaskChecklists = ({ taskId, checklists, onUpdate }: TaskChecklistsProps) => {
  const [isAddingChecklist, setIsAddingChecklist] = useState(false)
  const [newChecklistTitle, setNewChecklistTitle] = useState("")
  const [editingChecklist, setEditingChecklist] = useState<ChecklistDtoReadable | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [checklistToDelete, setChecklistToDelete] = useState<number | null>(null)
  const [isAddingItem, setIsAddingItem] = useState<number | null>(null)
  const [newItemText, setNewItemText] = useState("")
  const [editingItem, setEditingItem] = useState<{ checklistId: number; item: ChecklistItemDto } | null>(null)
  const [editItemText, setEditItemText] = useState("")
  const [itemToDelete, setItemToDelete] = useState<{ checklistId: number; itemId: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return

    setIsSubmitting(true)

    try {
      const checklistData: ChecklistDtoWritable = {
        title: newChecklistTitle,
        taskItemId: taskId,
      }

      const response = await ChecklistService.postApiChecklists({
        body: checklistData,
      })

      if (response.data) {
        // Add the new checklist to the list
        onUpdate([...checklists, response.data])
        setNewChecklistTitle("")
        setIsAddingChecklist(false)
        toast.success("Checklist added successfully")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add checklist"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditChecklist = async () => {
    if (!editingChecklist || !editTitle.trim()) return

    setIsSubmitting(true)

    try {
      const updatedChecklist: ChecklistDtoWritable = {
        title: editTitle,
        taskItemId: taskId,
      }

      await ChecklistService.putApiChecklistsByChecklistId({
        path: { checklistId: editingChecklist.id! },
        body: updatedChecklist,
      })

      // Update the checklist in the list
      const updatedChecklists = checklists.map((c) => (c.id === editingChecklist.id ? { ...c, title: editTitle } : c))

      onUpdate(updatedChecklists)
      setEditingChecklist(null)
      toast.success("Checklist updated successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update checklist"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteChecklist = async () => {
    if (checklistToDelete === null) return

    setIsSubmitting(true)

    try {
      await ChecklistService.deleteApiChecklistsByChecklistId({
        path: { checklistId: checklistToDelete },
      })

      // Remove the checklist from the list
      const updatedChecklists = checklists.filter((c) => c.id !== checklistToDelete)
      onUpdate(updatedChecklists)
      toast.success("Checklist deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete checklist"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setChecklistToDelete(null)
    }
  }

  const handleAddItem = async (checklistId: number) => {
    if (!newItemText.trim()) return

    setIsSubmitting(true)

    try {
      const itemData: ChecklistItemDto = {
        content: newItemText,
        checklistId,
        isChecked: false,
      }

      const response = await ChecklistService.postApiChecklistsItems({
        body: itemData,
      })

      if (response.data) {
        // Add the new item to the checklist
        const updatedChecklists = checklists.map((c) => {
          if (c.id === checklistId) {
            return {
              ...c,
              items: [...(c.items || []), response.data],
            }
          }
          return c
        })

        onUpdate(updatedChecklists)
        setNewItemText("")
        setIsAddingItem(null)
        toast.success("Item added successfully")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add item"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditItem = async () => {
    if (!editingItem || !editItemText.trim()) return

    setIsSubmitting(true)

    try {
      const updatedItem: ChecklistItemDto = {
        ...editingItem.item,
        content: editItemText,
      }

      await ChecklistService.putApiChecklistsItemsByItemId({
        path: { itemId: editingItem.item.id! },
        body: updatedItem,
      })

      // Update the item in the checklist
      const updatedChecklists = checklists.map((c) => {
        if (c.id === editingItem.checklistId) {
          return {
            ...c,
            items: c.items?.map((item) =>
              item.id === editingItem.item.id ? { ...item, content: editItemText } : item,
            ),
          }
        }
        return c
      })

      onUpdate(updatedChecklists)
      setEditingItem(null)
      toast.success("Item updated successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update item"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    setIsSubmitting(true)

    try {
      await ChecklistService.deleteApiChecklistsItemsByItemId({
        path: { itemId: itemToDelete.itemId },
      })

      // Remove the item from the checklist
      const updatedChecklists = checklists.map((c) => {
        if (c.id === itemToDelete.checklistId) {
          return {
            ...c,
            items: c.items?.filter((item) => item.id !== itemToDelete.itemId),
          }
        }
        return c
      })

      onUpdate(updatedChecklists)
      toast.success("Item deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete item"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setItemToDelete(null)
    }
  }

  const handleToggleItem = async (checklistId: number, item: ChecklistItemDto) => {
    setIsSubmitting(true)

    try {
      const updatedItem: ChecklistItemDto = {
        ...item,
        isChecked: !item.isChecked,
      }

      await ChecklistService.putApiChecklistsItemsByItemId({
        path: { itemId: item.id! },
        body: updatedItem,
      })

      // Update the item in the checklist
      const updatedChecklists = checklists.map((c) => {
        if (c.id === checklistId) {
          return {
            ...c,
            items: c.items?.map((i) => (i.id === item.id ? { ...i, isChecked: !item.isChecked } : i)),
          }
        }
        return c
      })

      onUpdate(updatedChecklists)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update item"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate completion percentage for each checklist
  const getCompletionPercentage = (checklist: ChecklistDtoReadable) => {
    const items = checklist.items || []
    if (items.length === 0) return 0

    const completedItems = items.filter((item) => item.isChecked).length
    return Math.round((completedItems / items.length) * 100)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <CheckSquare size={18} className="mr-2" />
          Checklists ({checklists.length})
        </h3>
        <Button variant="secondary" size="sm" onClick={() => setIsAddingChecklist(true)}>
          <Plus size={14} className="mr-1" />
          Add Checklist
        </Button>
      </div>

      {/* Checklists */}
      <div className="space-y-6">
        {checklists.length > 0 ? (
          checklists.map((checklist) => (
            <div key={checklist.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900 dark:text-white">{checklist.title}</h4>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {checklist.items?.filter((item) => item.isChecked).length || 0}/{checklist.items?.length || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingItem(checklist.id!)}>
                    <Plus size={14} className="mr-1" />
                    Add Item
                  </Button>
                  <Dropdown
                    trigger={
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <MoreVertical size={16} />
                      </button>
                    }
                    items={[
                      {
                        label: "Edit",
                        icon: <Edit2 size={16} />,
                        onClick: () => {
                          setEditingChecklist(checklist)
                          setEditTitle(checklist.title || "")
                        },
                      },
                      {
                        label: "Delete",
                        icon: <Trash2 size={16} />,
                        onClick: () => setChecklistToDelete(checklist.id!),
                        className: "text-red-500",
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 h-1">
                <div className="bg-teal-500 h-1" style={{ width: `${getCompletionPercentage(checklist)}%` }}></div>
              </div>

              {/* Checklist items */}
              <div className="p-3">
                {isAddingItem === checklist.id && (
                  <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <input
                      type="text"
                      placeholder="Item text..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white mb-2"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsAddingItem(null)
                          setNewItemText("")
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(checklist.id!)}
                        disabled={!newItemText.trim() || isSubmitting}
                      >
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                <ul className="space-y-2">
                  {checklist.items && checklist.items.length > 0 ? (
                    checklist.items.map((item) => (
                      <li key={item.id} className="flex items-start group">
                        <button
                          className="mt-0.5 mr-2 text-gray-500 hover:text-teal-500 dark:text-gray-400 dark:hover:text-teal-400 focus:outline-none"
                          onClick={() => handleToggleItem(checklist.id!, item)}
                          disabled={isSubmitting}
                        >
                          {item.isChecked ? (
                            <Check size={18} className="text-teal-500 dark:text-teal-400" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>

                        {editingItem?.item.id === item.id ? (
                          <div className="flex-1">
                            <input
                              type="text"
                              value={editItemText}
                              onChange={(e) => setEditItemText(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white mb-2"
                              disabled={isSubmitting}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingItem(null)}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleEditItem}
                                disabled={!editItemText.trim() || isSubmitting}
                              >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-1 justify-between items-start">
                            <span
                              className={`text-gray-700 dark:text-gray-300 ${item.isChecked ? "line-through text-gray-400 dark:text-gray-500" : ""}`}
                            >
                              {item.content}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Dropdown
                                trigger={
                                  <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    <MoreVertical size={16} />
                                  </button>
                                }
                                items={[
                                  {
                                    label: "Edit",
                                    icon: <Edit2 size={16} />,
                                    onClick: () => {
                                      setEditingItem({ checklistId: checklist.id!, item })
                                      setEditItemText(item.content || "")
                                    },
                                  },
                                  {
                                    label: "Delete",
                                    icon: <Trash2 size={16} />,
                                    onClick: () => setItemToDelete({ checklistId: checklist.id!, itemId: item.id! }),
                                    className: "text-red-500",
                                  },
                                ]}
                              />
                            </div>
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 dark:text-gray-400 italic">No items in this checklist</li>
                  )}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            No checklists yet. Add a checklist to track progress!
          </div>
        )}
      </div>

      {/* Add Checklist Modal */}
      <Modal isOpen={isAddingChecklist} onClose={() => setIsAddingChecklist(false)} title="Add Checklist">
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="checklistTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Checklist Title
            </label>
            <input
              type="text"
              id="checklistTitle"
              placeholder="e.g., Documentation Tasks"
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsAddingChecklist(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddChecklist} disabled={!newChecklistTitle.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                "Add Checklist"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Checklist Modal */}
      <Modal isOpen={editingChecklist !== null} onClose={() => setEditingChecklist(null)} title="Edit Checklist">
        <div className="p-4">
          <div className="mb-4">
            <label
              htmlFor="editChecklistTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Checklist Title
            </label>
            <input
              type="text"
              id="editChecklistTitle"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setEditingChecklist(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditChecklist} disabled={!editTitle.trim() || isSubmitting}>
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

      {/* Delete Checklist Confirmation */}
      <ConfirmDialog
        isOpen={checklistToDelete !== null}
        onClose={() => setChecklistToDelete(null)}
        onConfirm={handleDeleteChecklist}
        title="Delete Checklist"
        message="Are you sure you want to delete this checklist? All items will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* Delete Item Confirmation */}
      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  )
}

export default TaskChecklists
