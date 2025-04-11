import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react";

const statsData = [
  {
    title: "Total Productos",
    value: "124",
    icon: Package,
    description: "Productos en inventario",
    trend: "+5% vs mes anterior"
  },
  {
    title: "Pedidos Activos",
    value: "45",
    icon: ShoppingCart,
    description: "Pedidos en proceso",
    trend: "+12% vs mes anterior"
  },
  {
    title: "Clientes Totales",
    value: "89",
    icon: Users,
    description: "Clientes registrados",
    trend: "+8% vs mes anterior"
  },
  {
    title: "Ventas Mensuales",
    value: "$45,678",
    icon: BarChart3,
    description: "Abril 2025",
    trend: "+15% vs mes anterior"
  }
];

export function StatsView() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
