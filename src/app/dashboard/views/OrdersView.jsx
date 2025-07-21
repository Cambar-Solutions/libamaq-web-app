import { useState } from "react";
import { OrdersFilters } from "../components/orders/OrdersFilters";
import { OrdersTable } from "../components/orders/OrdersTable";
import { OrderDetailDialogs } from "../components/orders/OrderDetailDialogs";
import { orderData } from "../data/orderData";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { OrderSendGuideDialog } from "../components/orders/OrderSendGuideDialog";

export function OrdersView() {
  const [orders, setOrders] = useState(orderData);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    search: undefined,
    type: null,
    payment: null,
    status: null,
    period: 'todos'
  });
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Estado para el modal de guía
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [orderForGuide, setOrderForGuide] = useState(null);
  const [isSavingGuide, setIsSavingGuide] = useState(false);

  // Filtrar pedidos según los filtros activos
  const filteredOrders = orders.filter(order => {
    let passesFilters = true;
    if (activeFilters.search) {
      const searchTermLower = activeFilters.search.toLowerCase();
      const searchInId = order.id?.toString().toLowerCase().includes(searchTermLower);
      const searchInCliente = order.cliente?.toLowerCase().includes(searchTermLower);
      const searchInProducto = order.producto?.toLowerCase().includes(searchTermLower);
      if (!(searchInId || searchInCliente || searchInProducto)) {
        passesFilters = false;
      }
    }
    if (passesFilters && activeFilters.type) {
      if (order.tipo?.toLowerCase() !== activeFilters.type.toLowerCase()) {
        passesFilters = false;
      }
    }
    if (passesFilters && activeFilters.payment) {
      if (order.metodoPago?.toLowerCase() !== activeFilters.payment.toLowerCase()) {
        passesFilters = false;
      }
    }
    if (passesFilters && activeFilters.status) {
      if (order.estado?.toLowerCase() !== activeFilters.status.toLowerCase()) {
        passesFilters = false;
      }
    }
    if (passesFilters && activeFilters.period && activeFilters.period !== 'todos') {
      const orderDate = new Date(order.fecha);
      const today = new Date();
      let startDate, endDate = new Date(today);
      if (activeFilters.period === 'hoy') {
        startDate = new Date(today.setHours(0,0,0,0));
        endDate = new Date(today.setHours(23,59,59,999));
      } else if (activeFilters.period === 'semana') {
        const firstDayOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
        startDate = new Date(today.setDate(firstDayOfWeek));
        startDate.setHours(0,0,0,0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23,59,59,999);
      } else if (activeFilters.period === 'mes') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23,59,59,999);
      }
      if (startDate && !(orderDate >= startDate && orderDate <= endDate)) {
        passesFilters = false;
      }
    }
    return passesFilters;
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      ...filter
    }));
  };

  // Abrir modal de guía
  const handleSendGuide = (order) => {
    setOrderForGuide(order);
    setIsGuideDialogOpen(true);
  };

  // Guardar guía y estado
  const handleSaveGuide = (updatedOrder) => {
    setIsSavingGuide(true);
    setTimeout(() => { // Simula petición async
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, guiaUrl: updatedOrder.guiaUrl, estado: updatedOrder.estado } : o));
      setIsGuideDialogOpen(false);
      setOrderForGuide(null);
      setIsSavingGuide(false);
    }, 800);
  };

  return (
    <div className="container mx-auto py-4 px-2 md:px-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Gestión de Pedidos</h1>
      </div>
      <OrdersFilters onFilterChange={handleFilterChange} />
      <OrdersTable orders={filteredOrders} onOrderClick={handleOrderClick} onSendGuide={handleSendGuide} />
      <OrderDetailDialogs 
        selectedOrder={selectedOrder}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
      <OrderSendGuideDialog
        open={isGuideDialogOpen}
        onOpenChange={setIsGuideDialogOpen}
        order={orderForGuide}
        onSave={handleSaveGuide}
        onCancel={() => setIsGuideDialogOpen(false)}
        isLoading={isSavingGuide}
      />
    </div>
  );
}
