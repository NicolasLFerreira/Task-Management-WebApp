"use client"

// Export all contexts from a single file for easier imports
export { AuthContext, AuthProvider } from "./AuthContext"
export { ThemeContext, ThemeProvider } from "./ThemeContext"
export { ToastContext, ToastProvider } from "./ToastContext"
export { BoardContext, BoardProvider } from "./BoardContext"
export { TaskContext, TaskProvider } from "./TaskContext"
export { NotificationContext, NotificationProvider } from "./NotificationContext"
export { DragDropContext, DragDropProvider } from "./DragDropContext"

// Custom hooks for using contexts
import { useContext } from "react"
import { AuthContext } from "./AuthContext"
import { ThemeContext } from "./ThemeContext"
import { ToastContext } from "./ToastContext"
import { BoardContext } from "./BoardContext"
import { TaskContext } from "./TaskContext"
import { NotificationContext } from "./NotificationContext"
import { DragDropContext } from "./DragDropContext"

export const useAuth = () => useContext(AuthContext)
export const useTheme = () => useContext(ThemeContext)
export const useToast = () => useContext(ToastContext)
export const useBoard = () => useContext(BoardContext)
export const useTask = () => useContext(TaskContext)
export const useNotification = () => useContext(NotificationContext)
export const useDragDrop = () => useContext(DragDropContext)
