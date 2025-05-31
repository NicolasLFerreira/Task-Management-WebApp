"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef, type KeyboardEvent } from "react"
import { useParams } from "react-router-dom"
import { BoardService, ListService, type BoardDto, type ListDto } from "api-client"
import PageContainer from "../components/PageContainer"
import ListCard from "../components/List/ListCard"
import ListCreationForm from "../components/List/ListCreationForm"
import LabelManager from "../components/Label/LabelManager"
import { Loader2, AlertTriangle, Edit3, X, Tag, Check } from "lucide-react"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>()
  const [board, setBoard] = useState<BoardDto | null>(null)
  const [lists, setLists] = useState<ListDto[]>([])
  const [isLoadingBoard, setIsLoadingBoard] = useState(true)
  const [isLoadingLists, setIsLoadingLists] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editableTitle, setEditableTitle] = useState("")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editableDescription, setEditableDescription] = useState("")
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false)

  const parsedBoardId = boardId ? Number.parseInt(boardId, 10) : null

  const listSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require pointer to move by 5px before activating a drag
        // This allows for clicks on elements within the draggable item
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const fetchBoardDetails = useCallback(async () => {
    if (!parsedBoardId) return
    setIsLoadingBoard(true)
    setError(null)
    try {
      const response = await BoardService.getApiBoardsByBoardId({ path: { boardId: parsedBoardId } })
      const fetchedBoard = response.data ?? null
      setBoard(fetchedBoard)
      if (fetchedBoard) {
        setEditableTitle(fetchedBoard.title || "")
        setEditableDescription(fetchedBoard.description || "")
      }
    } catch (err) {
      console.error("Error fetching board details:", err)
      setError("Failed to load board details. It might not exist or you may not have access.")
    } finally {
      setIsLoadingBoard(false)
    }
  }, [parsedBoardId])

  const fetchLists = useCallback(async () => {
    if (!parsedBoardId) return
    setIsLoadingLists(true)
    try {
      const response = await ListService.getApiListsBoardByBoardId({ path: { boardId: parsedBoardId } })
      // Assuming lists have a 'position' field for initial sorting
      setLists(response.data?.sort((a, b) => a.position - b.position) || [])
    } catch (err) {
      console.error("Error fetching lists:", err)
      setError((prev) => prev || "Failed to load lists for this board.")
    } finally {
      setIsLoadingLists(false)
    }
  }, [parsedBoardId])

  useEffect(() => {
    fetchBoardDetails()
    fetchLists()
  }, [fetchBoardDetails, fetchLists])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus()
      descriptionTextareaRef.current.select()
    }
  }, [isEditingDescription])

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false)
    setEditableTitle(board?.title || "")
    setError(null)
  }

  const handleCancelDescriptionEdit = () => {
    setIsEditingDescription(false)
    setEditableDescription(board?.description || "")
    setError(null)
  }

  const handleSaveBoardDetails = async () => {
    if (!board || !parsedBoardId) return
    const newTitle = editableTitle.trim()
    const newDescription = editableDescription.trim()
    if (!newTitle) {
      setError("Board title cannot be empty.")
      setEditableTitle(board.title || "")
      setIsEditingTitle(false)
      return
    }
    const originalBoard = { ...board }
    const updatedBoardDisplay = { ...board, title: newTitle, description: newDescription }
    setBoard(updatedBoardDisplay)
    setIsEditingTitle(false)
    setIsEditingDescription(false)
    setError(null)
    try {
      await BoardService.putApiBoardsByBoardId({
        path: { boardId: parsedBoardId },
        body: { ...board, title: newTitle, description: newDescription },
      })
    } catch (err) {
      console.error("Error updating board details:", err)
      setError("Failed to update board details.")
      setBoard(originalBoard)
      setEditableTitle(originalBoard.title || "")
      setEditableDescription(originalBoard.description || "")
    }
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveBoardDetails()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelTitleEdit()
    }
  }

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveBoardDetails()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelDescriptionEdit()
    }
  }

  const handleTitleBlur = () => {
    setTimeout(() => {
      if (isEditingTitle) handleCancelTitleEdit()
    }, 100)
  }

  const handleDescriptionBlur = () => {
    setTimeout(() => {
      if (isEditingDescription) handleCancelDescriptionEdit()
    }, 100)
  }

  const handleListCreated = () => fetchLists()
  const handleListDeleted = (deletedListId: number) =>
    setLists((prevLists) => prevLists.filter((list) => list.id !== deletedListId))
  const handleListUpdated = () => fetchLists()
  const handleLabelsChanged = () => {
    console.log("Labels potentially changed.")
  }

  const handleDragEndLists = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = lists.findIndex((l) => `list-${l.id}` === active.id)
      const newIndex = lists.findIndex((l) => `list-${l.id}` === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reorderedLists = arrayMove(lists, oldIndex, newIndex)
      setLists(reorderedLists) // Optimistic update

      if (!parsedBoardId) return

      try {
        await ListService.postApiListsReorder({
          body: {
            boardId: parsedBoardId,
            listIds: reorderedLists.map((l) => l.id),
          },
        })
      } catch (error) {
        console.error("Failed to reorder lists:", error)
        alert("Failed to reorder lists. Reverting.")
        fetchLists() // Revert on error
      }
    }
  }

  if (isLoadingBoard) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-teal-500" size={48} />
        </div>
      </PageContainer>
    )
  }

  if (error && !board && !isLoadingBoard) {
    return (
      <PageContainer>
        <div className="p-4 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-2" size={48} />
          <h1 className="text-xl font-semibold text-red-700 dark:text-red-400">Error Loading Board</h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </PageContainer>
    )
  }

  if (!board) {
    return (
      <PageContainer>
        <div className="p-4 text-center">
          <h1 className="text-xl font-semibold">Board not found</h1>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="p-4 h-full flex flex-col">
        <div className="mb-6">
          {isEditingTitle ? (
            <div className="flex flex-col">
              <input
                ref={titleInputRef}
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleBlur}
                className="text-3xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-teal-500 focus:outline-none flex-grow"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSaveBoardDetails}
                  className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center"
                >
                  {" "}
                  <Check size={16} className="mr-1" /> Save{" "}
                </button>
                <button
                  onClick={handleCancelTitleEdit}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 flex items-center"
                >
                  {" "}
                  <X size={16} className="mr-1" /> Cancel{" "}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h1
                className="text-3xl font-bold text-slate-800 dark:text-slate-100 truncate"
                title={board.title ?? undefined}
              >
                {" "}
                {board.title}{" "}
              </h1>
              <Edit3 size={20} className="ml-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {isEditingDescription ? (
            <div className="mt-1 flex flex-col">
              <textarea
                ref={descriptionTextareaRef}
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                onBlur={handleDescriptionBlur}
                className="text-slate-600 dark:text-slate-400 bg-transparent border-b border-teal-500 focus:outline-none w-full resize-none"
                rows={2}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSaveBoardDetails}
                  className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center"
                >
                  {" "}
                  <Check size={16} className="mr-1" /> Save{" "}
                </button>
                <button
                  onClick={handleCancelDescriptionEdit}
                  className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 flex items-center"
                >
                  {" "}
                  <X size={16} className="mr-1" /> Cancel{" "}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center group cursor-pointer mt-1" onClick={() => setIsEditingDescription(true)}>
              <p className="text-slate-600 dark:text-slate-400 truncate" title={board.description ?? undefined}>
                {" "}
                {board.description || (
                  <span className="italic text-slate-500 dark:text-slate-400">Add description...</span>
                )}{" "}
              </p>
              <Edit3 size={16} className="ml-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            onClick={() => setIsLabelManagerOpen(true)}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
          >
            <Tag size={14} className="mr-1.5" /> Manage Labels
          </button>
        </div>

        <DndContext sensors={listSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndLists}>
          <SortableContext items={lists.map((l) => `list-${l.id}`)} strategy={horizontalListSortingStrategy}>
            <div className="flex-grow overflow-x-auto pb-4">
              <div className="flex space-x-4 h-full items-start">
                {isLoadingLists && !error && (
                  <div className="flex justify-center items-center w-full h-full">
                    <Loader2 className="animate-spin text-teal-500" size={32} />
                  </div>
                )}
                {!isLoadingLists &&
                  lists.map((list) => (
                    <ListCard
                      key={`list-${list.id}`}
                      id={`list-${list.id}`} // Pass the dnd-kit compatible ID
                      list={list}
                      boardId={board.id}
                      onListDeleted={handleListDeleted}
                      onListUpdated={handleListUpdated}
                    />
                  ))}
                {!isLoadingLists && parsedBoardId && (
                  <ListCreationForm boardId={parsedBoardId} onListCreated={handleListCreated} />
                )}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {isLabelManagerOpen && parsedBoardId && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsLabelManagerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Manage Board Labels</h2>
              <button
                onClick={() => setIsLabelManagerOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Close label manager"
              >
                {" "}
                <X size={20} />{" "}
              </button>
            </div>
            <LabelManager boardId={parsedBoardId} onLabelsChange={handleLabelsChanged} />
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default BoardView
