"use client"

import PageContainer from "../components/PageContainer"
import BoardList from "../components/Board/BoardList"

const Boards = () => {
  return (
    <PageContainer>
      <div className="p-4">
        <BoardList />
      </div>
    </PageContainer>
  )
}

export default Boards
