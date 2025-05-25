import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Importamos los componentes del sistema Kanban
import OrdersKanbanBoard from "../components/orders/OrdersKanbanBoard";
import { OrdersFilters } from "../components/orders/OrdersFilters";
import { OrdersTable } from "../components/orders/OrdersTable";
import { OrderDetailDialogs } from "../components/orders/OrderDetailDialogs";

// Importamos los datos de muestra
import { orderData } from "../data/orderData";

export function OrdersView() {
  const [orders, setOrders] = useState(orderData);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState("kanban"); // kanban o tabla
  
  // Detectamos si estamos en móvil
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distancia mínima para activar el arrastre
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar pedidos según los filtros activos
  const filteredOrders = orders.filter(order => {
    // Filtro por búsqueda
    if (searchQuery && !(
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.producto.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    // Filtro por tipo (compra/renta)
    if (activeFilters.tipo && order.tipo.toLowerCase() !== activeFilters.tipo.toLowerCase()) {
      return false;
    }
    
    // Filtro por estado
    if (activeFilters.estado && order.estado.toLowerCase() !== activeFilters.estado.toLowerCase()) {
      return false;
    }
    
    return true;
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    
    // Usamos drawer en móvil y dialog en desktop
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

  // Manejador para cuando se completa un drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Si el destino es una columna, actualizamos el estado del pedido
    if (over.data.current.type === 'column') {
      // Mapa para convertir el ID de la columna al estado correcto
      const columnToStateMap = {
        'pendiente': 'Pendiente',
        'revision': 'En Revisión',
        'proceso': 'En Proceso',
        'listo': 'Listo para Entrega',
        'entregado': 'Entregado'
      };
      
      const columnId = over.data.current.columnId;
      const newState = columnToStateMap[columnId];
      
      if (!newState) return; // Si no hay un estado válido, no hacemos nada
      
      const updatedOrders = orders.map(order => {
        if (order.id === active.id) {
          // Aquí es donde actualizaríamos la API en una implementación real
          // updateOrderState(order.id, newState);
          
          return {
            ...order,
            estado: newState
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
    }
    // Si el destino es otra posición en la misma columna, reordenamos
    else if (active.id !== over.id) {
      const activeIndex = orders.findIndex(o => o.id === active.id);
      const overIndex = orders.findIndex(o => o.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrders = [...orders];
        const [removed] = newOrders.splice(activeIndex, 1);
        newOrders.splice(overIndex, 0, removed);
        setOrders(newOrders);
      }
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Gestión de Pedidos</h1>
        
        {/* Selector de vista */}
        <div className="flex mt-2 md:mt-0">
          <Tabs defaultValue="kanban" value={viewMode} onValueChange={setViewMode} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="tabla">Tabla</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      
      {/* Filtros */}
      <OrdersFilters onFilterChange={handleFilterChange} />
      
      {/* Contenido principal con DndContext unificado */}
      {viewMode === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Tablero Kanban */}
          <OrdersKanbanBoard orders={filteredOrders} />
        </DndContext>
      )}
      
      {/* Vista de tabla */}
      {viewMode === "tabla" && (
        <OrdersTable orders={filteredOrders} onOrderClick={handleOrderClick} />
      )}
      
      {/* Diálogos de detalles (desktop y móvil) */}
      <OrderDetailDialogs 
        selectedOrder={selectedOrder}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </div>
  );
}
