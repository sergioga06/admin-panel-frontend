"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import apiClient from '@/lib/api-client'
import { toast } from "sonner" // Asumiendo que usas sonner para notificaciones

interface Product {
  id: string
  name: string
  price: number
  description: string
  stock: number
  category?: string // En el backend es categoryId, aquí lo manejamos para el UI
}

export default function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Categorías estáticas por ahora (lo ideal sería cargarlas de /gestion/categorias)
  const [categories] = useState(["Platos Principales", "Pizzas", "Ensaladas", "Bebidas", "Postres"])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "Platos Principales",
    stock: 0,
    description: "",
  })

  // 1. CARGAR PRODUCTOS DEL BACKEND
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/gestion/productos')
      setProducts(response.data)
    } catch (error) {
      console.error("Error cargando productos:", error)
      toast.error("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // 2. ELIMINAR PRODUCTO
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    try {
      await apiClient.delete(`/gestion/productos/${id}`)
      toast.success("Producto eliminado")
      fetchProducts() // Recargar lista
    } catch (error) {
      toast.error("Error al eliminar el producto")
    }
  }

  // 3. GUARDAR (CREAR O EDITAR)
  const handleSaveProduct = async () => {
    try {
      if (editingId) {
        // Modo Edición (PATCH)
        await apiClient.patch(`/gestion/productos/${editingId}`, currentProduct)
        toast.success("Producto actualizado")
      } else {
        // Modo Creación (POST)
        await apiClient.post('/gestion/productos', currentProduct)
        toast.success("Producto creado con éxito")
      }
      
      setIsModalOpen(false)
      setEditingId(null)
      fetchProducts() // Recargar lista
    } catch (error) {
      console.error("Error al guardar:", error)
      toast.error("Error al guardar el producto")
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id)
    setCurrentProduct(product)
    setIsModalOpen(true)
  }

  const handleAddProduct = () => {
    setEditingId(null)
    setCurrentProduct({
      name: "",
      price: 0,
      category: "Platos Principales",
      stock: 0,
      description: "",
    })
    setIsModalOpen(true)
  }

  if (loading) return <div className="p-8 text-center text-primary">Cargando productos...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-primary/10 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Gestión de Menú</h2>
          <p className="text-muted-foreground mt-1">Administra los productos y categorías de tu pizzería</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-white px-6">
          <span className="mr-2">+</span> Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary/80">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products
                .filter((p) => p.category === category || (!p.category && category === "Platos Principales"))
                .map((product) => (
                  <Card key={product.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-primary/5">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{product.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            variant="outline"
                            size="sm"
                            className="border-primary/50 text-primary hover:bg-primary/10"
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product.id)}
                            variant="outline"
                            size="sm"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={currentProduct.name}
                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={currentProduct.price}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  value={currentProduct.stock}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={currentProduct.category}
                onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={currentProduct.description}
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveProduct}>
              {editingId ? "Actualizar Producto" : "Guardar Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}