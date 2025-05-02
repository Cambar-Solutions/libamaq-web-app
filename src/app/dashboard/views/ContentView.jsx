import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const orderData = [
  { id: 1, cliente: "Juan Pérez", producto: "Taladro reversible", estado: "Pendiente", fecha: "2025-04-11" },
  { id: 2, cliente: "María García", producto: "Sierra Ingleteadora", estado: "Entregado", fecha: "2025-04-10" },
  { id: 3, cliente: "Carlos López", producto: "Taladro reversible", estado: "En proceso", fecha: "2025-04-09" },
];

export function ContentView() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {orderData.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Cliente:</span>
                <span className="text-sm">{order.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Producto:</span>
                <span className="text-sm">{order.producto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <span className={`text-sm font-semibold ${
                  order.estado === "Entregado" ? "text-green-600" :
                  order.estado === "En proceso" ? "text-blue-600" :
                  "text-yellow-600"
                }`}>{order.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Fecha:</span>
                <span className="text-sm">{order.fecha}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
