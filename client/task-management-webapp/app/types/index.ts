export interface User {
  id: string
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Completed = 2,
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  creationTime: string
  priority: TaskPriority
  progressStatus: TaskStatus
  ownerUserId: string
}

export interface TaskFormData {
  title: string
  description?: string
  dueDate: string
  priority: TaskPriority
  progressStatus: TaskStatus
}
