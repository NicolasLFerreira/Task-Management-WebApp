"use client"

import { useState, useEffect } from "react"
import { useBoard } from "../../hooks/useBoard"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { IconButton } from "../ui/IconButton"
import { Avatar } from "../ui/Avatar"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ErrorDisplay } from "../ui/ErrorDisplay"
import { EmptyState } from "../ui/EmptyState"
import { Search, UserPlus, X } from "lucide-react"
import { useApiErrorHandler } from "../../hooks/useApiErrorHandler"
import { ApiService } from "../../services/api-service"
import type { BoardDto, BoardMemberDto, UserDtoReadable } from "../../../api-client/types.gen"

interface BoardMembersProps {
  isOpen: boolean
  onClose: () => void
  board: BoardDto
}

const BoardMembers = ({ isOpen, onClose, board }: BoardMembersProps) => {
  const { fetchBoardById } = useBoard()
  const { handleError } = useApiErrorHandler()

  const [members, setMembers] = useState<BoardMemberDto[]>(board.members || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserDtoReadable[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isRemovingMember, setIsRemovingMember] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMembers(board.members || [])
  }, [board.members])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const users = await ApiService.searchUsers(searchQuery)
      // Filter out users who are already members
      const filteredUsers = users.filter((user) => !members.some((member) => member.userId === user.id))
      setSearchResults(filteredUsers)
    } catch (err) {
      const errorInfo = handleError(err)
      setError(errorInfo.message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = async (user: UserDtoReadable) => {
    if (!board.id || !user.id) return

    setIsAddingMember(true)
    setError(null)

    try {
      // This method needs to be added to ApiService
      await ApiService.addBoardMember(board.id, user.id)
      // Refresh board data to get updated members list
      await fetchBoardById(board.id)
      // Clear search results
      setSearchResults([])
      setSearchQuery("")
    } catch (err) {
      const errorInfo = handleError(err)
      setError(errorInfo.message)
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!board.id) return

    setIsRemovingMember(true)
    setError(null)

    try {
      // This method needs to be added to ApiService
      await ApiService.removeBoardMember(board.id, memberId)
      // Update local state
      setMembers(members.filter((member) => member.id !== memberId))
      // Refresh board data
      await fetchBoardById(board.id)
    } catch (err) {
      const errorInfo = handleError(err)
      setError(errorInfo.message)
    } finally {
      setIsRemovingMember(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Board Members">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email"
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? <LoadingSpinner size="sm" /> : "Search"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Search Results</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-md p-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar name={user.username || "User"} src={user.profilePhotoPath || undefined} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(user)}
                    disabled={isAddingMember}
                    className="flex items-center space-x-1"
                  >
                    {isAddingMember ? <LoadingSpinner size="sm" /> : <UserPlus size={14} />}
                    <span>Add</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Members</h3>
          {members.length === 0 ? (
            <EmptyState title="No members" description="This board doesn't have any members yet." className="py-6" />
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar name={member.userName || "User"} src={member.userProfilePhotoPath || undefined} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {member.userName}
                        {member.role === 0 && ( // Assuming 0 is the owner role
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            Owner
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.userEmail}</p>
                    </div>
                  </div>
                  {member.role !== 0 && ( // Not owner
                    <IconButton
                      icon={<X size={16} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id!)}
                      disabled={isRemovingMember}
                      ariaLabel="Remove member"
                      className="text-red-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <ErrorDisplay message={error} />}

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default BoardMembers
