// Export all hooks from a single file for easier imports

export { useAuth, AuthProvider } from "./useAuth"
export { useToast, ToastProvider } from "./useToast"
export { useBoard, BoardProvider } from "./useBoard"
export { useTask, TaskProvider } from "./useTask"
export { useDragDrop, DragDropProvider } from "./useDragDrop"
export { useApiErrorHandler } from "./useApiErrorHandler"
export { useDebounce } from "./useDebounce"
export { useLocalStorage } from "./useLocalStorage"
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsDarkMode,
} from "./useMediaQuery"
export { useOutsideClick } from "./useOutsideClick"
export { useForm } from "./useForm"
