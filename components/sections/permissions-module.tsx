"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"
import { Key, Plus, Trash2 } from "lucide-react"

// DEFINIMOS LA INTERFAZ
interface Permiso {
  id: string
  name: string
  slug: string
}

export default function PermissionsModule() {
  const [permisos, setPermisos] = useState<Permiso[]>([]) // Tipado añadido
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", action: "", resource: "" })

  const fetchPermisos = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/gestion/permisos')
      // Seteamos el array directamente. Asegúrate de que el backend devuelva [{}, {}]
      setPermisos(res.data)
    } catch (error) {
      toast.error("Error al conectar con la VPS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPermisos() }, [])

  const handleAdd = async () => {
    if (!formData.name || !formData.action || !formData.resource) {
      toast.error("Faltan datos")
      return
    }
    try {
      await apiClient.post('/gestion/permisos', formData)
      setFormData({ name: "", action: "", resource: "" })
      fetchPermisos() // Refrescar lista
      toast.success("Permiso creado")
    } catch (e) { toast.error("Fallo al crear") }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return
    try {
      await apiClient.delete(`/gestion/permisos/${id}`)
      fetchPermisos()
    } catch (error) { toast.error("Error al borrar") }
  }

  if (loading) return <div className="p-10 text-center">Cargando permisos...</div>

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Key size={20}/> Nuevo Permiso</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="Nombre Visible" 
          />
          <Input 
            value={formData.action} 
            onChange={e => setFormData({...formData, action: e.target.value})} 
            placeholder="Acción (create, read...)" 
          />
          <Input 
            value={formData.resource} 
            onChange={e => setFormData({...formData, resource: e.target.value})} 
            placeholder="Recurso (users, products...)" 
          />
          <Button onClick={handleAdd} className="bg-primary text-white">Añadir</Button>
        </div>
      </Card>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Identificador (Slug)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permisos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">No hay permisos en la base de datos.</TableCell>
              </TableRow>
            ) : (
              permisos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell> {/* 👈 CORRECCIÓN: name en lugar de nombre */}
                  <TableCell><code className="text-xs text-primary">{p.slug}</code></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive">
                      <Trash2 size={16}/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}