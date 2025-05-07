"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppLayout } from "../components/layout/app-layout"
import { TaskForm } from "../components/task/task-form"
import type { Task, TaskFormData } from "../types"
import { taskApi } from "../services/api"

export default function EditTask() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return

      try {
        const data = await taskApi.getTask(id)
        setTask(data)
      } catch (err) {
        setError("Failed to load task. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [id])

  const handleSubmit = async (formData: TaskFormData) => {
    if (!id) return

    setIsSubmitting(true)
    try {
      await taskApi.updateTask(id, formData)
      navigate("/tasks")
    } catch (err) {
      console.error("Failed to update task:", err)
      alert("Failed to update task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/tasks")
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading task...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !task) {
    return (
      <AppLayout>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error || "Task not found"}</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Task</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <TaskForm task={task} onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
        </div>
      </div>
    </AppLayout>
  )
}
