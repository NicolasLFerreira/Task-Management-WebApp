"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router"
import { Card } from "../ui/Card"
import { IconButton } from "../ui/IconButton"
import { MoreVertical, Edit, Trash, Users } from "lucide-react"
import { Avatar } from "../ui/Avatar"
import BoardEditModal from "./BoardEditModal"
import BoardDeleteConfirmation from "./BoardDeleteConfirmation"
import type { BoardDto } from "../../../api-client/types.gen"

interface BoardCardProps {
  board: BoardDto
}

const BoardCard = ({ board }: BoardCardProps) => {
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleCardClick = () => {
    navigate(`/boards/${board.id}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditModalOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <div className="cursor-pointer" onClick={handleCardClick}>
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{board.title}</h3>
              <div className="relative">
                <IconButton
                  icon={<MoreVertical size={16} />}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  variant="ghost"
                  size="sm"
                  ariaLabel="Board options"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleEdit}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Board
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleDelete}
                    >
                      <Trash size={16} className="mr-2" />
                      Delete Board
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2 h-10">
              {board.description || "No description"}
            </p>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <Users size={16} className="text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {board.members?.length || 0} member{(board.members?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex -space-x-2">
                {board.members?.slice(0, 3).map((member) => (
                  <Avatar
                    key={member.id}
                    name={member.userName || "User"}
                    src={member.userProfilePhotoPath || undefined}
                    size="sm"
                    className="border-2 border-white dark:border-gray-800"
                  />
                ))}
                {(board.members?.length || 0) > 3 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium border-2 border-white dark:border-gray-800">
                    +{board.members!.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {isEditModalOpen && <BoardEditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} board={board} />}
      {isDeleteModalOpen && (
        <BoardDeleteConfirmation isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} board={board} />
      )}
    </>
  )
}

export default BoardCard
