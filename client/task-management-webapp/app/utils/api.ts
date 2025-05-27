import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // If we have a refresh token mechanism, we could use it here
      // For now, just redirect to login
      localStorage.removeItem("auth_token")
      window.location.href = "/auth"
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
