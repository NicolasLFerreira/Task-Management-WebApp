"use client"

import type React from "react"

import { ListService, type BoardDto, type ListDto } from "api-client"
import { useEffect, useState } from "react"
import TaskList from "./TaskListCard"
import { Edit2, Loader2, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

type SpecialMessageProps = {
  children: React.ReactNode
}

const SpecialMessage = ({ children }: SpecialMessageProps) => {
  return (
    <div className="rounded-xl flex items-center justify-center h-full bg-gray-800/50 px-4 py-2 text-center text-gray-300">
      {children}
    </div>
  )
}

type Props = {
  board: BoardDto
  onDelete?: (id: number) => void
  onEdit?: (board: BoardDto) => void 
  canDelete?: boolean
  canEdit?: boolean 
}

const Board = ({ board, onDelete, onEdit, canDelete, canEdit }: Props) => {
  const [taskLists, setTaskLists] = useState<ListDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)

  const getTaskLists = async () => {
    try {
      setLoading(true)
      const result = await ListService.getApiListsBoardByBoardId({
        path: { boardId: board.id },
      })
      setTaskLists(result.data ?? [])
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Failed to load lists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTaskLists()
  }, [board.id])

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 group w-full h-full min-w-[250px] min-h-[250px] p-4 rounded-lg shadow-md flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header: Title, Description (as Link), Edit/Delete buttons */}
      <div className="mb-2 flex justify-between items-start">
        <Link to={`/boards/${board.id}`} className="flex-grow overflow-hidden mr-2 group/link">
          <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white group-hover/link:text-teal-600 dark:group-hover/link:text-teal-400 transition-colors">
            {board.title}
          </h3>
          {board.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{board.description}</p>
          )}
        </Link>
        <div className="flex-shrink-0 flex items-center space-x-2">
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(board)
              }}
              title="Edit Board"
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit2 size={16} />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(board.id)
              }}
              title="Delete Board"
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content (Task Lists Preview) - Make this part of the Link as well */}
      <Link to={`/boards/${board.id}`} className="mt-2 flex-1 overflow-y-auto pr-1 block">
        {isLoading || error ? (
          <SpecialMessage>
            <div className={`text-center font-medium text-base ${error ? "text-red-500" : "text-gray-300"}`}>
              {error ?? (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-teal-500" />
                </div>
              )}
            </div>
          </SpecialMessage>
        ) : taskLists.length === 0 ? (
          <SpecialMessage>
            <div className="text-center font-medium text-base text-gray-400">This board contains no lists</div>
          </SpecialMessage>
        ) : (
          <div className="space-y-2">
            {taskLists
              .sort((list) => -list.taskCount)
              .slice(0, 3)
              .map((list) => (
                <TaskList key={list.id} list={list} />
              ))}
            {taskLists.length > 3 && <p className="ml-2 text-sm text-gray-400">And {taskLists.length - 3} more...</p>}
          </div>
        )}
        {/* Ensure this content is styled appropriately within the Link */}
      </Link>
    </div>
  )
}

export default Board
