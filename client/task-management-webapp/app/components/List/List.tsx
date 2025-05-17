"use client"

import type React from "react"
import { useState } from "react"
import { useTask } from "../../hooks/useTask"
import { useDragDrop } from "../../hooks/useDragDrop"
import { ApiService } from "../../services/api-service"
import type { ListDto } from "../../../api-client/types.gen"
import { MoreHorizontal, Plus } from "lucide-react"
import { Card } from "../ui/Card"
import { IconButton } from "../ui/IconButton"
import { Dropdown } from "../ui/Dropdown"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { EmptyState } from "../ui/EmptyState"
import { TaskCard } from "../TaskItem/TaskCard"
import ListEditForm from "./ListEditForm"
import ListDeleteConfirmation from "./ListDeleteConfirmation"
import ListReorderHandle from "./ListReorderHandle"
import TaskModal from "../TaskItem/TaskModal"
import { useToast } from "../../hooks/useToast"

interface ListProps {
  list: ListDto
}

const List: React.FC<ListProps> = ({ list }) => {
  const { tasks, isLoading, error, moveTask, fetchTasksByListId } = useTask()
  const { startDrag, handleDragOver, drop, draggedItem } = useDragDrop()
  const toast = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const listTasks = tasks.filter((task) => task.listId === list.id)

  const handleTaskDragStart = (id: number) => {
    startDrag(id, "task")
  }

  const handleTaskDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    handleDragOver(id)
  }

  const handleTaskDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedItem && draggedItem.type === "task") {
      try {
        // If dropping in the same list, reorder
        if (listTasks.some((task) => task.id === draggedItem.id)) {
          const newOrder = listTasks.map((task) => task.id!).filter((id) => id !== draggedItem.id)

          const targetIndex = listTasks.findIndex((task) => task.id === draggedItem.overItemId)

          if (targetIndex !== -1) {
            newOrder.splice(targetIndex, 0, draggedItem.id)
          } else {
            newOrder.push(draggedItem.id)
          }

          // Use ApiService to reorder tasks
          await ApiService.reorderTasks(list.id!, newOrder)
          toast.success("Task reordered successfully")
          // Refresh the list tasks
          await fetchTasksByListId(list.id!)
        } else {
          // If dropping from another list, move the task
          const taskToMove = tasks.find((task) => task.id === draggedItem.id)
          if (taskToMove && taskToMove.listId) {
            // Use moveTask from useTask hook
            await moveTask(draggedItem.id, taskToMove.listId, list.id!)
            toast.success("Task moved successfully")
          }
        }
      } catch (error) {
        toast.error("Failed to move task")
        console.error("Error moving task:", error)
      } finally {
        drop()
      }
    } else {
      drop()
    }
  }

  const handleTaskCreated = () => {
    toast.success("Task created successfully")
    // Refresh the list tasks
    if (list.id) {
      fetchTasksByListId(list.id)
    }
  }

  if (isEditing) {
    return (
      <Card className="p-3">
        <ListEditForm list={list} onCancel={() => setIsEditing(false)} onSuccess={() => setIsEditing(false)} />
      </Card>
    )
  }

  return (
    <>
      <Card className="flex flex-col h-full max-h-[calc(100vh-180px)]">
        <div className="p-3 flex items-center justify-between border-b dark:border-gray-700">
          <div className="flex items-center">
            <ListReorderHandle />
            <h3 className="font-medium text-gray-800 dark:text-white ml-2">{list.title}</h3>
            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {listTasks.length}
            </span>
          </div>
          <div className="flex items-center">
            <IconButton
              icon={<Plus size={16} />}
              onClick={() => setIsAddTaskModalOpen(true)}
              variant="ghost"
              size="sm"
              ariaLabel="Add task"
            />
            <Dropdown
              trigger={
                <IconButton icon={<MoreHorizontal size={16} />} variant="ghost" size="sm" ariaLabel="List options" />
              }
              items={[
                {
                  label: "Edit List",
                  onClick: () => setIsEditing(true),
                },
                {
                  label: "Delete List",
                  onClick: () => setIsDeleteModalOpen(true),
                  className: "text-red-600 dark:text-red-400",
                },
              ]}
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-2 space-y-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleTaskDrop}
        >
          {isLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-red-500 p-2 text-sm">{error}</div>
          ) : listTasks.length === 0 ? (
            <EmptyState title="No tasks" description="Add your first task to this list" className="py-8" />
          ) : (
            listTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleTaskDragStart(task.id!)}
                onDragOver={(e) => handleTaskDragOver(e, task.id!)}
                className={`${
                  draggedItem?.type === "task" && draggedItem.id === task.id ? "opacity-50" : "opacity-100"
                }`}
              >
                <TaskCard task={task} listId={0} index={0} />
              </div>
            ))
          )}
        </div>

        <div className="p-2 border-t dark:border-gray-700">
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="w-full text-left text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add a task
          </button>
        </div>
      </Card>

      {isDeleteModalOpen && (
        <ListDeleteConfirmation isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} list={list} />
      )}

      {isAddTaskModalOpen && (
        <TaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          listId={list.id}
          boardId={list.boardId}
          onSuccess={handleTaskCreated}
        />
      )}
    </>
  )
}

export default List
