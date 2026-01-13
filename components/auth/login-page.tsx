"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (email && password) {
        setIsLoading(false)
        onLogin()
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border shadow-xl bg-card">
        <div className="p-6 lg:p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">AP</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-foreground text-foreground hover:bg-muted rounded-full bg-transparent"
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Demo: Usa cualquier email y contraseña para entrar
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
