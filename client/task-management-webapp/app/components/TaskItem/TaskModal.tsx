"use client"

import type React from "react"
import { Modal } from "../ui/Modal"
import TaskForm from "./TaskForm"
import type { TaskItemDto } from "../../../api-client/types.gen"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  listId?: number
  boardId?: number
  task?: TaskItemDto
  onSuccess?: (task: TaskItemDto) => void
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, listId, boardId, task, onSuccess }) => {
  const handleSuccess = (task: TaskItemDto) => {
    if (onSuccess) {
      onSuccess(task)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "Create Task"} size="lg">
      <TaskForm task={task} listId={listId} boardId={boardId} onCancel={onClose} onSuccess={handleSuccess} />
    </Modal>
  )
}

export default TaskModal
