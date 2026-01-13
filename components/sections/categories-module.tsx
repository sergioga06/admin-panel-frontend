"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Category {
  id: string
  name: string
  description: string
  productCount: number
}

export default function CategoriesModule() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Platos Principales",
      description: "Platos fuertes y principales",
      productCount: 12,
    },
    {
      id: "2",
      name: "Pizzas",
      description: "Variedad de pizzas artesanales",
      productCount: 8,
    },
    {
      id: "3",
      name: "Ensaladas",
      description: "Ensaladas frescas y saludables",
      productCount: 5,
    },
    {
      id: "4",
      name: "Bebidas",
      description: "Bebidas frías y calientes",
      productCount: 15,
    },
    {
      id: "5",
      name: "Postres",
      description: "Postres y dulces",
      productCount: 0,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })

  const handleOpenModal = () => {
    setEditingId(null)
    setNewCategory({ name: "", description: "" })
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id)
    setNewCategory({ name: category.name, description: category.description })
    setIsModalOpen(true)
  }

  const handleSaveCategory = () => {
    if (newCategory.name) {
      if (editingId) {
        setCategories(
          categories.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  name: newCategory.name,
                  description: newCategory.description,
                }
              : c,
          ),
        )
      } else {
        setCategories([
          ...categories,
          {
            id: Date.now().toString(),
            name: newCategory.name,
            description: newCategory.description,
            productCount: 0,
          },
        ])
      }
      setNewCategory({ name: "", description: "" })
      setEditingId(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Categorías</h1>
          <p className="text-muted-foreground">Administra categorías de productos</p>
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          + Nueva Categoría
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-6 border-border/50 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Editar Categoría" : "Crear Nueva Categoría"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
              <Input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Bebidas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm"
                placeholder="Descripción de la categoría"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveCategory}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {editingId ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                }}
                variant="outline"
                className="flex-1 border-border hover:bg-secondary/20"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-6 border-border/50">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-primary font-semibold">{category.productCount} productos</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleEditCategory(category)}
                variant="outline"
                className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
              >
                Editar
              </Button>
              <Button
                onClick={() => handleDeleteCategory(category.id)}
                variant="outline"
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
