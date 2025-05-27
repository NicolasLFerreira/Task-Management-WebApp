"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocation } from "react-router"
import PageContainer from "../components/PageContainer"
import TaskCard from "../components/TaskItem/TaskCard"
import { TaskItemService, TaskItemSpecialisedService } from "api-client"
import type { TaskItemDto } from "api-client"

const Search = () => {
  const [tasks, setTasks] = useState<TaskItemDto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [noResultMessage, setNoResultMessage] = useState("")
  const location = useLocation()

  useEffect(() => {
    // Parse query parameter
    const queryParams = new URLSearchParams(location.search)
    const query = queryParams.get("q")

    if (query) {
      setSearchTerm(query)
      performSearch(query)
    } else {
      fetchAllTasks()
    }
  }, [location.search])

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setNoResultMessage("Please enter a search term")
      return
    }

    try {
      const response = await TaskItemSpecialisedService.getApiTasksQueryingByTitlePattern({
        path: { titlePattern: term.trim() },
      })

      setTasks(response.data ? response.data : [])

      if (response.data && response.data.length === 0) {
        setNoResultMessage("No tasks found matching your search")
      } else {
        setNoResultMessage("")
      }
    } catch (err) {
      console.error("Search error:", err)
      setNoResultMessage("An error occurred while searching. Please try again.")
    }
  }

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch(searchTerm)
    }
  }

  // Load all tasks initially
  const fetchAllTasks = async () => {
    try {
      const response = await TaskItemService.getApiTasks()

      setTasks(response.data ? response.data : [])
    } catch (err) {
      console.error("Search error:", err)
      setNoResultMessage("An error occurred while fetching tasks. Please try again.")
    }
  }

  useEffect(() => {
    fetchAllTasks()
  }, [])

  return (
    <PageContainer>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Search</h1>

        <div className="mb-6">
          <div className="relative max-w-md mx-auto md:mx-0">
            <input
              type="text"
              placeholder="Search tasks by title"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 pr-10 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  fetchAllTasks()
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {noResultMessage ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-lg">{noResultMessage}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Search
