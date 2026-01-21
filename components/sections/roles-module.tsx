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

interface Permiso {
  id: string
  name: string
  slug: string
}

interface Role {
  id: string
  name: string
  permisos: Permiso[]
}

export default function RolesModule() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // ✅ ADAPTACIÓN: Cambiado 'permisosIds' a 'permisoIds' para que el DTO lo acepte
  const [currentRole, setCurrentRole] = useState({
    name: "",
    permisoIds: [] as string[] 
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rRes, pRes] = await Promise.all([
        apiClient.get('/gestion/roles'),
        apiClient.get('/gestion/permisos')
      ])
      setRoles(rRes.data || [])
      setPermisos(pRes.data || [])
    } catch (error) {
      toast.error("Error al cargar datos de la VPS")
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleTogglePermiso = (id: string) => {
    setCurrentRole(prev => ({
      ...prev,
      // ✅ Usamos 'permisoIds'
      permisoIds: prev.permisoIds.includes(id) 
        ? prev.permisoIds.filter(pId => pId !== id)
        : [...prev.permisoIds, id]
    }))
  }

  const handleSave = async () => {
    try {
      if (!currentRole.name) {
        toast.error("El nombre del rol es obligatorio")
        return
      }

      if (editingId) {
        await apiClient.patch(`/gestion/roles/${editingId}`, currentRole)
        toast.success("Rol actualizado")
      } else {
        // ✅ Ahora enviamos { name, permisoIds }, que es lo que pide tu DTO
        await apiClient.post('/gestion/roles', currentRole)
        toast.success("Rol creado con éxito")
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      console.error("Error enviado al server:", currentRole)
      console.error("Respuesta error:", error.response?.data)
      toast.error("Fallo al guardar: revisa la consola para ver el error del DTO")
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse font-bold">Conectando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck size={32}/> Roles y Seguridad
          </h2>
          <p className="text-muted-foreground">Configura los permisos por cada puesto</p>
        </div>
        <Button onClick={() => { 
          setEditingId(null); 
          setCurrentRole({ name: "", permisoIds: [] }); 
          setIsModalOpen(true); 
        }}>
          + Nuevo Rol
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="p-5 border-t-4 border-t-primary hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold">{role.name}</h4>
                <p className="text-[10px] text-muted-foreground font-bold">
                  {role.permisos?.length || 0} PERMISOS
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setEditingId(role.id);
                setCurrentRole({ 
                  name: role.name, 
                  permisoIds: role.permisos?.map((p) => p.id) || []
                });
                setIsModalOpen(true);
              }} className="text-primary"><Settings2 size={18} /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {role.permisos?.map((p) => (
                <span key={p.id} className="px-2 py-1 bg-primary/5 text-primary text-[9px] font-bold rounded border border-primary/10 uppercase">
                  {p.name}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingId ? "Ajustar Rol" : "Nuevo Rol"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid gap-2">
              <Label className="font-bold">Nombre del Rol</Label>
              <Input 
                value={currentRole.name} 
                onChange={e => setCurrentRole({...currentRole, name: e.target.value})} 
                placeholder="Ej: Administrador, Cocina..." 
              />
            </div>
            
            <div>
              <Label className="font-bold mb-3 block">Seleccionar Permisos</Label>
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl border max-h-72 overflow-y-auto">
                {permisos.map((p) => (
                  <div key={p.id} className="flex items-center space-x-3 bg-card p-3 rounded-lg border shadow-sm">
                    <Checkbox 
                      id={`perm-${p.id}`} 
                      checked={currentRole.permisoIds.includes(p.id)}
                      onCheckedChange={() => handleTogglePermiso(p.id)}
                    />
                    <label htmlFor={`perm-${p.id}`} className="text-sm font-semibold cursor-pointer flex-1">
                      {p.name}
                      <p className="text-[9px] text-muted-foreground mt-1">{p.slug}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-white">Guardar Rol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}