"use client"

import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  color: string
  subtitle?: string
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace("border", "bg").replace("-l-4", "/10")}`}>{icon}</div>
      </div>
    </div>
  )
}

export default StatCard
