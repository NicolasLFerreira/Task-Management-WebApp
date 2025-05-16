"use client"
import { Modal } from "./Modal"
import { Button } from "./Button"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "info"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "danger"
      case "warning":
        return "secondary"
      case "info":
        return "primary"
      default:
        return "primary"
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-6 text-gray-700 dark:text-gray-300">{message}</div>
      <div className="flex justify-end space-x-3">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={getButtonVariant()} onClick={handleConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
