// components/sections/permissions-module.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"
import { Key, Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function PermissionsModule() {
  const [permisos, setPermisos] = useState([])
  const [newName, setNewName] = useState("")

  const fetchPermisos = async () => {
    const res = await apiClient.get('/gestion/permisos')
    setPermisos(res.data)
  }

  useEffect(() => { fetchPermisos() }, [])

  const handleAdd = async () => {
    if (!newName) return
    try {
      await apiClient.post('/gestion/permisos', { nombre: newName.toUpperCase() })
      setNewName("")
      fetchPermisos()
      toast.success("Permiso creado")
    } catch (e) { toast.error("Error al crear") }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Borrar permiso? Esto lo quitará de todos los roles.")) return
    await apiClient.delete(`/gestion/permisos/${id}`)
    fetchPermisos()
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Key size={20}/> Definir Nuevos Permisos</h3>
        <div className="flex gap-4">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NOMBRE_DEL_PERMISO" />
          <Button onClick={handleAdd}><Plus className="mr-2"/> Añadir</Button>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificador del Permiso</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permisos.map(p => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-primary">{p.nombre}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive">
                  <Trash2 size={16}/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}