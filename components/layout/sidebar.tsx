"use client"

import { useState } from "react"
import { ChevronDown, Menu, X, LayoutDashboard, Users, UtensilsCrossed, Package } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onNavigate: (section: string) => void
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    users: true,
    products: true,
  })
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "users",
      label: "Usuarios",
      icon: Users,
      submenu: [
        { id: "users", label: "Usuarios" },
        { id: "roles", label: "Roles" },
        { id: "permissions", label: "Permisos" },
      ],
    },
    { id: "tables", label: "Mesas", icon: UtensilsCrossed },
    {
      id: "products",
      label: "Productos",
      icon: Package,
      submenu: [
        { id: "products-list", label: "Productos" },
        { id: "categories", label: "Categorías" },
      ],
    },
  ]

  const handleNavigate = (section: string) => {
    onNavigate(section)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-accent text-white p-2 rounded-full hover:bg-accent/90 transition-colors shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      <div
        className={`fixed lg:relative h-screen w-64 bg-card border-r border-border flex flex-col z-40 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              activeSection === item.id || (item.submenu && item.submenu.some((sub) => sub.id === activeSection))

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.submenu) {
                      toggleMenu(item.id)
                    } else {
                      handleNavigate(item.id)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium flex-1 text-left text-sm">{item.label}</span>
                  {item.submenu && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandedMenus[item.id] ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {item.submenu && expandedMenus[item.id] && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-border pl-3">
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.id}
                        onClick={() => handleNavigate(subitem.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                          activeSection === subitem.id
                            ? "bg-primary/20 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Panel de Control</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
