"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Table {
  id: string
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved"
  qrCode: string
}

export default function TablesModule() {
  const [tables, setTables] = useState<Table[]>([
    { id: "1", number: 1, capacity: 4, status: "available", qrCode: "QR_1" },
    { id: "2", number: 2, capacity: 2, status: "occupied", qrCode: "QR_2" },
    { id: "3", number: 3, capacity: 6, status: "available", qrCode: "QR_3" },
    { id: "4", number: 4, capacity: 4, status: "reserved", qrCode: "QR_4" },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTable, setNewTable] = useState({ number: "", capacity: "" })

  const handleAddTable = () => {
    if (newTable.number && newTable.capacity) {
      setTables([
        ...tables,
        {
          id: Date.now().toString(),
          number: Number.parseInt(newTable.number),
          capacity: Number.parseInt(newTable.capacity),
          status: "available",
          qrCode: `QR_${Date.now()}`,
        },
      ])
      setNewTable({ number: "", capacity: "" })
      setIsModalOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400"
      case "occupied":
        return "bg-red-500/20 text-red-400"
      case "reserved":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Mesas</h1>
          <p className="text-muted-foreground">Administra mesas y códigos QR</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          + Nueva Mesa
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-6 border-border/50 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">Crear Nueva Mesa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Número de Mesa</label>
              <Input
                type="number"
                value={newTable.number}
                onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Capacidad</label>
              <Input
                type="number"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="4"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddTable}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Crear Mesa
              </Button>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="flex-1 border-border hover:bg-secondary/20"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="p-6 border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Mesa {table.number}</h3>
                <p className="text-sm text-muted-foreground">Capacidad: {table.capacity} personas</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(table.status)}`}>
                {table.status === "available" ? "Disponible" : table.status === "occupied" ? "Ocupada" : "Reservada"}
              </span>
            </div>
            <div className="bg-background p-4 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-4xl">📱</div>
            </div>
            <div className="text-center text-xs text-muted-foreground mb-4">
              <p>Código QR: {table.qrCode}</p>
            </div>
            <Button variant="outline" className="w-full border-border hover:bg-secondary/20 bg-transparent">
              Descargar QR
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
