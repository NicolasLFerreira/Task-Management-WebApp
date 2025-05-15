"use client"

import PageContainer from "../components/PageContainer"

const MyTasks = () => {
  return (
    <PageContainer>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Tasks</h1>
        <p className="text-gray-600 dark:text-gray-300">View and manage all your assigned tasks.</p>
      </div>
    </PageContainer>
  )
}

export default MyTasks
