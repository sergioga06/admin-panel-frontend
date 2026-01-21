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
import { UserPlus, Mail, Shield, User as UserIcon } from "lucide-react"

// Interfaces sincronizadas con el Backend
interface Role {
  id: string
  name: string // Prisma usa 'name'
}

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  roles: Role[] // Es un array de roles
}

export default function UsersModule() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Estado del formulario sincronizado con el CreateUserDto
  const [currentUser, setCurrentUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roleIds: [] as string[] // Array para el backend
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get('/gestion/usuarios'),
        apiClient.get('/gestion/roles')
      ])
      setUsers(usersRes.data || [])
      setRoles(rolesRes.data || [])
    } catch (error) {
      toast.error("Error al conectar con la VPS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSaveUser = async () => {
    try {
      if (!currentUser.email || !currentUser.username || !currentUser.firstName || (!editingId && !currentUser.password)) {
        toast.error("Rellena los campos obligatorios")
        return
      }

      if (editingId) {
        await apiClient.patch(`/gestion/usuarios/${editingId}`, currentUser)
        toast.success("Usuario actualizado")
      } else {
        await apiClient.post('/gestion/usuarios', currentUser)
        toast.success("Usuario creado con éxito")
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      console.error("Error:", error.response?.data)
      toast.error("Fallo al guardar: Revisa si el email o username ya existen")
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando equipo...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <UserPlus size={32}/> Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground">Administra el acceso del personal al sistema</p>
        </div>
        <Button onClick={() => { 
          setEditingId(null); 
          setCurrentUser({ username: "", email: "", firstName: "", lastName: "", password: "", roleIds: [] }); 
          setIsModalOpen(true); 
        }} className="bg-primary text-white">
          + Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon size={24}/>
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight">{user.firstName} {user.lastName}</h4>
                <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14}/> {user.email}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.roles.map(r => (
                  <Badge key={r.id} variant="secondary" className="text-[9px] uppercase font-bold">
                    {r.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                setEditingId(user.id);
                setCurrentUser({
                  username: user.username,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  password: "", // No cargamos el password por seguridad
                  roleIds: user.roles.map(r => r.id)
                });
                setIsModalOpen(true);
              }}
            >
              Editar Perfil
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? "Actualizar Usuario" : "Registro de Personal"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input 
                value={currentUser.firstName} 
                onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                placeholder="Ej: Juan" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Apellidos</Label>
              <Input 
                value={currentUser.lastName} 
                onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                placeholder="Ej: Pérez" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input 
                value={currentUser.username} 
                onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                placeholder="juan_pizzeria" 
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Corporativo</Label>
              <Input 
                type="email"
                value={currentUser.email} 
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                placeholder="juan@ejemplo.com" 
              />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Rol Principal</Label>
              <Select
                value={currentUser.roleIds[0] || ""}
                onValueChange={(val) => setCurrentUser({ ...currentUser, roleIds: [val] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el puesto de trabajo" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Contraseña {editingId && "(dejar vacío para no cambiar)"}</Label>
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
            <Button onClick={handleSaveUser} className="bg-primary text-white px-6">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}