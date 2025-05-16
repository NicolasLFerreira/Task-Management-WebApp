"use client"

import type React from "react"
import { createContext, useState, useCallback, useContext } from "react"
import { ApiService } from "../services/api-service"
import { ToastContext } from "./ToastContext"
import type { BoardDto } from "../../api-client/types.gen"

interface BoardContextType {
  currentBoard: BoardDto | null
  boards: BoardDto[]
  setCurrentBoard: (board: BoardDto) => void
  refreshBoard: () => Promise<void>
  refreshAllBoards: () => Promise<void>
}

export const BoardContext = createContext<BoardContextType>({
  currentBoard: null,
  boards: [],
  setCurrentBoard: () => {},
  refreshBoard: async () => {},
  refreshAllBoards: async () => {},
})

interface BoardProviderProps {
  children: React.ReactNode
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [currentBoard, setCurrentBoard] = useState<BoardDto | null>(null)
  const [boards, setBoards] = useState<BoardDto[]>([])
  const { showError } = useContext(ToastContext)

  const refreshBoard = useCallback(async (): Promise<void> => {
    if (!currentBoard?.id) return

    try {
      const updatedBoard = await ApiService.getBoardById(currentBoard.id)
      setCurrentBoard(updatedBoard)

      // Also update the board in the boards array
      setBoards((prevBoards) =>
        prevBoards.map((board: BoardDto) => (board.id === updatedBoard.id ? updatedBoard : board)),
      )
    } catch (error: unknown) {
      console.error("Failed to refresh board:", error)
      showError("Failed to refresh board")
    }
  }, [currentBoard?.id, showError])

  const refreshAllBoards = useCallback(async (): Promise<void> => {
    try {
      const fetchedBoards = await ApiService.getBoards()
      setBoards(fetchedBoards)

      // If there's a current board, update it with the refreshed data
      if (currentBoard?.id) {
        const updatedCurrentBoard = fetchedBoards.find((board) => board.id === currentBoard.id)
        if (updatedCurrentBoard) {
          setCurrentBoard(updatedCurrentBoard)
        }
      }
    } catch (error: unknown) {
      console.error("Failed to refresh boards:", error)
      showError("Failed to refresh boards")
    }
  }, [currentBoard?.id, showError])

  const updateCurrentBoard = (board: BoardDto) => {
    setCurrentBoard(board)
  }

  return (
    <BoardContext.Provider
      value={{
        currentBoard,
        boards,
        setCurrentBoard: updateCurrentBoard,
        refreshBoard,
        refreshAllBoards,
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}
