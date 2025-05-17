"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Paperclip, Upload, Download, Trash2, File, ImageIcon, FileText, Film, Music, Archive } from "lucide-react"
import { AttachmentService } from "api-client"
import type { AttachmentDto } from "api-client"
import { Button } from "../ui/Button"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { formatFileSize, formatDate } from "../../lib/utils"
import { useToast } from "../../hooks/useToast"

interface TaskAttachmentsProps {
  taskId: number
  attachments: AttachmentDto[]
  onUpdate: (attachments: AttachmentDto[]) => void
}

const TaskAttachments = ({ taskId, attachments, onUpdate }: TaskAttachmentsProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [attachmentToDelete, setAttachmentToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 20
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      // Upload the file
      const response = await AttachmentService.postApiAttachmentUploadByTaskId({
        path: { taskId },
        body: { file },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.data) {
        // Add the new attachment to the list
        onUpdate([...attachments, response.data])
        toast.success("File uploaded successfully")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file"
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteAttachment = async () => {
    if (attachmentToDelete === null) return

    setIsDeleting(true)

    try {
      await AttachmentService.deleteApiAttachmentById({
        path: { id: attachmentToDelete },
      })

      // Remove the attachment from the list
      const updatedAttachments = attachments.filter((a) => a.id !== attachmentToDelete)
      onUpdate(updatedAttachments)
      toast.success("Attachment deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete attachment"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setAttachmentToDelete(null)
    }
  }

  const handleDownload = (attachment: AttachmentDto) => {
    if (!attachment.id) return

    // Create download URL
    const downloadUrl = `${window.location.origin}/api/Attachment/download/${attachment.id}`

    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = attachment.fileName || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper to get appropriate icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
      return <ImageIcon size={24} />
    } else if (["doc", "docx", "txt", "pdf", "rtf", "md"].includes(extension || "")) {
      return <FileText size={24} />
    } else if (["mp4", "mov", "avi", "webm"].includes(extension || "")) {
      return <Film size={24} />
    } else if (["mp3", "wav", "ogg"].includes(extension || "")) {
      return <Music size={24} />
    } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
      return <Archive size={24} />
    } else {
      return <File size={24} />
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Paperclip size={18} className="mr-2" />
          Attachments ({attachments.length})
        </h3>
        <Button variant="secondary" size="sm" onClick={handleFileSelect} disabled={isUploading}>
          <Upload size={14} className="mr-1" />
          Upload File
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} disabled={isUploading} />
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Attachments list */}
      <div className="space-y-2">
        {attachments.length > 0 ? (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <div className="text-gray-500 dark:text-gray-400 mr-3">{getFileIcon(attachment.fileName || "")}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {attachment.fileName || "Unnamed file"}
                  </p>
                  <div className="flex text-xs text-gray-500 dark:text-gray-400 space-x-2">
                    <span>{formatFileSize(attachment.fileSize || 0)}</span>
                    <span>•</span>
                    <span>{formatDate(attachment.uploadTime || new Date(), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(attachment)} title="Download">
                  <Download size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachmentToDelete(attachment.id!)}
                  title="Delete"
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            No attachments yet. Upload files to share with the team!
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={attachmentToDelete !== null}
        onClose={() => setAttachmentToDelete(null)}
        onConfirm={handleDeleteAttachment}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default TaskAttachments
