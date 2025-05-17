"use client"

import { GripVertical } from "lucide-react"
import { IconButton } from "../ui/IconButton"

interface ListReorderHandleProps {
  className?: string
}

const ListReorderHandle = ({ className = "" }: ListReorderHandleProps) => {
  return (
    <IconButton
      variant="ghost"
      size="sm"
      className={className}
      ariaLabel="Reorder list"
      icon={<GripVertical size={16} />}
    />
  )
}

export default ListReorderHandle
