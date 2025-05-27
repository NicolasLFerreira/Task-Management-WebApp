"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TaskDistributionChartProps {
  todoTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
}

const TaskDistributionChart = ({
  todoTasks,
  inProgressTasks,
  completedTasks,
  overdueTasks,
}: TaskDistributionChartProps) => {
  const data = [
    {
      name: "To Do",
      tasks: todoTasks,
      fill: "#94a3b8",
    },
    {
      name: "In Progress",
      tasks: inProgressTasks,
      fill: "#3b82f6",
    },
    {
      name: "Completed",
      tasks: completedTasks,
      fill: "#10b981",
    },
    {
      name: "Overdue",
      tasks: overdueTasks,
      fill: "#ef4444",
    },
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} tasks`, ""]} labelFormatter={(label) => `Status: ${label}`} />
          <Bar dataKey="tasks" name="Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TaskDistributionChart
