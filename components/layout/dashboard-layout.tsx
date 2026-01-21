"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import TopBar from "./top-bar"
import Dashboard from "@/components/sections/dashboard"
import UsersModule from "@/components/sections/users-module"
import RolesModule from "@/components/sections/roles-module"
import PermissionsModule from "@/components/sections/permissions-module"
import TablesModule from "@/components/sections/tables-module"
import ProductsListModule from "@/components/sections/products-list-module"
import CategoriesModule from "@/components/sections/categories-module"

interface DashboardLayoutProps {
  onLogout: () => void
}

type ActiveSection = "dashboard" | "users" | "roles" | "permissions" | "tables" | "products-list" | "categories"

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UsersModule />
      case "roles":
        return <RolesModule />
      case "permissions":
        return <PermissionsModule />
      case "tables":
        return <TablesModule />
      case "products-list":
        return <ProductsListModule />
      case "categories":
        return <CategoriesModule />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 ml-0 pt-16 lg:pt-0">
        <TopBar onLogout={onLogout} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-4 lg:p-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
