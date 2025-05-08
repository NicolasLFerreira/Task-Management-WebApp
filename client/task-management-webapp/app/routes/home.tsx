"use client"
import { useEffect } from "react"
import { useNavigate } from "react-router"

export function meta() {
  return [
    { title: "Tickway – Task Manager" },
    { name: "description", content: "Organize and prioritize your tasks with Tickway." },
  ]
}

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to auth if not logged in, otherwise to dashboard
    const token = localStorage.getItem("auth_token")
    if (token) {
      navigate("/dashboard")
    } else {
      navigate("/auth")
    }
  }, [navigate])

  return null
}
