import { Skeleton } from "./Skeleton"

interface SkeletonLoaderProps {
  type?: "card" | "list" | "table" | "detail"
  count?: number
}

export function SkeletonLoader({ type = "card", count = 3 }: SkeletonLoaderProps) {
  const renderCardSkeleton = () => (
    <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="flex items-center space-x-4 py-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  )

  const renderTableSkeleton = () => (
    <div className="border-b border-gray-200 py-4 dark:border-gray-700">
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </div>
  )

  const renderDetailSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return renderCardSkeleton()
      case "list":
        return renderListSkeleton()
      case "table":
        return renderTableSkeleton()
      case "detail":
        return renderDetailSkeleton()
      default:
        return renderCardSkeleton()
    }
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}
