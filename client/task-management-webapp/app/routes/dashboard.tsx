"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Clock, ListTodo, Plus } from "lucide-react"
import { AppLayout } from "../components/layout/app-layout"
import { Button } from "../components/ui/button"
import { type Task, TaskStatus } from "../types"
import { taskApi } from "../services/api"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskApi.getAllTasks()
        setTasks(data)
      } catch (err) {
        setError("Failed to load tasks. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const todoTasks = tasks.filter((task) => task.progressStatus === TaskStatus.Todo)
  const inProgressTasks = tasks.filter((task) => task.progressStatus === TaskStatus.InProgress)
  const completedTasks = tasks.filter((task) => task.progressStatus === TaskStatus.Completed)

  const getUpcomingTasks = () => {
    const now = new Date()
    return tasks
      .filter((task) => task.progressStatus !== TaskStatus.Completed && new Date(task.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }

  const upcomingTasks = getUpcomingTasks()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Welcome to your task management dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Summary</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ListTodo className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">To Do</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{todoTasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">In Progress</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{inProgressTasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Completed</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{completedTasks.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
            <Link to="/tasks/new">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Task
              </Button>
            </Link>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="block">
                  <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.progressStatus === TaskStatus.Todo
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {task.progressStatus === TaskStatus.Todo ? "To Do" : "In Progress"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No upcoming tasks</p>
              <Link to="/tasks/new" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create your first task
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
