"use client"

import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import PageContainer from "../components/PageContainer"
import StatCard from "../components/Dashboard/StatCard"
import ActivityItem from "../components/Dashboard/ActivityItem"
import UpcomingTaskItem from "../components/Dashboard/UpcomingTaskItem"
import CompletionRateChart from "../components/Dashboard/CompletionRateChart"
import TaskDistributionChart from "../components/Dashboard/TaskDistributionChart"

import { DashboardService, UserProfileService, BoardService, ListService, TaskItemService } from "../../api-client"
import type {
  DashboardStatsDto,
  RecentActivityDto,
  UpcomingTaskDto,
  UserDtoReadable,
  BoardDto,
  TaskItemDto,
} from "../../api-client"
import { TaskItemStatus, TaskItemPriority } from "../../api-client"

import { CheckCircle, Clock, AlertCircle, Layers, LayoutDashboard, Filter } from "lucide-react"

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null)
  const [activities, setActivities] = useState<RecentActivityDto[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskDto[]>([])
  const [userData, setUserData] = useState<UserDtoReadable | null>(null)
  const [boards, setBoards] = useState<BoardDto[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<number | "all">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data: user profile and boards
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [userProfileResponse, boardsResponse] = await Promise.all([
          UserProfileService.getApiUserProfile(),
          BoardService.getApiBoards(),
        ])
        setUserData(userProfileResponse.data || null)
        setBoards(boardsResponse.data || [])
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError("Failed to load initial user data or boards. Please try again later.")
      } finally {
        // Loading state will be handled by the main data fetching useEffect
      }
    }
    fetchInitialData()
  }, [])

  // Fetch dashboard data based on selected board
  useEffect(() => {
    const fetchDataForBoard = async () => {
      setIsLoading(true)
      setError(null)
      setStats(null)
      setActivities([])
      setUpcomingTasks([])

      try {
        if (selectedBoardId === "all") {
          // Fetch data for all boards (original logic)
          const [statsResponse, activitiesResponse, upcomingTasksResponse] = await Promise.all([
            DashboardService.getApiDashboardStats(),
            DashboardService.getApiDashboardRecentActivity(),
            DashboardService.getApiDashboardUpcomingTasks(),
          ])
          setStats(statsResponse.data || null)
          setActivities(activitiesResponse.data || [])
          setUpcomingTasks(upcomingTasksResponse.data || [])
        } else {
          // Fetch data for a specific board and calculate client-side
          const boardListsResponse = await ListService.getApiListsBoardByBoardId({
            path: { boardId: selectedBoardId as number },
          })
          const boardLists = boardListsResponse.data || []

          let allBoardTasks: TaskItemDto[] = []
          if (boardLists.length > 0) {
            const taskPromises = boardLists.map((list) =>
              TaskItemService.getApiTasksListByListId({
                path: { listId: list.id },
              }),
            )
            const taskResponses = await Promise.all(taskPromises)
            allBoardTasks = taskResponses.flatMap((response) => response.data || [])
          }

          // Calculate stats
          const totalTasks = allBoardTasks.length
          const completedTasks = allBoardTasks.filter((task) => task.progressStatus === TaskItemStatus._2).length
          const inProgressTasks = allBoardTasks.filter((task) => task.progressStatus === TaskItemStatus._1).length
          const todoTasks = allBoardTasks.filter((task) => task.progressStatus === TaskItemStatus._0).length
          const overdueTasks = allBoardTasks.filter(
            (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.progressStatus !== TaskItemStatus._2,
          ).length
          const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

          const now = new Date()
          const sevenDaysFromNow = new Date()
          sevenDaysFromNow.setDate(now.getDate() + 7)

          const dueSoonTasks = allBoardTasks.filter(
            (task) =>
              task.dueDate &&
              new Date(task.dueDate) >= now &&
              new Date(task.dueDate) <= sevenDaysFromNow &&
              task.progressStatus !== TaskItemStatus._2,
          ).length

          const highPriorityTasks = allBoardTasks.filter(
            (task) =>
              (task.priority === TaskItemPriority._2 || task.priority === TaskItemPriority._3) &&
              task.progressStatus !== TaskItemStatus._2,
          ).length

          const calculatedStats: DashboardStatsDto = {
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            overdueTasks,
            completionRate,
            dueSoonTasks,
            highPriorityTasks,
            totalBoards: 1, // Since we are viewing a single board's stats
          }
          setStats(calculatedStats)

          // Calculate upcoming tasks for the board
          const calculatedUpcomingTasks: UpcomingTaskDto[] = allBoardTasks
            .filter(
              (task) =>
                task.dueDate &&
                new Date(task.dueDate) >= new Date() &&
                new Date(task.dueDate) <= sevenDaysFromNow &&
                task.progressStatus !== TaskItemStatus._2,
            )
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5) // Limit to 5 upcoming tasks for display
            .map((task) => ({
              id: task.id,
              title: task.title,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              priority: task.priority !== undefined ? TaskItemPriority[task.priority] : "N/A",
              status: task.progressStatus !== undefined ? TaskItemStatus[task.progressStatus] : "N/A",
            }))
          setUpcomingTasks(calculatedUpcomingTasks)

          // Calculate recent activity for the board (simplified: recently created tasks)
          const calculatedActivities: RecentActivityDto[] = allBoardTasks
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
            .slice(0, 5) // Limit to 5 recent activities
            .map((task) => ({
              id: task.id,
              type: "Task Created",
              title: task.title,
              date: task.createdAt ? new Date(task.createdAt) : undefined,
              status: task.progressStatus !== undefined ? TaskItemStatus[task.progressStatus] : "N/A",
            }))
          setActivities(calculatedActivities)
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
        // Clear data on error
        setStats(null)
        setActivities([])
        setUpcomingTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch dashboard data if initial user data and boards have been loaded or attempted
    if (userData !== null || boards.length > 0 || error) {
      // ensures initial setup is done or failed
      fetchDataForBoard()
    }
  }, [selectedBoardId, userData, boards]) // Rerun when selectedBoardId changes, or when initial data (userData/boards) becomes available.

  if (isLoading && !stats) {
    // Show main loader only if no stats are present yet
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageContainer>
    )
  }

  if (error && !stats) {
    // Show main error only if no stats could be loaded at all
    return (
      <PageContainer>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  const selectedBoardName =
    selectedBoardId === "all" ? "All Boards" : boards.find((b) => b.id === selectedBoardId)?.title || "Selected Board"

  return (
    <>
      <Helmet>
        <title>Tickway – Dashboard {selectedBoardId !== "all" ? `(${selectedBoardName})` : ""}</title>
        <meta name="description" content="Manage your tasks with Tickway." />
      </Helmet>

      <PageContainer>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Dashboard {selectedBoardId !== "all" ? `- ${selectedBoardName}` : ""}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back,{" "}
              <span className="font-medium text-gray-800 dark:text-white">{userData?.username || "User"}</span>! Here's
              an overview of your tasks for {selectedBoardId !== "all" ? `for ${selectedBoardName}` : ""}.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <label htmlFor="board-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter:
              </label>
              <select
                id="board-select"
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full sm:w-auto p-2.5"
              >
                <option value="all">All Boards</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && <div className="my-4 text-center text-gray-500 dark:text-gray-400">Loading board data...</div>}
        {error && (
          <div className="my-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Tasks"
              value={stats?.totalTasks || 0}
              icon={<Layers className="h-6 w-6 text-teal-600" />}
              color="border-teal-500"
            />
            <StatCard
              title="Completed Tasks"
              value={stats?.completedTasks || 0}
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              color="border-green-500"
              subtitle={`${stats?.completionRate ? (stats.completionRate * 100).toFixed(0) : 0}% completion rate`}
            />
            <StatCard
              title="In Progress"
              value={stats?.inProgressTasks || 0}
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              color="border-blue-500"
            />
            <StatCard
              title="Overdue Tasks"
              value={stats?.overdueTasks || 0}
              icon={<AlertCircle className="h-6 w-6 text-red-600" />}
              color="border-red-500"
            />
          </div>
        )}

        {/* Charts and Lists */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Distribution Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Task Distribution</h2>
              <TaskDistributionChart
                todoTasks={stats?.todoTasks || 0}
                inProgressTasks={stats?.inProgressTasks || 0}
                completedTasks={stats?.completedTasks || 0}
                overdueTasks={stats?.overdueTasks || 0}
              />
            </div>

            {/* Completion Rate Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Completion Rate</h2>
              <CompletionRateChart completedTasks={stats?.completedTasks || 0} totalTasks={stats?.totalTasks || 0} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Recent Activity {selectedBoardId !== "all" ? "(Recently Created Tasks)" : ""}
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.length > 0 ? (
                  activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No recent activity</p>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Tasks</h2>
              <div>
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => <UpcomingTaskItem key={task.id} task={task} />)
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No upcoming tasks</p>
                )}
              </div>
            </div>
          </div>
        )}
        {!stats && !isLoading && !error && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <LayoutDashboard className="mx-auto h-12 w-12 mb-4" />
            <p>No data to display for the selected filter.</p>
          </div>
        )}
      </PageContainer>
    </>
  )
}

export default Dashboard
