"use client"

import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import PageContainer from "../components/PageContainer"
import StatCard from "../components/Dashboard/StatCard"
import ActivityItem from "../components/Dashboard/ActivityItem"
import UpcomingTaskItem from "../components/Dashboard/UpcomingTaskItem"
import CompletionRateChart from "../components/Dashboard/CompletionRateChart"
import TaskDistributionChart from "../components/Dashboard/TaskDistributionChart"
import { DashboardService } from "api-client"
import type { DashboardStatsDto, RecentActivityDto, UpcomingTaskDto } from "api-client"
import { CheckCircle, Clock, AlertCircle, Layers } from "lucide-react"

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null)
  const [activities, setActivities] = useState<RecentActivityDto[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch all dashboard data in parallel
        const [statsResponse, activitiesResponse, upcomingTasksResponse] = await Promise.all([
          DashboardService.getApiDashboardStats(),
          DashboardService.getApiDashboardRecentActivity(),
          DashboardService.getApiDashboardUpcomingTasks(),
        ])

        setStats(statsResponse.data || null)
        setActivities(Array.isArray(activitiesResponse.data) ? activitiesResponse.data : [])
        setUpcomingTasks(Array.isArray(upcomingTasksResponse.data) ? upcomingTasksResponse.data : [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
        // Set default values in case of error
        setActivities([])
        setUpcomingTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
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

  return (
    <>
      <Helmet>
        <title>Tickway – Dashboard</title>
        <meta name="description" content="Manage your tasks with Tickway." />
      </Helmet>

      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's an overview of your tasks.</p>
        </div>

        {/* Stats Cards */}
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

        {/* Charts and Lists */}
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
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities && activities.length > 0 ? (
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
      </PageContainer>
    </>
  )
}

export default Dashboard
