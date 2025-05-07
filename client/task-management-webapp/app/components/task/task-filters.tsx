"use client"

import { Search } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select } from "../ui/select"
import { TaskPriority, TaskStatus } from "../../types"

interface TaskFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  priorityFilter: string
  setPriorityFilter: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  resetFilters: () => void
}

export function TaskFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  resetFilters,
}: TaskFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value={TaskStatus.Todo.toString()}>To Do</option>
            <option value={TaskStatus.InProgress.toString()}>In Progress</option>
            <option value={TaskStatus.Completed.toString()}>Completed</option>
          </Select>
        </div>

        <div>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value={TaskPriority.Low.toString()}>Low</option>
            <option value={TaskPriority.Medium.toString()}>Medium</option>
            <option value={TaskPriority.High.toString()}>High</option>
          </Select>
        </div>

        <div>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="creationTime">Sort by Creation Date</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
