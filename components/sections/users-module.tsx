"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"

interface Role {
  id: string
  nombre: string
}

interface User {
  id: string
  nombre: string
  email: string
  roleId: string
  role?: Role
  isActive: boolean
}

export default function UsersModule() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Partial<User & { password?: string }>>({
    nombre: "",
    email: "",
    roleId: "",
    password: "",
  })

  // 1. CARGAR DATOS (Usuarios y Roles)
  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get('/gestion/usuarios'),
        apiClient.get('/gestion/roles')
      ])
      setUsers(usersRes.data)
      setRoles(rolesRes.data)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al conectar con el servidor de usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. ELIMINAR USUARIO
  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return
    try {
      await apiClient.delete(`/gestion/usuarios/${id}`)
      toast.success("Usuario eliminado")
      fetchData()
    } catch (error) {
      toast.error("No se pudo eliminar el usuario")
    }
  }

  // 3. GUARDAR (CREAR O EDITAR)
  const handleSaveUser = async () => {
    try {
      // Validaciones básicas
      if (!currentUser.email || !currentUser.nombre || !currentUser.roleId) {
        toast.error("Por favor rellena los campos obligatorios")
        return
      }

      if (editingId) {
        // PATCH: El password es opcional al editar
        const updateData = { ...currentUser }
        if (!updateData.password) delete updateData.password
        
        await apiClient.patch(`/gestion/usuarios/${editingId}`, updateData)
        toast.success("Usuario actualizado")
      } else {
        // POST: El password es obligatorio al crear
        if (!currentUser.password) {
          toast.error("La contraseña es obligatoria para nuevos usuarios")
          return
        }
        await apiClient.post('/gestion/usuarios', currentUser)
        toast.success("Usuario creado con éxito")
      }
      
      setIsModalOpen(false)
      setEditingId(null)
      fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al guardar"
      toast.error(typeof msg === 'string' ? msg : "Error de validación")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingId(user.id)
    setCurrentUser({
      nombre: user.nombre,
      email: user.email,
      roleId: user.roleId,
      password: "", // No cargamos el password por seguridad
    })
    setIsModalOpen(true)
  }

  const handleAddUser = () => {
    setEditingId(null)
    setCurrentUser({ nombre: "", email: "", roleId: "", password: "" })
    setIsModalOpen(true)
  }

  if (loading) return <div className="p-8 text-center">Cargando panel de usuarios...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Usuarios del Sistema</h2>
          <p className="text-muted-foreground">Gestiona los accesos y roles de tu personal</p>
        </div>
        <Button onClick={handleAddUser} className="bg-primary text-white">
          + Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold">{user.nombre}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                  {user.role?.nombre || "Sin Rol"}
                </Badge>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleEditUser(user)} variant="outline" className="flex-1">
                  Editar
                </Button>
                <Button onClick={() => handleDeleteUser(user.id)} variant="outline" className="text-destructive hover:bg-destructive/10">
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL DE USUARIO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre Completo</Label>
              <Input
                value={currentUser.nombre}
                onChange={(e) => setCurrentUser({ ...currentUser, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={currentUser.email}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                placeholder="juan@pizzeria.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Rol en el Sistema</Label>
              <Select
                value={currentUser.roleId}
                onValueChange={(val) => setCurrentUser({ ...currentUser, roleId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Contraseña {editingId && "(dejar en blanco para no cambiar)"}</Label>
              <Input
                type="password"
                value={currentUser.password}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                placeholder="********"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}