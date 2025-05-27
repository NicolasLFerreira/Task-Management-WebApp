"use client"
import { useEffect } from "react"
import { useNavigate } from "react-router"

export function meta() {
  return [{ title: "Tickaway – Home" }]
}

export default function HomeRoute() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token")
    if (token) {
      navigate("/dashboard")
    } else {
      navigate("/auth")
    }
  }, [navigate])

  return null
}
