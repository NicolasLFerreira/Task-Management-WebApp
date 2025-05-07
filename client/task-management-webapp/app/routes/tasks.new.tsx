"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/app-layout"
import { TaskForm } from "../components/task/task-form"
import type { TaskFormData } from "../types"
import { taskApi } from "../services/api"

export default function NewTask() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: TaskFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Creating new task with data:", formData)
      await taskApi.createTask(formData)
      navigate("/tasks")
    } catch (err) {
      console.error("Failed to create task:", err)
      setError(err instanceof Error ? err.message : "Failed to create task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/tasks")
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Task</h1>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <TaskForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
        </div>
      </div>
    </AppLayout>
  )
}
