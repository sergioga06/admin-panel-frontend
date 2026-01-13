"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Permission {
  id: string
  name: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export default function RolesModule() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Administrador",
      description: "Acceso completo al sistema",
      permissions: [
        { id: "1", name: "Crear" },
        { id: "2", name: "Leer" },
        { id: "3", name: "Editar" },
        { id: "4", name: "Eliminar" },
      ],
    },
    {
      id: "2",
      name: "Supervisor",
      description: "Acceso limitado a gestión",
      permissions: [
        { id: "1", name: "Crear" },
        { id: "2", name: "Leer" },
        { id: "3", name: "Editar" },
      ],
    },
    {
      id: "3",
      name: "Usuario",
      description: "Acceso básico de lectura",
      permissions: [{ id: "2", name: "Leer" }],
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] as Permission[] })

  const allPermissions: Permission[] = [
    { id: "1", name: "Crear" },
    { id: "2", name: "Leer" },
    { id: "3", name: "Editar" },
    { id: "4", name: "Eliminar" },
  ]

  const handleOpenModal = () => {
    setEditingId(null)
    setNewRole({ name: "", description: "", permissions: [] })
    setIsModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingId(role.id)
    setNewRole({ name: role.name, description: role.description, permissions: role.permissions })
    setIsModalOpen(true)
  }

  const handleSaveRole = () => {
    if (newRole.name) {
      if (editingId) {
        setRoles(
          roles.map((r) =>
            r.id === editingId
              ? {
                  ...r,
                  name: newRole.name,
                  description: newRole.description,
                  permissions: newRole.permissions,
                }
              : r,
          ),
        )
      } else {
        setRoles([
          ...roles,
          {
            id: Date.now().toString(),
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions,
          },
        ])
      }
      setNewRole({ name: "", description: "", permissions: [] })
      setEditingId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id))
  }

  const handleTogglePermission = (permission: Permission) => {
    const exists = newRole.permissions.find((p) => p.id === permission.id)
    if (exists) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter((p) => p.id !== permission.id),
      })
    } else {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, permission],
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Roles</h1>
          <p className="text-muted-foreground">Define roles y sus permisos</p>
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          + Nuevo Rol
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-6 border-border/50 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">{editingId ? "Editar Rol" : "Crear Nuevo Rol"}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre del Rol</label>
              <Input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Gerente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
              <textarea
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm"
                placeholder="Descripción del rol"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Permisos</label>
              <div className="space-y-2">
                {allPermissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRole.permissions.some((p) => p.id === permission.id)}
                      onChange={() => handleTogglePermission(permission)}
                      className="w-4 h-4 rounded border-border bg-background"
                    />
                    <span className="text-sm text-foreground">{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveRole}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingId ? "Guardar Cambios" : "Crear Rol"}
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
        {roles.map((role) => (
          <Card key={role.id} className="p-6 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEditRole(role)}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => handleDeleteRole(role.id)}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Eliminar
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">PERMISOS ({role.permissions.length})</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.length > 0 ? (
                  role.permissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary"
                    >
                      {permission.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Sin permisos asignados</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
