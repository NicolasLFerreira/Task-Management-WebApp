"use client"

import type React from "react"
import { useState } from "react"
import { AttachmentService, type AttachmentDto } from "api-client"
import { Download, Trash2, File, FileText, FileImage, FileArchive, Loader2 } from "lucide-react"

interface AttachmentListProps {
  attachments: AttachmentDto[]
  onAttachmentDeleted: (attachmentId: number) => void
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onAttachmentDeleted }) => {
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <FileImage size={18} />
    } else if (fileType.includes("pdf")) {
      return <FileText size={18} />
    } else if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) {
      return <FileArchive size={18} />
    } else {
      return <File size={18} />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "Unknown size"

    if (bytes < 1024) {
      return bytes + " B"
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB"
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }
  }

  const handleDownload = async (attachmentId: number, fileName: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [attachmentId]: true }))
      setError(null)

      // Use fetch directly with the correct headers
      const token = localStorage.getItem("auth_token") || ""
      const response = await fetch(`http://localhost:7200/api/Attachment/download/${attachmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`)
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading file:", err)
      setError("Failed to download file")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [attachmentId]: false }))
    }
  }

  const handleDelete = async (attachmentId: number) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [attachmentId]: true }))

      await AttachmentService.deleteApiAttachmentById({
        path: { id: attachmentId },
      })

      onAttachmentDeleted(attachmentId)
    } catch (err) {
      console.error("Error deleting attachment:", err)
      setError("Failed to delete attachment")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [attachmentId]: false }))
    }
  }

  if (attachments.length === 0) {
    return <div className="text-center py-4 text-gray-500 dark:text-gray-400 italic">No attachments yet</div>
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>}

      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="text-gray-500 dark:text-gray-400">{getFileIcon(attachment.fileType || "")}</div>
            <div className="overflow-hidden">
              <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{attachment.fileName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploadUsername}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => attachment.id && handleDownload(attachment.id, attachment.fileName || "download")}
              disabled={loadingStates[attachment.id || 0]}
              className="p-1 text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 rounded"
              title="Download"
            >
              {loadingStates[attachment.id || 0] ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
            </button>

            <button
              onClick={() => attachment.id && handleDelete(attachment.id)}
              disabled={loadingStates[attachment.id || 0]}
              className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded"
              title="Delete"
            >
              {loadingStates[attachment.id || 0] ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AttachmentList
