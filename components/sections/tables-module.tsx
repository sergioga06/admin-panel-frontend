"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"
import { 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  QrCode, 
  CircleDot,
  LayoutGrid,
  RefreshCw
} from "lucide-react"

// Tipos basados en tu backend (TableStatus de @app/common)
type TableStatus = "available" | "occupied" | "reserved" | "cleaning"

interface Mesa {
  id: string
  number: number
  capacity: number
  status: TableStatus
  isActive: boolean
}

export default function TablesModule() {
  const [tables, setTables] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [currentTable, setCurrentTable] = useState({
    number: 1,
    capacity: 4,
    status: "available" as TableStatus
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      // El Gateway mapeará esto a { cmd: 'find_all_tables' }
      const res = await apiClient.get('/gestion/mesas')
      setTables(res.data || [])
    } catch (error) {
      toast.error("Error al conectar con el microservicio de mesas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    try {
      if (currentTable.number <= 0) return toast.error("Número de mesa no válido")

      if (editingId) {
        // PATCH /gestion/mesas/:id -> { cmd: 'update_table' }
        await apiClient.patch(`/gestion/mesas/${editingId}`, currentTable)
        toast.success("Configuración de mesa guardada")
      } else {
        // POST /gestion/mesas -> { cmd: 'create_table' }
        await apiClient.post('/gestion/mesas', currentTable)
        toast.success(`Mesa ${currentTable.number} creada correctamente`)
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al procesar la mesa"
      toast.error(errorMsg)
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: TableStatus) => {
    try {
      // PATCH /gestion/mesas/:id/status -> { cmd: 'change_table_status' }
      await apiClient.patch(`/gestion/mesas/${id}/status`, { status: newStatus })
      fetchData()
      toast.success("Estado de mesa actualizado")
    } catch (e) {
      toast.error("No se pudo cambiar el estado")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas dar de baja esta mesa?")) return
    try {
      await apiClient.delete(`/gestion/mesas/${id}`)
      fetchData()
      toast.success("Mesa eliminada del sistema")
    } catch (e) { toast.error("Error al eliminar") }
  }

  const getStatusInfo = (status: TableStatus) => {
    switch (status) {
      case "available": return { label: "Libre", color: "bg-green-500/10 text-green-500 border-green-500/20" }
      case "occupied": return { label: "Ocupada", color: "bg-red-500/10 text-red-500 border-red-500/20" }
      case "reserved": return { label: "Reservada", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" }
      case "cleaning": return { label: "Limpieza", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" }
      default: return { label: "N/A", color: "bg-gray-500/10 text-gray-500" }
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse text-primary font-bold">Consultando plano de salón...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <LayoutGrid size={32}/> Gestión de Mesas
          </h2>
          <p className="text-muted-foreground">Control de aforo y estados en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw size={18}/></Button>
          <Button onClick={() => { 
            setEditingId(null); 
            setCurrentTable({ number: tables.length + 1, capacity: 4, status: "available" }); 
            setIsModalOpen(true); 
          }} className="bg-primary text-white font-bold">
            + Añadir Mesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map((mesa) => {
          const statusInfo = getStatusInfo(mesa.status)
          return (
            <Card key={mesa.id} className="p-4 flex flex-col items-center justify-center relative hover:shadow-md transition-all group border-2">
              <div className="absolute top-2 right-2">
                <CircleDot size={12} className={mesa.status === "available" ? "text-green-500" : "text-red-500 animate-pulse"}/>
              </div>
              
              <div className="mb-2 p-3 bg-muted rounded-full">
                <TableIcon size={24} className="text-muted-foreground"/>
              </div>
              
              <h4 className="font-extrabold text-xl">MESA {mesa.number}</h4>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Users size={12}/> {mesa.capacity} pax
              </div>

              <Select 
                value={mesa.status} 
                onValueChange={(val: TableStatus) => handleQuickStatusChange(mesa.id, val)}
              >
                <SelectTrigger className={`mt-3 h-7 text-[9px] font-bold uppercase ${statusInfo.color}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Libre</SelectItem>
                  <SelectItem value="occupied">Ocupada</SelectItem>
                  <SelectItem value="reserved">Reservada</SelectItem>
                  <SelectItem value="cleaning">Limpieza</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => {
                  setEditingId(mesa.id);
                  setCurrentTable({ number: mesa.number, capacity: mesa.capacity, status: mesa.status });
                  setIsModalOpen(true);
                }}><Edit3 size={14}/></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(mesa.id)}><Trash2 size={14}/></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400" onClick={() => toast.info("Generador de QR en desarrollo")}>
                  <QrCode size={14}/>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? `Ajustar Mesa ${currentTable.number}` : "Configurar Mesa"}
            </DialogTitle>
            <DialogDescription>Asigna el número de mesa y su capacidad.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label>Número Mesa</Label>
              <Input type="number" value={currentTable.number} onChange={(e) => setCurrentTable({ ...currentTable, number: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <Label>Capacidad</Label>
              <Input type="number" value={currentTable.capacity} onChange={(e) => setCurrentTable({ ...currentTable, capacity: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-white">Guardar Mesa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}