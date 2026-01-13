"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export default function PermissionsModule() {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "1",
      name: "Crear",
      description: "Permite crear nuevos registros",
      category: "CRUD",
    },
    {
      id: "2",
      name: "Leer",
      description: "Permite ver registros",
      category: "CRUD",
    },
    {
      id: "3",
      name: "Editar",
      description: "Permite modificar registros",
      category: "CRUD",
    },
    {
      id: "4",
      name: "Eliminar",
      description: "Permite borrar registros",
      category: "CRUD",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPermission, setNewPermission] = useState({ name: "", description: "", category: "" })

  const handleOpenModal = () => {
    setEditingId(null)
    setNewPermission({ name: "", description: "", category: "" })
    setIsModalOpen(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingId(permission.id)
    setNewPermission({
      name: permission.name,
      description: permission.description,
      category: permission.category,
    })
    setIsModalOpen(true)
  }

  const handleSavePermission = () => {
    if (newPermission.name) {
      if (editingId) {
        setPermissions(
          permissions.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  name: newPermission.name,
                  description: newPermission.description,
                  category: newPermission.category,
                }
              : p,
          ),
        )
      } else {
        setPermissions([
          ...permissions,
          {
            id: Date.now().toString(),
            name: newPermission.name,
            description: newPermission.description,
            category: newPermission.category,
          },
        ])
      }
      setNewPermission({ name: "", description: "", category: "" })
      setEditingId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeletePermission = (id: string) => {
    setPermissions(permissions.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Permisos</h1>
          <p className="text-muted-foreground">Administra permisos del sistema</p>
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          + Nuevo Permiso
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-6 border-border/50 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Editar Permiso" : "Crear Nuevo Permiso"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
              <Input
                type="text"
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Crear productos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
              <textarea
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm"
                placeholder="Descripción del permiso"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
              <Input
                type="text"
                value={newPermission.category}
                onChange={(e) => setNewPermission({ ...newPermission, category: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="CRUD"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSavePermission}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingId ? "Guardar Cambios" : "Crear Permiso"}
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
        {permissions.map((permission) => (
          <Card key={permission.id} className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{permission.name}</h3>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                    {permission.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditPermission(permission)}
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeletePermission(permission.id)}
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
