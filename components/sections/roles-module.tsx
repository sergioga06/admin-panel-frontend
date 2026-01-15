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
import { Settings2, ShieldCheck } from "lucide-react"

// 👇 ESTO QUITA EL ERROR DE "NEVER"
interface Permiso {
  id: string
  name: string
  slug: string
}

interface Role {
  id: string
  name: string // O 'name' si lo cambiaste en el schema de Role también
  permisos: Permiso[]
}

export default function RolesModule() {
  const [roles, setRoles] = useState<Role[]>([]) // 👇 Tipado corregido
  const [permisos, setPermisos] = useState<Permiso[]>([]) // 👇 Tipado corregido
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [currentRole, setCurrentRole] = useState<{nombre: string, permisosIds: string[]}>({
    nombre: "",
    permisosIds: []
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rRes, pRes] = await Promise.all([
        apiClient.get('/gestion/roles'),
        apiClient.get('/gestion/permisos')
      ])
      setRoles(rRes.data)
      setPermisos(pRes.data)
    } catch (error) {
      toast.error("Error al cargar roles y permisos")
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleTogglePermiso = (id: string) => {
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

  if (loading) return <div className="p-10 text-center">Cargando seguridad...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border">
        <div>
          <h2 className="text-3xl font-bold text-primary">Roles y Seguridad</h2>
          <p className="text-muted-foreground">Gestiona los niveles de acceso del personal</p>
        </div>
        <Button onClick={() => { 
          setEditingId(null); 
          setCurrentRole({ nombre: "", permisosIds: [] }); 
          setIsModalOpen(true); 
        }}>
          + Nuevo Rol
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="p-5 border-l-4 border-l-primary">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold">{role.name}</h4>
                <p className="text-sm text-muted-foreground">{role.permisos?.length || 0} permisos asignados</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setEditingId(role.id);
                setCurrentRole({ 
                  nombre: role.name, 
                  permisosIds: role.permisos.map((p: Permiso) => p.id) 
                });
                setIsModalOpen(true);
              }}><Settings2 size={18} /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permisos?.map((p: Permiso) => (
                <span key={p.id} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase">
                  {p.name} {/* 👈 Cambiado nombre por name */}
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
              <Input value={currentRole.nombre} onChange={e => setCurrentRole({...currentRole, nombre: e.target.value})} placeholder="Ej: Administrador" />
            </div>
            <Label>Asignar Permisos</Label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg max-h-60 overflow-y-auto">
              {permisos.map((p: Permiso) => (
                <div key={p.id} className="flex items-center space-x-2 bg-card p-2 rounded border">
                  <Checkbox 
                    id={p.id} 
                    checked={currentRole.permisosIds.includes(p.id)}
                    onCheckedChange={() => handleTogglePermiso(p.id)}
                  />
                  <label htmlFor={p.id} className="text-sm cursor-pointer leading-tight">
                    {p.name} {/* 👈 Cambiado nombre por name */}
                    <p className="text-[10px] text-muted-foreground">{p.slug}</p>
                  </label>
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