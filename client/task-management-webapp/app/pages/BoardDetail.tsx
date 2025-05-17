"use client"

import { useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useAuth } from "../hooks/useAuth"
import PageContainer from "../components/PageContainer"
import BoardView from "../components/Board/BoardView"

const BoardDetail = () => {
  const { boardId } = useParams<{ boardId: string }>()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth")
    }
  }, [isAuthenticated, navigate])

  if (!user) {
    return null
  }

  return (
    <PageContainer>
      <div className="p-4 h-full">
        <BoardView boardId={boardId} />
      </div>
    </PageContainer>
  )
}

export default BoardDetail
