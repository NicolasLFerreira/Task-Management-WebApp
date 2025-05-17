import type React from "react"

export interface AvatarProps {
  src?: string
  name?: string
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", className = "" }) => {
  const getInitials = (name: string) => {
    if (!name) return "?"
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-6 h-6 text-xs"
      case "sm":
        return "w-8 h-8 text-sm"
      case "md":
        return "w-10 h-10 text-base"
      case "lg":
        return "w-12 h-12 text-lg"
      default:
        return "w-10 h-10 text-base"
    }
  }

  const bgColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]

  const getRandomBgColor = (name: string) => {
    if (!name) return bgColors[0]
    const charCode = name.charCodeAt(0)
    return bgColors[charCode % bgColors.length]
  }

  return (
    <div className={`${getSizeClasses()} flex items-center justify-center rounded-full overflow-hidden ${className}`}>
      {src ? (
        <img src={src || "/placeholder.svg"} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white ${getRandomBgColor(name || "")}`}>
          {name ? getInitials(name) : "?"}
        </div>
      )}
    </div>
  )
}
