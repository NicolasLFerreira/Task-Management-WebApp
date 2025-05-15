"use client"

import type React from "react"

import { useState } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useTheme } from "./ThemeProvider"

type PageContainerProps = {
  children: React.ReactNode
}

const PageContainer = ({ children }: PageContainerProps) => {
  const { darkMode, toggleDarkMode } = useTheme()
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const toggleSidebarMobile = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-100"}`}>
      <Header toggleSidebarMobile={toggleSidebarMobile} sidebarVisible={sidebarVisible} />
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className={`pt-20 p-6 transition-all duration-300 md:ml-16`}>{children}</main>
    </div>
  )
}

export default PageContainer
