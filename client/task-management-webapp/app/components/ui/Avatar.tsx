import { cn } from "../../lib/utils"
interface AvatarProps {
  src?: string
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const initials = getInitials(name)
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ]

  // Generate a consistent color based on the name
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full text-white",
        sizeClasses[size],
        !src && bgColor,
        className,
      )}
    >
      {src ? (
        <img
          src={src || "/placeholder.svg"}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            // If image fails to load, show initials instead
            ;(e.target as HTMLImageElement).style.display = "none"
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
