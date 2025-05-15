"use client"

import type React from "react"
import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"
import TaskCard from "../components/TaskItem/TaskCard"
import NewTaskModal from "../components/TaskItem/NewTaskModal"
import { TaskItemService, TaskItemSpecialisedService } from "api-client"
import type { TaskItemDto } from "api-client"

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState<TaskItemDto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [noResultMessage, setNoResultMessage] = useState("")

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = searchTerm.trim()

      if (!term) {
        setNoResultMessage("")
        setSearchTerm("")
        fetchTasks() // <- Reload all tasks
        return
      }

      try {
        const response = await TaskItemSpecialisedService.getApiTasksQueryingByTitlePattern({
          path: { titlePattern: term },
        })
        const result = response.data ?? []

        if (result.length === 0) {
          setNoResultMessage(`No tasks with title "${term}"`)
        } else {
          setNoResultMessage("")
        }

        setTasks(result)
      } catch (err) {
        console.error("Search error:", err)
      }
    }
  }

  const fetchTasks = () => {
    TaskItemService.getApiTasks()
      .then((response) => {
        setTasks(response.data ?? [])
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err)
        setNoResultMessage("Could not load tasks. Please try again later.")
      })
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <PageContainer>
      <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Tasks</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title"
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 pr-10 text-gray-900 dark:text-white dark:bg-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchTerm("")
                  setNoResultMessage("")
                  fetchTasks()
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                &times;
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
        >
          New Task
        </button>
      </section>

      {noResultMessage ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-lg col-span-full">{noResultMessage}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [...prev, newTask])
            setShowModal(false)
          }}
        />
      )}
    </PageContainer>
  )
}

export default Dashboard
