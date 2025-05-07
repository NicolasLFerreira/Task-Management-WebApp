"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { AppLayout } from "../components/layout/app-layout"
import { TaskCard } from "../components/task/task-card"
import { TaskFilters } from "../components/task/task-filters"
import { Button } from "../components/ui/button"
import type { Task, TaskStatus } from "../types"
import { taskApi } from "../services/api"

export default function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [sortBy, setSortBy] = useState("dueDate")

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskApi.getAllTasks()
        setTasks(data)
        setFilteredTasks(data)
      } catch (err) {
        setError("Failed to load tasks. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Apply filters and sorting whenever filter criteria change
  useEffect(() => {
    let result = [...tasks]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term)),
      )
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((task) => task.progressStatus.toString() === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter) {
      result = result.filter((task) => task.priority.toString() === priorityFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority":
          return b.priority - a.priority
        case "title":
          return a.title.localeCompare(b.title)
        case "creationTime":
          return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
        default:
          return 0
      }
    })

    setFilteredTasks(result)
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy])

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setPriorityFilter("")
    setSortBy("dueDate")
  }

  const handleEditTask = (task: Task) => {
    navigate(`/tasks/${task.id}/edit`)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskApi.deleteTask(taskId)
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      } catch (err) {
        console.error("Failed to delete task:", err)
        alert("Failed to delete task. Please try again.")
      }
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await taskApi.updateTask(taskId, { progressStatus: status })
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, progressStatus: status } : task)),
      )
    } catch (err) {
      console.error("Failed to update task status:", err)
      alert("Failed to update task status. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <Link to="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </Link>
      </div>

      <TaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        resetFilters={resetFilters}
      />

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {tasks.length === 0 ? "Create your first task to get started" : "Try adjusting your filters"}
          </p>
          <Link to="/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Task
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
