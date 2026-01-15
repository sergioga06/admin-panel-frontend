"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import apiClient from '@/lib/api-client'
import { toast } from "sonner"
import { Edit2, Trash2, FolderPlus, Tag } from "lucide-react" // Asumiendo que tienes lucide-react para iconos

interface Category {
  id: string
  name: string
  // isActive: boolean // Si implementaste borrado lógico
}

export default function CategoriesModule() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentCategory, setCurrentCategory] = useState({ name: "" })

  // 1. CARGAR CATEGORÍAS DEL BACKEND
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/gestion/categorias')
      setCategories(response.data)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      toast.error("No se pudieron obtener las categorías")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // 2. GUARDAR (CREAR O EDITAR)
  const handleSaveCategory = async () => {
    if (!currentCategory.name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }

    try {
      if (editingId) {
        // PATCH /gestion/categorias/:id
        await apiClient.patch(`/gestion/categorias/${editingId}`, currentCategory)
        toast.success("Categoría actualizada")
      } else {
        // POST /gestion/categorias
        await apiClient.post('/gestion/categorias', currentCategory)
        toast.success("Categoría creada con éxito")
      }
      
      setIsModalOpen(false)
      setEditingId(null)
      setCurrentCategory({ name: "" })
      fetchCategories() // Refrescar lista
    } catch (error) {
      toast.error("Error al guardar la categoría")
    }
  }

  // 3. ELIMINAR CATEGORÍA
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Estás seguro? Se recomienda no borrar categorías que tengan productos asignados.")) return
    
    try {
      await apiClient.delete(`/gestion/categorias/${id}`)
      toast.success("Categoría eliminada")
      fetchCategories()
    } catch (error) {
      toast.error("No se pudo eliminar. Verifica si tiene productos vinculados.")
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setCurrentCategory({ name: category.name })
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingId(null)
    setCurrentCategory({ name: "" })
    setIsModalOpen(true)
  }

  if (loading) return <div className="p-8 text-center text-primary">Sincronizando categorías...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Categorías del Menú</h2>
          <p className="text-muted-foreground">Define las secciones de tu carta (Pizzas, Bebidas, etc.)</p>
        </div>
        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
          <FolderPlus className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Tag size={18} />
              </div>
              <span className="font-semibold">{category.name}</span>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => handleEdit(category)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Edit2 size={16} />
              </Button>
              <Button onClick={() => handleDeleteCategory(category.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Si no hay categorías */}
      {categories.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
          <p>No hay categorías creadas todavía.</p>
        </div>
      )}

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Actualizar Categoría" : "Añadir Categoría"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Nombre de la Categoría</Label>
              <Input
                id="cat-name"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ name: e.target.value })}
                placeholder="Ej: Postres Caseros"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCategory}>
              {editingId ? "Guardar cambios" : "Crear ahora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}