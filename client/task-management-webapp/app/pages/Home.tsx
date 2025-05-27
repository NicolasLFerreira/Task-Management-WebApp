"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"

const Home = () => {
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

  return (
    <>
      <Helmet>
        <title>Tickway – Home</title>
        <meta name="description" content="Task management made simple with Tickway." />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    </>
  )
}

export default Home
