"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ApiService } from "../services/api-service"
import { useToast } from "./useToast"
import type { BoardDto, ListDto } from "../../api-client/types.gen"

interface BoardContextType {
  currentBoard: BoardDto | null
  boards: BoardDto[]
  lists: ListDto[]
  isLoading: boolean
  error: string | null
  fetchBoards: () => Promise<void>
  fetchBoardById: (boardId: number) => Promise<void>
  createBoard: (boardData: BoardDto) => Promise<BoardDto>
  updateBoard: (boardId: number, boardData: BoardDto) => Promise<void>
  deleteBoard: (boardId: number) => Promise<void>
  fetchLists: (boardId: number) => Promise<void>
  createList: (listData: ListDto) => Promise<ListDto>
  updateList: (listId: number, listData: ListDto) => Promise<void>
  deleteList: (listId: number) => Promise<void>
  reorderLists: (boardId: number, listIds: number[]) => Promise<void>
  clearCurrentBoard: () => void
}

const BoardContext = createContext<BoardContextType | undefined>(undefined)

export function BoardProvider({ children }: { children: ReactNode }) {
  const [currentBoard, setCurrentBoard] = useState<BoardDto | null>(null)
  const [boards, setBoards] = useState<BoardDto[]>([])
  const [lists, setLists] = useState<ListDto[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchBoards = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedBoards = await ApiService.getBoards()
      setBoards(fetchedBoards)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch boards"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBoardById = async (boardId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const board = await ApiService.getBoardById(boardId)
      setCurrentBoard(board)

      // Also fetch lists for this board
      await fetchLists(boardId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch board #${boardId}`
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const createBoard = async (boardData: BoardDto): Promise<BoardDto> => {
    setIsLoading(true)
    setError(null)
    try {
      const newBoard = await ApiService.createBoard(boardData)
      setBoards((prevBoards) => [...prevBoards, newBoard])
      toast.success("Board created successfully")
      return newBoard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create board"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateBoard = async (boardId: number, boardData: BoardDto) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.updateBoard(boardId, boardData)

      // Update boards list
      setBoards((prevBoards) => prevBoards.map((board) => (board.id === boardId ? { ...board, ...boardData } : board)))

      // Update current board if it's the one being edited
      if (currentBoard && currentBoard.id === boardId) {
        setCurrentBoard({ ...currentBoard, ...boardData })
      }

      toast.success("Board updated successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update board"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBoard = async (boardId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteBoard(boardId)

      // Remove from boards list
      setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardId))

      // Clear current board if it's the one being deleted
      if (currentBoard && currentBoard.id === boardId) {
        setCurrentBoard(null)
      }

      toast.success("Board deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete board"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLists = async (boardId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedLists = await ApiService.getListsByBoardId(boardId)
      // Sort lists by position
      const sortedLists = [...fetchedLists].sort((a, b) => (a.position || 0) - (b.position || 0))
      setLists(sortedLists)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch lists"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const createList = async (listData: ListDto): Promise<ListDto> => {
    setIsLoading(true)
    setError(null)
    try {
      const newList = await ApiService.createList(listData)
      setLists((prevLists) => [...prevLists, newList])
      toast.success("List created successfully")
      return newList
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create list"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateList = async (listId: number, listData: ListDto) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.updateList(listId, listData)

      // Update lists
      setLists((prevLists) => prevLists.map((list) => (list.id === listId ? { ...list, ...listData } : list)))

      toast.success("List updated successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update list"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteList = async (listId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await ApiService.deleteList(listId)

      // Remove from lists
      setLists((prevLists) => prevLists.filter((list) => list.id !== listId))

      toast.success("List deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete list"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const reorderLists = async (boardId: number, listIds: number[]) => {
    setError(null)
    try {
      // Optimistically update the UI
      const reorderedLists = [...lists]
      listIds.forEach((id, index) => {
        const listIndex = reorderedLists.findIndex((list) => list.id === id)
        if (listIndex !== -1) {
          reorderedLists[listIndex] = { ...reorderedLists[listIndex], position: index }
        }
      })

      // Sort by new positions
      const sortedLists = [...reorderedLists].sort((a, b) => (a.position || 0) - (b.position || 0))
      setLists(sortedLists)

      // Call API to persist changes
      await ApiService.reorderLists(boardId, listIds)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reorder lists"
      setError(errorMessage)
      toast.error(errorMessage)

      // Revert optimistic update by refetching lists
      await fetchLists(boardId)
      throw err
    }
  }

  const clearCurrentBoard = () => {
    setCurrentBoard(null)
    setLists([])
  }

  return (
    <BoardContext.Provider
      value={{
        currentBoard,
        boards,
        lists,
        isLoading,
        error,
        fetchBoards,
        fetchBoardById,
        createBoard,
        updateBoard,
        deleteBoard,
        fetchLists,
        createList,
        updateList,
        deleteList,
        reorderLists,
        clearCurrentBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}

/**
 * Custom hook for accessing board context
 * @returns Board context values and methods
 */
export const useBoard = () => {
  const context = useContext(BoardContext)

  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider")
  }

  return context
}
