"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "supervisor" | "user"
  status: "active" | "inactive"
}

export default function UsersListModule() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Juan García",
      email: "juan@example.com",
      role: "admin",
      status: "active",
    },
    {
      id: "2",
      name: "María López",
      email: "maria@example.com",
      role: "supervisor",
      status: "active",
    },
    {
      id: "3",
      name: "Carlos Ruiz",
      email: "carlos@example.com",
      role: "user",
      status: "active",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" as const })

  const handleOpenModal = () => {
    setEditingId(null)
    setNewUser({ name: "", email: "", role: "user" })
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingId(user.id)
    setNewUser({ name: user.name, email: user.email, role: user.role })
    setIsModalOpen(true)
  }

  const handleSaveUser = () => {
    if (newUser.name && newUser.email) {
      if (editingId) {
        setUsers(
          users.map((u) =>
            u.id === editingId
              ? {
                  ...u,
                  name: newUser.name,
                  email: newUser.email,
                  role: newUser.role,
                }
              : u,
          ),
        )
      } else {
        setUsers([
          ...users,
          {
            id: Date.now().toString(),
            ...newUser,
            status: "active",
          },
        ])
      }
      setNewUser({ name: "", email: "", role: "user" })
      setEditingId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400"
      case "supervisor":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios del sistema</p>
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          + Nuevo Usuario
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-6 border-border/50 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
              <Input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="juan@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rol</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm"
              >
                <option value="user">Usuario</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveUser}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingId ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                }}
                variant="outline"
                className="flex-1 border-border hover:bg-secondary/20"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {user.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditUser(user)}
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
