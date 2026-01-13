"use client"

import { Card } from "@/components/ui/card"

export default function Dashboard() {
  const stats = [
    { label: "Total Usuarios", value: "24", icon: "👥", color: "from-primary to-accent" },
    { label: "Total Mesas", value: "12", icon: "🍽️", color: "from-accent to-primary" },
    { label: "Total Productos", value: "156", icon: "📦", color: "from-primary/80 to-primary" },
    { label: "Órdenes Activas", value: "8", icon: "📋", color: "from-accent/80 to-accent" },
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">Dashboard</h1>
        <p className="text-sm lg:text-base text-muted-foreground">Bienvenido al panel de administración</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 lg:p-6 border-border/50 bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs lg:text-sm mb-1 lg:mb-2 truncate">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`text-3xl lg:text-4xl opacity-30 flex-shrink-0`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 lg:p-8 border-border/50">
        <h2 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6">Actividad Reciente</h2>
        <div className="space-y-3 lg:space-y-4">
          {[
            { user: "Juan García", action: "Creó nuevo usuario", time: "Hace 5 minutos" },
            { user: "María López", action: "Agregó 3 nuevos productos", time: "Hace 15 minutos" },
            { user: "Carlos Ruiz", action: "Actualizó mesa 5", time: "Hace 1 hora" },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-background rounded-lg border border-border/20 gap-2"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm lg:text-base truncate">{activity.user}</p>
                <p className="text-xs lg:text-sm text-muted-foreground truncate">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
