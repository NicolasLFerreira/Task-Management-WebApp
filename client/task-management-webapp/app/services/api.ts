import type { LoginRequest, RegisterRequest, Task, TaskFormData, User } from "../types"

// Use environment variable if available, otherwise default to localhost
const API_URL = "/api"

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json()
        throw new Error(errorData.title || errorData.message || response.statusText)
      } catch (jsonError) {
        // If JSON parsing fails, use text
        const errorText = await response.text()
        throw new Error(errorText || response.statusText)
      }
    } else {
      const errorText = await response.text()
      throw new Error(errorText || response.statusText)
    }
  }

  // Check if there's content to parse
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    try {
      return (await response.json()) as T
    } catch (error) {
      console.error("Error parsing JSON response:", error)
      throw new Error("Invalid JSON response from server")
    }
  }

  // For string responses (like JWT tokens)
  if (typeof Response !== "undefined" && response instanceof Response) {
    try {
      const text = await response.text()
      // If it's a string that looks like JSON, try to parse it
      if (text.startsWith("{") || text.startsWith("[")) {
        try {
          return JSON.parse(text) as T
        } catch {
          // If parsing fails, return as is
          return text as unknown as T
        }
      }
      return text as unknown as T
    } catch (error) {
      console.error("Error reading response text:", error)
      return {} as T
    }
  }

  return {} as T
}

// Authentication API calls
export const authApi = {
  login: async (credentials: LoginRequest): Promise<string> => {
    try {
      console.log("Attempting login to:", `${API_URL}/Account/login`)
      const response = await fetch(`${API_URL}/Account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      console.log("Login response status:", response.status)
      return handleResponse<string>(response)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    try {
      console.log("Attempting registration to:", `${API_URL}/Account/register`)
      const response = await fetch(`${API_URL}/Account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      console.log("Registration response status:", response.status)
      return handleResponse<User>(response)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  // Check API health
  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await fetch(`${API_URL}/health`)
      return handleResponse<{ status: string; timestamp: string }>(response)
    } catch (error) {
      console.error("Health check error:", error)
      throw error
    }
  },
}

// Task API calls
export const taskApi = {
  getTask: async (id: string): Promise<Task> => {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_URL}/TaskItem/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse<Task>(response)
  },

  createTask: async (task: TaskFormData): Promise<Task> => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    // Ensure dates are in UTC format for PostgreSQL
    const taskData = {
      ...task,
      id: crypto.randomUUID(),
      creationTime: new Date().toISOString(), // Use ISO format for consistent UTC
      dueDate: new Date(task.dueDate).toISOString(), // Convert to ISO format
      ownerUserId: userId,
    }

    console.log("Creating task with data:", taskData)

    const response = await fetch(`${API_URL}/TaskItem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    })

    return handleResponse<Task>(response)
  },

  getAllTasks: async (): Promise<Task[]> => {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_URL}/TaskItem/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse<Task[]>(response)
  },

  updateTask: async (id: string, task: Partial<TaskFormData>): Promise<void> => {
    const token = localStorage.getItem("token")

    // First get the current task to preserve all fields
    const currentTask = await taskApi.getTask(id)

    // Ensure dates are in UTC format
    const updatedTask = {
      ...currentTask,
      ...task,
      // Convert dates to ISO format if they exist in the update
      ...(task.dueDate ? { dueDate: new Date(task.dueDate).toISOString() } : {}),
    }

    const response = await fetch(`${API_URL}/TaskItem/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    })

    return handleResponse<void>(response)
  },

  deleteTask: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_URL}/TaskItem/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse<void>(response)
  },
}
