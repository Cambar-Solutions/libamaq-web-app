import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Save, Edit, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample order data with additional fields
const orderData = [
  { 
    id: "ORD-2025-001", 
    cliente: "Juan Pérez", 
    clienteId: "CLI-001",
    email: "juan.perez@example.com",
    telefono: "+52 555 123 4567",
    direccion: "Av. Insurgentes Sur 1234, CDMX",
    productoId: "PROD-001", 
    producto: "Taladro reversible Bosch", 
    tipo: "Renta", 
    estado: "Pendiente", 
    fecha: "2025-04-11",
    fechaEntrega: "2025-04-15",
    fechaDevolucion: "2025-04-22",
    total: 1250.00,
    detalles: "Renta por 7 días con opción a extensión. Cliente solicita entrega en sitio."
  },
  { 
    id: "ORD-2025-002", 
    cliente: "María García", 
    clienteId: "CLI-002",
    email: "maria.garcia@example.com",
    telefono: "+52 555 987 6543",
    direccion: "Paseo de la Reforma 567, CDMX",
    productoId: "PROD-002", 
    producto: "Sierra Ingleteadora DeWalt", 
    tipo: "Compra", 
    estado: "Entregado", 
    fecha: "2025-04-10",
    fechaEntrega: "2025-04-12",
    total: 4500.00,
    detalles: "Compra con garantía extendida de 2 años. Incluye kit de accesorios básicos."
  },
  { 
    id: "ORD-2025-003", 
    cliente: "Carlos López", 
    clienteId: "CLI-003",
    email: "carlos.lopez@example.com",
    telefono: "+52 555 456 7890",
    direccion: "Calle Durango 789, CDMX",
    productoId: "PROD-001", 
    producto: "Taladro reversible Bosch", 
    tipo: "Renta", 
    estado: "En proceso", 
    fecha: "2025-04-09",
    fechaEntrega: "2025-04-13",
    fechaDevolucion: "2025-04-20",
    total: 1250.00,
    detalles: "Renta por 7 días. Cliente solicita revisión del equipo antes de la entrega."
  },
  { 
    id: "ORD-2025-004", 
    cliente: "Ana Martínez", 
    clienteId: "CLI-004",
    email: "ana.martinez@example.com",
    telefono: "+52 555 234 5678",
    direccion: "Av. Universidad 1000, CDMX",
    productoId: "PROD-003", 
    producto: "Compresor de aire Campbell Hausfeld", 
    tipo: "Compra", 
    estado: "Pendiente", 
    fecha: "2025-04-12",
    fechaEntrega: "2025-04-16",
    total: 3200.00,
    detalles: "Compra con envío gratuito. Cliente solicita factura."
  },
  { 
    id: "ORD-2025-005", 
    cliente: "Roberto Sánchez", 
    clienteId: "CLI-005",
    email: "roberto.sanchez@example.com",
    telefono: "+52 555 876 5432",
    direccion: "Calle Sonora 432, CDMX",
    productoId: "PROD-004", 
    producto: "Generador eléctrico Honda", 
    tipo: "Renta", 
    estado: "Entregado", 
    fecha: "2025-04-08",
    fechaEntrega: "2025-04-09",
    fechaDevolucion: "2025-04-16",
    total: 2800.00,
    detalles: "Renta por 7 días para evento. Incluye tanque de combustible lleno."
  },
  { 
    id: "ORD-2025-006", 
    cliente: "Laura Gómez", 
    clienteId: "CLI-006",
    email: "laura.gomez@example.com",
    telefono: "+52 555 345 6789",
    direccion: "Av. Chapultepec 567, CDMX",
    productoId: "PROD-005", 
    producto: "Mezcladora de concreto CIPSA", 
    tipo: "Renta", 
    estado: "En proceso", 
    fecha: "2025-04-11",
    fechaEntrega: "2025-04-14",
    fechaDevolucion: "2025-04-21",
    total: 1800.00,
    detalles: "Renta por 7 días. Cliente solicita entrega e instalación en obra."
  }
];

// Card component for orders
const OrderCard = ({ order, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Entregado": return "bg-emerald-500";
      case "En proceso": return "bg-sky-500";
      case "Pendiente": return "bg-amber-500";
      default: return "bg-slate-500";
    }
  };

  const getTypeColor = (type) => {
    return type === "Renta" ? "border-rose-500 text-rose-700" : "border-blue-500 text-blue-700";
  };

  const getTypeIcon = (type) => {
    return type === "Renta" ? 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg> :
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>;
  };

  return (
    <Card 
      onClick={onClick} 
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative w-full"
    >
      {/* Status badge in top right corner */}
      <div className={`absolute top-2 right-2 ${getStatusColor(order.estado)} text-white text-[10px] font-medium px-2 py-0.5 rounded-sm z-10`}>
        {order.estado}
      </div>

      <CardHeader className="pb-1 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold truncate max-w-[80%]">{order.id}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {order.fecha}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Cliente:
            </span>
            <span className="text-xs font-semibold truncate max-w-[150px] sm:max-w-[120px]">{order.cliente}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Total:</span>
            <span className="text-xs font-bold">${order.total.toLocaleString()}</span>
          </div>
          
          {/* Type badge at bottom */}
          <div className="pt-2">
            <div className={`${getTypeColor(order.tipo)} bg-white border text-xs font-medium px-3 py-1 rounded-md w-full text-center flex items-center justify-center gap-1`}>
              {getTypeIcon(order.tipo)}
              {order.tipo}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function OrdersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  
  // Estados para edición
  const [editFechaEntrega, setEditFechaEntrega] = useState("");
  const [editDireccion, setEditDireccion] = useState("");

  // Filter orders based on search term and filters
  const filteredOrders = orderData.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.producto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || order.tipo === selectedType;
    const matchesStatus = selectedStatus === "all" || order.estado === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setEditFechaEntrega(order.fechaEntrega || "");
    setEditDireccion(order.direccion || "");
    setActiveTab("view");
    setIsDialogOpen(true);
  };
  
  const handleSaveChanges = () => {
    // Aquí se implementaría la lógica para guardar los cambios en el backend
    // Por ahora, solo actualizamos el estado local
    setSelectedOrder(prev => ({
      ...prev,
      fechaEntrega: editFechaEntrega,
      direccion: editDireccion
    }));
    
    // Cambiar a la pestaña de visualización después de guardar
    setActiveTab("view");
  };

  return (
    <>
      {/* Responsive Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar pedidos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Type filter */}
          <div className="w-full sm:w-40">
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Tipo de pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Renta">Renta</SelectItem>
                <SelectItem value="Compra">Compra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status filter */}
          <div className="w-full sm:w-40">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En proceso">En proceso</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        

      </div>

      {/* Grid of order cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 max-w-full overflow-x-hidden">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <OrderCard 
                order={order} 
                onClick={() => handleOrderClick(order)} 
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 py-8 text-center text-gray-500">
            No se encontraron pedidos con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Order details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>Pedido {selectedOrder?.id}</span>
              <span className={`text-sm ${selectedOrder?.estado === "Entregado" ? "bg-emerald-500" : selectedOrder?.estado === "En proceso" ? "bg-sky-500" : "bg-amber-500"} text-white px-3 py-1 rounded-full`}>
                {selectedOrder?.estado}
              </span>
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              {selectedOrder?.producto} - {selectedOrder?.cliente}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 z-10">
                <TabsTrigger value="view" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Visualizar
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Editar
                </TabsTrigger>
              </TabsList>
              
              {/* Vista de visualización */}
              <TabsContent value="view" className="space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Order information */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">Información del Pedido</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tipo:</span>
                          <span className="text-sm font-semibold">{selectedOrder.tipo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fecha:</span>
                          <span className="text-sm">{selectedOrder.fecha}</span>
                        </div>
                        {selectedOrder.fechaEntrega && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Entrega:</span>
                            <span className="text-sm">{selectedOrder.fechaEntrega}</span>
                          </div>
                        )}
                        {selectedOrder.fechaDevolucion && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Devolución:</span>
                            <span className="text-sm">{selectedOrder.fechaDevolucion}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="text-sm font-bold">${selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">Producto</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID:</span>
                          <span className="text-sm">{selectedOrder.productoId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nombre:</span>
                          <span className="text-sm">{selectedOrder.producto}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client information */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">Información del Cliente</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID:</span>
                          <span className="text-sm">{selectedOrder.clienteId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nombre:</span>
                          <span className="text-sm">{selectedOrder.cliente}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm">{selectedOrder.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Teléfono:</span>
                          <span className="text-sm">{selectedOrder.telefono}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">Detalles</h3>
                      <p className="text-sm text-gray-600">{selectedOrder.detalles}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Dirección de Entrega</h3>
                    <p className="text-sm text-gray-600">{selectedOrder.direccion}</p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Vista de edición */}
              <TabsContent value="edit" className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Editar Información de Entrega</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaEntrega" className="text-sm">Fecha de Entrega</Label>
                      <Input 
                        id="fechaEntrega" 
                        type="date" 
                        value={editFechaEntrega}
                        onChange={(e) => setEditFechaEntrega(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="direccion" className="text-sm">Dirección de Entrega</Label>
                      <Input 
                        id="direccion" 
                        value={editDireccion}
                        onChange={(e) => setEditDireccion(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab("view")}>Cancelar</Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1" 
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}


        </DialogContent>
      </Dialog>
    </>
  );
}
