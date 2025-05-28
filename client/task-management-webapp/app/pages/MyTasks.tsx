"use client"

import { useState, useEffect } from "react"
import PageContainer from "../components/PageContainer"
import { ListService, type ListDto } from "api-client"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import TaskCreationModal from "../components/TaskItem/TaskCreationModal"
import TaskDetailModal from "../components/TaskItem/TaskDetailModal"
import TaskListViewer from "../components/TaskList/TaskListViewer"

const MyTasks = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [defaultList, setDefaultList] = useState<ListDto | null>(null)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [showTaskList, setShowTaskList] = useState(true) // Set to true to show task list by default

  useEffect(() => {
    fetchDefaultList()
  }, [])

  const fetchDefaultList = async () => {
    setIsLoadingList(true)

    try {
      // For demo purposes, we'll get the first list from the first board
      // In a real app, you might want to get a specific list or let the user choose
      const boardsResponse = await ListService.getApiListsBoardByBoardId({
        path: { boardId: 1 }, // Using board ID 1 as default
      })

      if (boardsResponse.data && boardsResponse.data.length > 0) {
        setDefaultList(boardsResponse.data[0])
      } else {
        // Create a mock list for testing if no lists are found
        setDefaultList({
          id: 1,
          title: "To Do",
          position: 0,
          taskCount: 0,
        })
      }
    } catch (err) {
      console.error("Error fetching default list:", err)
      // Create a mock list for testing if API fails
      setDefaultList({
        id: 1,
        title: "To Do",
        position: 0,
        taskCount: 0,
      })
    } finally {
      setIsLoadingList(false)
      setIsLoading(false)
    }
  }

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId)
  }

  return (
    <PageContainer>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Tasks</h1>

          <div className="flex space-x-2">
            {defaultList ? (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                disabled={isLoadingList}
              >
                {isLoadingList ? (
                  <Loader2 size={18} className="mr-1 animate-spin" />
                ) : (
                  <Plus size={18} className="mr-1" />
                )}
                New Task
              </button>
            ) : isLoadingList ? (
              <button
                disabled
                className="flex items-center px-3 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
              >
                <Loader2 size={18} className="mr-1 animate-spin" />
                Loading...
              </button>
            ) : null}

            <button
              onClick={() => setShowTaskList(!showTaskList)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {showTaskList ? "Hide Task List" : "Show Task List"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task List Section */}
        {showTaskList && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tasks in List 1</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-teal-500" />
              </div>
            ) : (
              <TaskListViewer listId={1} onTaskClick={handleTaskClick} />
            )}
          </div>
        )}
      </div>

      {showTaskModal && defaultList && (
        <TaskCreationModal
          onClose={() => setShowTaskModal(false)}
          listDto={defaultList}
          onTaskCreated={() => {
            // Force refresh of task list after creating a new task
            setShowTaskList(false)
            setTimeout(() => setShowTaskList(true), 100)
          }}
        />
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            // Force refresh of task list after updating a task
            setShowTaskList(false)
            setTimeout(() => setShowTaskList(true), 100)
          }}
          onTaskDeleted={() => {
            // Force refresh of task list after deleting a task
            setShowTaskList(false)
            setTimeout(() => setShowTaskList(true), 100)
          }}
        />
      )}
    </PageContainer>
  )
}

export default MyTasks
