"use client"

import { useState } from "react"
import LoginPage from "@/components/auth/login-page"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardLayout onLogout={handleLogout} />
}
