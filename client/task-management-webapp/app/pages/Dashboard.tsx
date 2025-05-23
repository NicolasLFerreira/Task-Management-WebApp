"use client"

import { useEffect, useState } from "react"
import PageContainer from "../components/PageContainer"
import StatCard from "../components/Dashboard/StatCard"
import ActivityItem from "../components/Dashboard/ActivityItem"
import UpcomingTaskItem from "../components/Dashboard/UpcomingTaskItem"
import CompletionRateChart from "../components/Dashboard/CompletionRateChart"
import TaskDistributionChart from "../components/Dashboard/TaskDistributionChart"
import { DashboardService } from "api-client"
import type { DashboardStatsDto, RecentActivityDto, UpcomingTaskDto } from "api-client"
import { CheckCircle, Clock, AlertCircle, Layers } from "lucide-react"
import NewTaskModal from "../components/TaskItem/NewTaskModal";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null)
  const [activities, setActivities] = useState<RecentActivityDto[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [statsResponse, activitiesResponse, upcomingTasksResponse] = await Promise.all([
          DashboardService.getApiDashboardStats(),
          DashboardService.getApiDashboardRecentActivity(),
          DashboardService.getApiDashboardUpcomingTasks(),
        ])

        setStats(statsResponse.data || null)
        setActivities(activitiesResponse.data || [])
        setUpcomingTasks(upcomingTasksResponse.data || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
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
    <PageContainer>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's an overview of your tasks.</p>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            + New Task
          </button>
        </div>
      </div>

      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onTaskCreated={(newTask) => {
            setShowModal(false);
            console.log("Task created:", newTask);
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Task Distribution</h2>
            <TaskDistributionChart />
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Completion Rate</h2>
            <CompletionRateChart />
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No recent activity.</p>
            ) : (
              activities.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Upcoming Tasks</h2>
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No upcoming tasks.</p>
            ) : (
              upcomingTasks.map((task, idx) => (
                <UpcomingTaskItem key={idx} task={task} />
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Dashboard
