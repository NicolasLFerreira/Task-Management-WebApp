"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, X, FileText } from "lucide-react"
import { cn } from "../../lib/utils"

interface FileInputProps {
  onChange: (file: File | null) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  className?: string
  value?: File | null
}

export function FileInput({
  onChange,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  value,
}: FileInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setSelectedFile(null)
      onChange(null)
      return
    }

    const file = files[0]

    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${formatFileSize(maxSize)}`)
      return
    }

    setError(null)
    setSelectedFile(file)
    onChange(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${formatFileSize(maxSize)}`)
      return
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(",").map((type) => type.trim())
      const fileType = file.type
      const fileExtension = `.${file.name.split(".").pop()}`

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension.toLowerCase() === type.toLowerCase()
        }
        if (type.includes("*")) {
          const typePrefix = type.split("*")[0]
          return fileType.startsWith(typePrefix)
        }
        return fileType === type
      })

      if (!isAccepted) {
        setError("File type not accepted")
        return
      }
    }

    setError(null)
    setSelectedFile(file)
    onChange(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6",
            "hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50",
            error && "border-red-300 dark:border-red-700",
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
          <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Drag and drop your file here or</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Browse files
          </button>
          {accept && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Accepted file types: {accept}</p>}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Max file size: {formatFileSize(maxSize)}</p>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
      />
    </div>
  )
}
