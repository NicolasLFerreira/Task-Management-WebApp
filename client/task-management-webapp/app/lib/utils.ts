import { format, parseISO, isValid } from "date-fns"

/**
 * Formats a date consistently throughout the application
 * @param date Date to format (Date object or ISO string)
 * @param formatString Optional format string (defaults to 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, formatString = "MMM d, yyyy"): string {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (!isValid(dateObj)) return "Invalid date"
    return format(dateObj, formatString)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

/**
 * Formats file size from bytes to human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Generates a consistent color based on a name string
 * @param name Name to generate color from
 * @returns Hex color code
 */
export function generateAvatarColor(name: string): string {
  if (!name) return "#6366F1" // Default color if no name provided

  // Generate a hash from the name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Convert hash to a vibrant hex color
  const hue = Math.abs(hash % 360)
  const saturation = 65 + (hash % 20) // 65-85%
  const lightness = 45 + (hash % 10) // 45-55%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Extracts initials from a name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return "?"

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Sorts an array of items by their position property
 * @param items Array of items with position property
 * @returns Sorted array
 */
export function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position)
}

/**
 * Enum for task priority levels
 * This should match the backend enum
 */
export enum TaskItemPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

/**
 * Gets color for a task priority level
 * @param priority Task priority level
 * @returns Color code for the priority
 */
export function getPriorityColor(priority: TaskItemPriority): string {
  switch (priority) {
    case TaskItemPriority.Low:
      return "#10B981" // Green
    case TaskItemPriority.Medium:
      return "#F59E0B" // Amber
    case TaskItemPriority.High:
      return "#EF4444" // Red
    case TaskItemPriority.Critical:
      return "#7F1D1D" // Dark red
    default:
      return "#6B7280" // Gray for unknown priority
  }
}

/**
 * Enum for task status levels
 * This should match the backend enum
 */
export enum TaskItemStatus {
  ToDo = 0,
  InProgress = 1,
  InReview = 2,
  Done = 3,
  Archived = 4,
}

/**
 * Gets color for a task status
 * @param status Task status
 * @returns Color code for the status
 */
export function getStatusColor(status: TaskItemStatus): string {
  switch (status) {
    case TaskItemStatus.ToDo:
      return "#6B7280" // Gray
    case TaskItemStatus.InProgress:
      return "#3B82F6" // Blue
    case TaskItemStatus.InReview:
      return "#8B5CF6" // Purple
    case TaskItemStatus.Done:
      return "#10B981" // Green
    case TaskItemStatus.Archived:
      return "#374151" // Dark gray
    default:
      return "#6B7280" // Gray for unknown status
  }
}

/**
 * Utility function to conditionally join class names
 * @param classes Class names to join
 * @returns Joined class names
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
