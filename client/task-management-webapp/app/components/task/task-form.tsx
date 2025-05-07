"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Form, FormField, FormLabel } from "../ui/form"
import { Input } from "../ui/input"
import { Select } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { type Task, type TaskFormData, TaskPriority, TaskStatus } from "../../types"

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function TaskForm({ task, onSubmit, onCancel, isSubmitting }: TaskFormProps) {
  // Format date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    dueDate: formatDateForInput(new Date().toISOString()),
    priority: TaskPriority.Medium,
    progressStatus: TaskStatus.Todo,
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        dueDate: formatDateForInput(task.dueDate),
        priority: task.priority,
        progressStatus: task.progressStatus,
      })
    }
  }, [task])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" || name === "progressStatus" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    onSubmit(formData)
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      <FormField>
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Task title"
        />
      </FormField>

      <FormField>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description (optional)"
          rows={3}
        />
      </FormField>

      <FormField>
        <FormLabel htmlFor="dueDate">Due Date</FormLabel>
        <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
      </FormField>

      <FormField>
        <FormLabel htmlFor="priority">Priority</FormLabel>
        <Select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
          <option value={TaskPriority.Low}>Low</option>
          <option value={TaskPriority.Medium}>Medium</option>
          <option value={TaskPriority.High}>High</option>
        </Select>
      </FormField>

      <FormField>
        <FormLabel htmlFor="progressStatus">Status</FormLabel>
        <Select id="progressStatus" name="progressStatus" value={formData.progressStatus} onChange={handleChange}>
          <option value={TaskStatus.Todo}>To Do</option>
          <option value={TaskStatus.InProgress}>In Progress</option>
          <option value={TaskStatus.Completed}>Completed</option>
        </Select>
      </FormField>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </Form>
  )
}
