"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { AttachmentDto } from "api-client"
import { Upload, X, type File, Loader2 } from "lucide-react"

interface FileAttachmentUploaderProps {
  taskId: number
  onFileUploaded: (attachment: AttachmentDto) => void
}

const FileAttachmentUploader: React.FC<FileAttachmentUploaderProps> = ({ taskId, onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0])
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      // Create a FormData object for multipart/form-data upload
      const formData = new FormData()
      formData.append("file", file)

      // Use the correct API URL format for file upload
      // Make sure to use the backend URL (7200 port)
      const response = await fetch(`http://localhost:7200/api/Attachment/upload/${taskId}`, {
        method: "POST",
        body: formData,
        headers: {
          // Get the token from localStorage
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }

      const data = await response.json()
      onFileUploaded(data)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="mb-4">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-teal-500 dark:hover:border-teal-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {isUploading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 size={24} className="text-teal-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Uploading file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2">
            <Upload size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop a file here, or click to select</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <X size={16} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}

export default FileAttachmentUploader
