"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import PageContainer from "../components/PageContainer"
import TaskCard from "../components/TaskItem/TaskCard"
import TaskDetailModal from "../components/TaskItem/TaskDetailModal"
import { TaskItemService, TaskItemSpecialisedService, BoardService, ListService, UserService } from "api-client"
import type { TaskItemDto, BoardDto, ListDto, UserDtoReadable } from "api-client"
import { SearchIcon, Users, Layout, CheckSquare, Folder, Eye } from "lucide-react"

type SearchTab = "tasks" | "boards" | "lists" | "users"

interface SearchResults {
  tasks: TaskItemDto[]
  boards: BoardDto[]
  lists: ListDto[]
  users: UserDtoReadable[]
}

const Search = () => {
  const [activeTab, setActiveTab] = useState<SearchTab>("tasks")
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    boards: [],
    lists: [],
    users: [],
  })
  const [loading, setLoading] = useState(false)
  const [noResultMessage, setNoResultMessage] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search)
    const query = queryParams.get("q")
    const tab = queryParams.get("tab") as SearchTab

    if (query) {
      setSearchTerm(query)
      if (tab && ["tasks", "boards", "lists", "users"].includes(tab)) {
        setActiveTab(tab)
      }
      performSearch(query, tab || "tasks")
    } else {
      fetchAllData()
    }
  }, [location.search])

  const fetchAllLists = async (): Promise<ListDto[]> => {
    try {
      // First get all boards
      const boardsResponse = await BoardService.getApiBoards()
      const boards = boardsResponse.data || []

      // Then fetch lists for each board
      const allLists: ListDto[] = []
      for (const board of boards) {
        try {
          const listsResponse = await ListService.getApiListsBoardByBoardId({
            path: { boardId: board.id },
          })
          if (listsResponse.data) {
            allLists.push(...listsResponse.data)
          }
        } catch (err) {
          console.warn(`Failed to fetch lists for board ${board.id}:`, err)
        }
      }

      return allLists
    } catch (err) {
      console.error("Error fetching lists:", err)
      return []
    }
  }

  const performSearch = async (term: string, searchTab: SearchTab = activeTab) => {
    if (!term.trim()) {
      fetchAllData()
      return
    }

    setLoading(true)
    setNoResultMessage("")

    try {
      if (searchTab === "tasks") {
        const response = await TaskItemSpecialisedService.getApiTasksQueryingByTitlePattern({
          path: { titlePattern: term.trim() },
        })

        const taskResults = response.data || []
        setResults((prev) => ({ ...prev, tasks: taskResults }))

        if (taskResults.length === 0) {
          setNoResultMessage("No tasks found matching your search")
        }
      } else if (searchTab === "boards") {
        const response = await BoardService.getApiBoards()
        const allBoards = response.data || []
        const filteredBoards = allBoards.filter(
          (board: BoardDto) =>
            board.title?.toLowerCase().includes(term.toLowerCase()) ||
            board.description?.toLowerCase().includes(term.toLowerCase()),
        )
        setResults((prev) => ({ ...prev, boards: filteredBoards }))

        if (filteredBoards.length === 0) {
          setNoResultMessage("No boards found matching your search")
        }
      } else if (searchTab === "lists") {
        const allLists = await fetchAllLists()
        const filteredLists = allLists.filter((list: ListDto) => list.title?.toLowerCase().includes(term.toLowerCase()))
        setResults((prev) => ({ ...prev, lists: filteredLists }))

        if (filteredLists.length === 0) {
          setNoResultMessage("No lists found matching your search")
        }
      } else if (searchTab === "users") {
        const response = await UserService.getApiUsersSearch({
          query: { query: term.trim() },
        })
        const userResults = response.data || []
        setResults((prev) => ({ ...prev, users: userResults }))

        if (userResults.length === 0) {
          setNoResultMessage("No users found matching your search")
        }
      }
    } catch (err) {
      console.error("Search error:", err)
      setNoResultMessage("An error occurred while searching. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = searchTerm.trim()
      if (term) {
        // Update URL with search parameters
        navigate(`/search?q=${encodeURIComponent(term)}&tab=${activeTab}`)
      } else {
        fetchAllData()
      }
    }
  }

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab)
    const term = searchTerm.trim()
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}&tab=${tab}`)
    } else {
      fetchAllData()
    }
  }

  // Load all data initially
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [tasksResponse, boardsResponse, usersResponse] = await Promise.all([
        TaskItemService.getApiTasks(),
        BoardService.getApiBoards(),
        UserService.getApiUsersSearch({ query: { query: "" } }),
      ])

      const allLists = await fetchAllLists()

      setResults({
        tasks: tasksResponse.data || [],
        boards: boardsResponse.data || [],
        lists: allLists,
        users: usersResponse.data || [],
      })
      setNoResultMessage("")
    } catch (err) {
      console.error("Error fetching data:", err)
      setNoResultMessage("An error occurred while fetching data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setNoResultMessage("")
    navigate("/search")
    fetchAllData()
  }

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId)
    setShowTaskDetail(true)
  }

  const handleTaskDeleted = () => {
    if (selectedTaskId) {
      setResults((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== selectedTaskId),
      }))
    }
    setShowTaskDetail(false)
    setSelectedTaskId(null)
  }

  const tabs = [
    { id: "tasks" as SearchTab, label: "Tasks", icon: CheckSquare, count: results.tasks.length },
    { id: "boards" as SearchTab, label: "Boards", icon: Layout, count: results.boards.length },
    { id: "lists" as SearchTab, label: "Lists", icon: Folder, count: results.lists.length },
    { id: "users" as SearchTab, label: "Users", icon: Users, count: results.users.length },
  ]

  const renderTaskResults = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.tasks.map((task) => (
        <div key={task.id} className="relative group">
          <div onClick={() => handleTaskClick(task.id!)}>
            <TaskCard task={task} onViewClick={() => handleTaskClick(task.id!)} />
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleTaskClick(task.id!)
              }}
              className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="View Details"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const renderBoardResults = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.boards.map((board) => (
        <div
          key={board.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/boards?boardId=${board.id}`)}
        >
          <div className="flex items-center mb-2">
            <Layout size={20} className="text-teal-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{board.title}</h3>
          </div>
          {board.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{board.description}</p>}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Created: {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderListResults = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.lists.map((list) => (
        <div
          key={list.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/boards?listId=${list.id}`)}
        >
          <div className="flex items-center mb-2">
            <Folder size={20} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{list.title}</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Position: {list.position}</span>
            <span>Tasks: {list.taskCount || 0}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderUserResults = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.users.map((user) => (
        <div
          key={user.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/team?userId=${user.id}`)}
        >
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold mr-3">
              {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{user.fullName || user.username}</h3>
              {user.email && <p className="text-gray-600 dark:text-gray-300 text-sm">{user.email}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )
    }

    if (noResultMessage) {
      return <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-lg">{noResultMessage}</div>
    }

    switch (activeTab) {
      case "tasks":
        return renderTaskResults()
      case "boards":
        return renderBoardResults()
      case "lists":
        return renderListResults()
      case "users":
        return renderUserResults()
      default:
        return null
    }
  }

  return (
    <PageContainer>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Search</h1>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto md:mx-0">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 pl-10 pr-10 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-teal-500 text-teal-600 dark:text-teal-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Results */}
        {renderResults()}
      </div>

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => {
            setShowTaskDetail(false)
            setSelectedTaskId(null)
          }}
          onTaskUpdated={() => {
            // Refresh the search results
            if (searchTerm.trim()) {
              performSearch(searchTerm, activeTab)
            } else {
              fetchAllData()
            }
          }}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </PageContainer>
  )
}

export default Search
