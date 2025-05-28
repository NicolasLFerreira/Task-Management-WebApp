"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CommentService, type CommentDto } from "api-client"
import { Send, Edit2, Trash2, X, Check, Loader2 } from "lucide-react"

interface CommentSectionProps {
  taskId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const [comments, setComments] = useState<CommentDto[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const fetchComments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await CommentService.getApiCommentsTaskByTaskId({
        path: { taskId },
      })

      setComments(response.data || [])
    } catch (err) {
      console.error("Error fetching comments:", err)
      setError("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await CommentService.postApiComments({
        body: {
          content: newComment,
          taskItemId: taskId,
          userName: "Current User", // Add the required userName property
        },
      })

      if (response.data) {
        setComments((prev) => [...prev, response.data])
        setNewComment("")
      }
    } catch (err) {
      console.error("Error posting comment:", err)
      setError("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = (comment: CommentDto) => {
    setEditingCommentId(comment.id || null)
    setEditContent(comment.content || "")
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await CommentService.putApiCommentsByCommentId({
        path: { commentId },
        body: {
          id: commentId,
          content: editContent,
          taskItemId: taskId,
          userName: "Current User", // Add the required userName property
        },
      })

      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, content: editContent } : c)))
      setEditingCommentId(null)
    } catch (err) {
      console.error("Error updating comment:", err)
      setError("Failed to update comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await CommentService.deleteApiCommentsByCommentId({
        path: { commentId },
      })

      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error("Error deleting comment:", err)
      setError("Failed to delete comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString?: Date) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Comments</h3>

      {error && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={24} className="animate-spin text-teal-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 italic">No comments yet</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-800 dark:text-white">{comment.userName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.creationDate)}</div>
                  </div>

                  {editingCommentId !== comment.id && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="p-1 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => comment.id && handleDeleteComment(comment.id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                        disabled={isSubmitting}
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => comment.id && handleSaveEdit(comment.id)}
                        className="p-1 text-teal-600 hover:text-teal-700 dark:text-teal-500 dark:hover:text-teal-400 rounded"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</div>
                )}
              </div>
            ))
          )}

          <form onSubmit={handleSubmitComment} className="mt-4">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default CommentSection
