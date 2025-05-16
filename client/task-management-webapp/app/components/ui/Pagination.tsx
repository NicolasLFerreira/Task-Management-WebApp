"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        end = 4
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...")
      }

      // Add page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...")
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className={cn("flex items-center justify-center space-x-1", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          currentPage === 1
            ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            page === currentPage
              ? "bg-blue-600 text-white dark:bg-blue-600"
              : page === "..."
                ? "cursor-default text-gray-500 dark:text-gray-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          currentPage === totalPages
            ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
