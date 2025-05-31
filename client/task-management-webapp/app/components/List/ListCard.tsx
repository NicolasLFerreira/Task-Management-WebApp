"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { type ListDto, TaskItemService, type TaskItemDto, ListService } from "api-client"
import { Pencil, Trash2, PlusCircle, Loader2, GripVertical } from "lucide-react"
import TaskCard from "../TaskItem/TaskCard"
import ListEditModal from "./ListEditModal"
import TaskCreationModal from "../TaskItem/TaskCreationModal"
import TaskDetailModal from "../TaskItem/TaskDetailModal"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ListCardProps {
  list: ListDto
  boardId: number
  onListDeleted: (listId: number) => void
  onListUpdated: () => void
  // Props from BoardView's useSortable for the list itself
  id: string // Unique ID for dnd-kit, e.g., `list-${list.id}`
}

// Wrapper for TaskCard to use useSortable hook
const SortableTaskItem: React.FC<{ task: TaskItemDto; onClick: () => void }> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
  }

  return (
    <TaskCard
      id={`task-${task.id}`}
      task={task}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
      onClick={onClick}
      onViewClick={onClick}
    />
  )
}

const ListCard: React.FC<ListCardProps> = ({ list, boardId, onListDeleted, onListUpdated, id: listIdProp }) => {
  const [tasks, setTasks] = useState<TaskItemDto[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [errorTasks, setErrorTasks] = useState<string | null>(null)
  const [isEditingList, setIsEditingList] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItemDto | null>(null)

  const {
    attributes: listSortableAttributes,
    listeners: listSortableListeners,
    setNodeRef: setListSortableNodeRef,
    transform: listSortableTransform,
    transition: listSortableTransition,
    isDragging: isListCurrentlyDragging,
  } = useSortable({ id: listIdProp })

  const listSortableStyle = {
    transform: CSS.Translate.toString(listSortableTransform),
    transition: listSortableTransition,
    opacity: isListCurrentlyDragging ? 0.7 : 1,
    boxShadow: isListCurrentlyDragging ? "0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)" : undefined,
  }

  const taskSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Allows clicks if not dragged far enough
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchTasks = useCallback(async () => {
    if (!list.id) return
    setIsLoadingTasks(true)
    setErrorTasks(null)
    try {
      const response = await TaskItemService.getApiTasksListByListId({ path: { listId: list.id } })
      setTasks(response.data?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) || [])
    } catch (err) {
      console.error(`Error fetching tasks for list ${list.id}:`, err)
      setErrorTasks("Failed to load tasks.")
    } finally {
      setIsLoadingTasks(false)
    }
  }, [list.id])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDeleteList = async () => {
    if (!list.id) return
    if (
      window.confirm(`Are you sure you want to delete the list "${list.title}"? This will also delete all tasks in it.`)
    ) {
      try {
        await ListService.deleteApiListsByListId({ path: { listId: list.id } })
        onListDeleted(list.id)
      } catch (err) {
        console.error("Failed to delete list:", err)
        alert("Failed to delete list. Please try again.")
      }
    }
  }

  const handleTaskCreated = () => {
    fetchTasks()
  }

  const handleTaskCardClick = (task: TaskItemDto) => {
    setSelectedTaskForDetail(task)
  }

  const closeTaskDetailModal = () => {
    setSelectedTaskForDetail(null)
    fetchTasks()
  }

  const handleDragEndTasks = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => `task-${t.id}` === active.id)
      const newIndex = tasks.findIndex((t) => `task-${t.id}` === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
      setTasks(reorderedTasks) // Optimistic update

      try {
        await TaskItemService.postApiTasksReorder({
          body: {
            listId: list.id,
            taskIds: reorderedTasks.map((t) => t.id!),
          },
        })
      } catch (error) {
        console.error("Failed to reorder tasks:", error)
        alert("Failed to reorder tasks. Reverting.")
        fetchTasks() // Revert on error
      }
    }
  }

  return (
    <div
      ref={setListSortableNodeRef}
      style={listSortableStyle}
      {...listSortableAttributes} // Apply attributes for sortable list item
      className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 w-72 flex-shrink-0 h-full flex flex-col max-h-[calc(100vh-12rem)]"
    >
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <button
            {...listSortableListeners} // Apply listeners to the drag handle
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing"
            aria-label={`Drag list ${list.title}`}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <h3
            className="font-semibold text-slate-700 dark:text-slate-200 truncate ml-1"
            title={list.title ?? undefined}
          >
            {list.title}
          </h3>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={() => setIsEditingList(true)}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label={`Edit list ${list.title}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDeleteList}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label={`Delete list ${list.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <DndContext sensors={taskSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTasks}>
        <SortableContext items={tasks.map((t) => `task-${t.id}`)} strategy={verticalListSortingStrategy}>
          <div className="flex-grow overflow-y-auto space-y-2 pr-1 mb-2">
            {isLoadingTasks && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-teal-500" size={24} />
              </div>
            )}
            {errorTasks && <p className="text-red-500 text-sm">{errorTasks}</p>}
            {!isLoadingTasks &&
              !errorTasks &&
              tasks.map((task) => (
                <SortableTaskItem key={`task-${task.id}`} task={task} onClick={() => handleTaskCardClick(task)} />
              ))}
            {!isLoadingTasks && !errorTasks && tasks.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No tasks in this list.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setIsCreatingTask(true)}
        className="mt-auto flex-shrink-0 flex items-center justify-center w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
      >
        <PlusCircle size={16} className="mr-2" /> Add a card
      </button>

      {isEditingList && list.id && (
        <ListEditModal
          list={list}
          boardId={boardId}
          closeModal={() => {
            setIsEditingList(false)
            onListUpdated()
          }}
        />
      )}
      {isCreatingTask && list.id && (
        <TaskCreationModal
          listDto={list}
          closeModal={() => setIsCreatingTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
      {selectedTaskForDetail && selectedTaskForDetail.id && (
        <TaskDetailModal
          taskId={selectedTaskForDetail.id}
          boardId={boardId}
          onClose={closeTaskDetailModal}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  )
}

export default ListCard
