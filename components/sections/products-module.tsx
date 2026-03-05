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
import { PackagePlus, Tag, Package, Trash2, Edit3, CircleDollarSign, Box } from "lucide-react"

// Interfaces preparadas para el Microservicio de Productos
interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  category?: Category
}

export default function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Estado del formulario
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: ""
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      // 🔗 CONEXIÓN PREPARADA: Intentará llamar a estos endpoints en la VPS
      const [prodRes, catRes] = await Promise.all([
        apiClient.get('/gestion/productos').catch(() => ({ data: [] })),
        apiClient.get('/gestion/categorias').catch(() => ({ data: [] }))
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (error) {
      console.warn("Nota: El microservicio de productos no responde aún en la VPS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    try {
      if (!currentProduct.name || !currentProduct.categoryId || currentProduct.price <= 0) {
        toast.error("Rellena nombre, categoría y un precio válido")
        return
      }

      if (editingId) {
        await apiClient.patch(`/gestion/productos/${editingId}`, currentProduct)
        toast.success("Producto actualizado")
      } else {
        await apiClient.post('/gestion/productos', currentProduct)
        toast.success("Producto creado en la base de datos")
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Error al guardar. ¿Está el microservicio online?")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return
    try {
      await apiClient.delete(`/gestion/productos/${id}`)
      fetchData()
      toast.success("Producto eliminado")
    } catch (e) { toast.error("No se pudo eliminar") }
  }

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-primary">Conectando con el almacén...</div>

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Package size={32}/> Inventario de Productos
          </h2>
          <p className="text-muted-foreground">Gestiona la carta, stock y precios de la pizzería</p>
        </div>
        <Button onClick={() => { 
          setEditingId(null); 
          setCurrentProduct({ name: "", description: "", price: 0, stock: 0, categoryId: "" }); 
          setIsModalOpen(true); 
        }} className="bg-primary text-white font-bold">
          <PackagePlus className="mr-2"/> Nuevo Producto
        </Button>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full p-20 text-center border-2 border-dashed rounded-xl opacity-50">
            <Box size={48} className="mx-auto mb-4"/>
            <p>No hay productos registrados o el microservicio está offline.</p>
          </div>
        ) : (
          products.map((prod) => (
            <Card key={prod.id} className="p-0 overflow-hidden border shadow-sm hover:shadow-lg transition-all group">
              <div className="h-32 bg-muted flex items-center justify-center relative">
                <Package size={40} className="text-muted-foreground/40"/>
                <Badge className="absolute top-2 right-2 bg-primary">{prod.price}€</Badge>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-lg">{prod.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{prod.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-[10px] font-bold py-0 h-5">
                    <Tag size={10} className="mr-1"/> {prod.category?.name || "Sin categoría"}
                  </Badge>
                  <Badge variant={prod.stock > 10 ? "secondary" : "destructive"} className="text-[10px] py-0 h-5">
                    Stock: {prod.stock}
                  </Badge>
                </div>

                <div className="flex gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => {
                    setEditingId(prod.id);
                    setCurrentProduct({
                      name: prod.name,
                      description: prod.description,
                      price: prod.price,
                      stock: prod.stock,
                      categoryId: prod.categoryId
                    });
                    setIsModalOpen(true);
                  }}>
                    <Edit3 size={14} className="mr-1"/> Editar
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prod.id)}>
                    <Trash2 size={14}/>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {editingId ? "Actualizar Producto" : "Registrar en la Carta"}
            </DialogTitle>
            <DialogDescription>Completa los detalles técnicos del producto.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2 col-span-2">
              <Label>Nombre del Producto *</Label>
              <Input value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} placeholder="Ej: Pizza Carbonara" />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Descripción / Ingredientes</Label>
              <Input value={currentProduct.description} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} placeholder="Base de nata, bacon, cebolla..." />
            </div>
            <div className="grid gap-2">
              <Label>Precio (€) *</Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-2 top-2.5 text-muted-foreground" size={16}/>
                <Input type="number" className="pl-8" value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Stock Inicial</Label>
              <Input type="number" value={currentProduct.stock} onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>Categoría *</Label>
              <Select value={currentProduct.categoryId} onValueChange={(val) => setCurrentProduct({ ...currentProduct, categoryId: val })}>
                <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-white font-bold">Guardar Producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}