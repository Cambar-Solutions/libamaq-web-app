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
  const [orders, setOrders] = useState(orderData); // Esta es tu lista completa de pedidos
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Eliminamos searchQuery, ya que vendrá de activeFilters
  const [activeFilters, setActiveFilters] = useState({
    search: undefined, // Inicializamos search como undefined
    type: null,
    payment: null,
    status: null, // El filtro de estado global, si es necesario además del Kanban
    period: 'todos'
  });
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
    let passesFilters = true;

    // 1. Filtro por búsqueda (search ya viene con la lógica de >= 2 caracteres o undefined)
    if (activeFilters.search) {
      const searchTermLower = activeFilters.search.toLowerCase();
      const searchInId = order.id?.toString().toLowerCase().includes(searchTermLower);
      // Asumo que 'cliente' es un string con el nombre. Si es un objeto, ajusta el acceso.
      const searchInCliente = order.cliente?.toLowerCase().includes(searchTermLower);
      // Asumo que 'producto' es un string. Si es una lista de productos, necesitarás iterar.
      const searchInProducto = order.producto?.toLowerCase().includes(searchTermLower);
      // Puedes añadir más campos aquí, por ejemplo:
      // const searchInNotes = order.notes?.toLowerCase().includes(searchTermLower);

      if (!(searchInId || searchInCliente || searchInProducto)) {
        passesFilters = false;
      }
    }
    
    // 2. Filtro por tipo (ej. 'renta', 'compra')
    if (passesFilters && activeFilters.type) {
      if (order.tipo?.toLowerCase() !== activeFilters.type.toLowerCase()) {
        passesFilters = false;
      }
    }
    
    // 3. Filtro por método de pago (ej. 'efectivo', 'transferencia')
    // Asumo que tienes un campo como 'metodoPago' en tu orderData
    if (passesFilters && activeFilters.payment) {
      if (order.metodoPago?.toLowerCase() !== activeFilters.payment.toLowerCase()) {
        passesFilters = false;
      }
    }

    // 4. Filtro por estado global (si es necesario además de las columnas Kanban)
    // El estado de la orden (order.estado) ya se usa para las columnas del Kanban.
    // Si OrdersFilters también puede filtrar por estado de forma global, aquí iría la lógica.
    // Por ejemplo, si FILTER_OPTIONS en OrdersFilters tiene 'status' y lo usas:
    if (passesFilters && activeFilters.status) {
      if (order.estado?.toLowerCase() !== activeFilters.status.toLowerCase()) {
        passesFilters = false;
      }
    }

    // 5. Filtro por período (requiere lógica de fechas más compleja)
    // Ejemplo conceptual (necesitarás adaptar esto con librerías de fechas si es necesario):
    if (passesFilters && activeFilters.period && activeFilters.period !== 'todos') {
      const orderDate = new Date(order.fecha); // Asume que 'order.fecha' existe y es parseable
      const today = new Date();
      let startDate, endDate = new Date(today);

      if (activeFilters.period === 'hoy') {
        startDate = new Date(today.setHours(0,0,0,0));
        endDate = new Date(today.setHours(23,59,59,999));
      } else if (activeFilters.period === 'semana') {
        const firstDayOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1); // Lunes como primer día
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
    <div className="container mx-auto py-4 px-2 md:px-4 w-full">
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
