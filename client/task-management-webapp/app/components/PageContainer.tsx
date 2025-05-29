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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Get the sidebar state from localStorage or default to true (collapsed) on mobile, false on desktop
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebarCollapsed")
      return savedState ? JSON.parse(savedState) : window.innerWidth < 768
    }
    return false
  })

  // Handle sidebar toggle from header (mobile)
  const toggleSidebarMobile = () => {
    setSidebarVisible(!sidebarVisible)
  }

  // Handle sidebar collapse/expand (desktop)
  const toggleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed))
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <Header toggleSidebarMobile={toggleSidebarMobile} sidebarVisible={sidebarVisible} />

      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onCollapsedChange={toggleSidebarCollapse}
        initialCollapsed={sidebarCollapsed}
        mobileVisible={sidebarVisible}
        onMobileClose={() => setSidebarVisible(false)}
      />

      <main className={`pt-20 p-6 transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
        {children}
      </main>
    </div>
  )
}

export default PageContainer
