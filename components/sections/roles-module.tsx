// components/sections/roles-module.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"
import { ShieldCheck, Settings2, Trash2 } from "lucide-react"

export default function RolesModule() {
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [currentRole, setCurrentRole] = useState({
    nombre: "",
    permisosIds: []
  })

  const fetchData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        apiClient.get('/gestion/roles'),
        apiClient.get('/gestion/permisos')
      ])
      setRoles(rRes.data)
      setPermisos(pRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleTogglePermiso = (id) => {
    setCurrentRole(prev => ({
      ...prev,
      permisosIds: prev.permisosIds.includes(id) 
        ? prev.permisosIds.filter(pId => pId !== id)
        : [...prev.permisosIds, id]
    }))
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiClient.patch(`/gestion/roles/${editingId}`, currentRole)
        toast.success("Rol actualizado")
      } else {
        await apiClient.post('/gestion/roles', currentRole)
        toast.success("Rol creado")
      }
      setIsModalOpen(false)
      fetchData()
    } catch (e) { toast.error("Error al guardar") }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border">
        <div>
          <h2 className="text-3xl font-bold text-primary">Roles y Seguridad</h2>
          <p className="text-muted-foreground">Gestiona los niveles de acceso del personal</p>
        </div>
        <Button onClick={() => { setEditingId(null); setCurrentRole({ nombre: "", permisosIds: [] }); setIsModalOpen(true); }}>
          + Nuevo Rol
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="p-5 border-l-4 border-l-primary">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold">{role.nombre}</h4>
                <p className="text-sm text-muted-foreground">{role.permisos?.length || 0} permisos asignados</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  setEditingId(role.id);
                  setCurrentRole({ nombre: role.nombre, permisosIds: role.permisos.map(p => p.id) });
                  setIsModalOpen(true);
                }}><Settings2 size={18} /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permisos?.map(p => (
                <span key={p.id} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  {p.nombre}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Editar Rol" : "Crear Rol"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre del Rol</Label>
              <Input value={currentRole.nombre} onChange={e => setCurrentRole({...currentRole, nombre: e.target.value})} placeholder="Ej: Jefe de Cocina" />
            </div>
            <Label>Asignar Permisos</Label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg max-h-60 overflow-y-auto">
              {permisos.map(p => (
                <div key={p.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={p.id} 
                    checked={currentRole.permisosIds.includes(p.id)}
                    onCheckedChange={() => handleTogglePermiso(p.id)}
                  />
                  <label htmlFor={p.id} className="text-sm cursor-pointer">{p.nombre}</label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Guardar Rol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}