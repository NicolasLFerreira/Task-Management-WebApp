"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, Send, Edit2, Trash2, MoreVertical } from "lucide-react"
import { CommentService } from "api-client"
import type { CommentDto } from "api-client"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Dropdown } from "../ui/Dropdown"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { formatDate } from "../../lib/utils"
import { useToast } from "../../hooks/useToast"
import { useAuth } from "../../hooks/useAuth"

interface TaskCommentsProps {
  taskId: number
  comments: CommentDto[]
  onUpdate: (comments: CommentDto[]) => void
}

const TaskComments = ({ taskId, comments, onUpdate }: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<CommentDto | null>(null)
  const [editText, setEditText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
  const toast = useToast()
  const { user } = useAuth()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const commentData: CommentDto = {
        content: newComment,
        taskItemId: taskId,
        userId: user?.id,
        userName: user?.fullName || user?.username || "Anonymous",
        creationDate: new Date(),
        userProfilePhotoPath: user?.profilePhotoPath || null,
      }

      const response = await CommentService.postApiComments({
        body: commentData,
      })

      if (response.data) {
        // Add the new comment to the list
        onUpdate([response.data, ...comments])
        setNewComment("")
        toast.success("Comment added successfully")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add comment"
      toast.error(errorMessage)
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = (comment: CommentDto) => {
    setEditingComment(comment)
    setEditText(comment.content || "")
  }

  const handleSaveEdit = async () => {
    if (!editingComment || !editText.trim()) return

    setIsSubmitting(true)

    try {
      const updatedComment: CommentDto = {
        ...editingComment,
        content: editText,
      }

      await CommentService.putApiCommentsByCommentId({
        path: { commentId: editingComment.id! },
        body: updatedComment,
      })

      // Update the comment in the list
      const updatedComments = comments.map((c) => (c.id === editingComment.id ? { ...c, content: editText } : c))

      onUpdate(updatedComments)
      setEditingComment(null)
      toast.success("Comment updated successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update comment"
      toast.error(errorMessage)
      console.error("Error updating comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async () => {
    if (commentToDelete === null) return

    setIsSubmitting(true)

    try {
      await CommentService.deleteApiCommentsByCommentId({
        path: { commentId: commentToDelete },
      })

      // Remove the comment from the list
      const updatedComments = comments.filter((c) => c.id !== commentToDelete)
      onUpdate(updatedComments)
      toast.success("Comment deleted successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete comment"
      toast.error(errorMessage)
      console.error("Error deleting comment:", error)
    } finally {
      setIsSubmitting(false)
      setCommentToDelete(null)
    }
  }

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = a.creationDate ? new Date(a.creationDate).getTime() : 0
    const dateB = b.creationDate ? new Date(b.creationDate).getTime() : 0
    return dateB - dateA // Sort by newest first
  })

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <MessageSquare size={18} className="mr-2" />
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start space-x-3">
          <Avatar name={user?.fullName || "You"} size="sm" />
          <div className="flex-1 relative">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              rows={2}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-2 bottom-2"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar name={comment.userName || "User"} size="sm" />
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {comment.userName || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {comment.creationDate
                          ? formatDate(comment.creationDate, "MMM d, yyyy 'at' h:mm a")
                          : "Unknown date"}
                      </p>
                    </div>

                    {/* Only show edit/delete options for the comment author */}
                    {user?.id === comment.userId && (
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
                            onClick: () => handleEditComment(comment),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 size={16} />,
                            onClick: () => setCommentToDelete(comment.id!),
                            className: "text-red-500",
                          },
                        ]}
                      />
                    )}
                  </div>

                  {editingComment?.id === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        rows={2}
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingComment(null)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} disabled={!editText.trim() || isSubmitting}>
                          {isSubmitting ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={commentToDelete !== null}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  )
}

export default TaskComments
