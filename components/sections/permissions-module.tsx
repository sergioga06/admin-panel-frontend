"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"
import { Key, Plus, Trash2 } from "lucide-react"

// 👇 DEFINIMOS LA ESTRUCTURA EXACTA DEL PERMISO
interface Permiso {
  id: string
  name: string
  slug: string
  action: string
  resource: string
}

export default function PermissionsModule() {
  // 👇 TIPADO FUERTE: useState<Permiso[]>([]) evita el error "never"
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", action: "", resource: "" })

  const fetchPermisos = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/gestion/permisos')
      // NestJS findMany devuelve un array directamente
      setPermisos(res.data)
    } catch (error) {
      console.error("Error VPS:", error)
      toast.error("No se pudo conectar con la base de datos en la VPS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPermisos() }, [])

  const handleAdd = async () => {
    if (!formData.name || !formData.action || !formData.resource) {
      toast.error("Por favor, rellena todos los campos")
      return
    }
    try {
      await apiClient.post('/gestion/permisos', formData)
      setFormData({ name: "", action: "", resource: "" })
      fetchPermisos() // Refrescar lista automáticamente
      toast.success("Permiso creado en el servidor")
    } catch (e) {
      toast.error("Fallo al crear permiso")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar este permiso permanentemente?")) return
    try {
      await apiClient.delete(`/gestion/permisos/${id}`)
      fetchPermisos()
      toast.success("Permiso eliminado")
    } catch (error) {
      toast.error("Error al borrar el permiso")
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse">Consultando VPS...</div>

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Key className="text-primary" size={20}/> Nuevo Permiso de Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="Nombre (Ej: Ver Ventas)" 
          />
          <Input 
            value={formData.action} 
            onChange={e => setFormData({...formData, action: e.target.value})} 
            placeholder="Acción (read, create...)" 
          />
          <Input 
            value={formData.resource} 
            onChange={e => setFormData({...formData, resource: e.target.value})} 
            placeholder="Recurso (orders, users...)" 
          />
          <Button onClick={handleAdd} className="bg-primary text-white hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4"/> Añadir
          </Button>
        </div>
      </Card>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Nombre Visible</TableHead>
              <TableHead className="font-bold">Slug (ID Técnico)</TableHead>
              <TableHead className="text-right font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permisos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  No hay permisos registrados en la VPS.
                </TableCell>
              </TableRow>
            ) : (
              permisos.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{p.name}</TableCell> {/* 👈 CAMPO CORRECTO: name */}
                  <TableCell>
                    <code className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded">
                      {p.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:bg-destructive/10">
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