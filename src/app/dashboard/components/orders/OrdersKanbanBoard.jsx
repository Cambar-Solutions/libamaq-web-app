import React, { useState, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';

const OrdersKanbanBoard = ({ orders }) => {
  // Estados para el tablero
  const [columns, setColumns] = useState([
    { id: 'pendiente', title: 'Pendiente', color: 'bg-yellow-500' },
    { id: 'revision', title: 'En Revisión', color: 'bg-blue-500' },
    { id: 'proceso', title: 'En Proceso', color: 'bg-purple-500' },
    { id: 'listo', title: 'Listo para Entrega', color: 'bg-green-500' },
    { id: 'entregado', title: 'Entregado', color: 'bg-gray-500' }
  ]);

  // Organizamos los pedidos por columna
  const [ordersMap, setOrdersMap] = useState(() => {
    const initialOrdersMap = {};
    columns.forEach(column => {
      initialOrdersMap[column.id] = orders.filter(order => 
        order.estado.toLowerCase() === column.title.toLowerCase() ||
        (column.id === 'pendiente' && order.estado === 'Pendiente')
      );
    });
    return initialOrdersMap;
  });

  // Detectamos si estamos en móvil
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Efecto para actualizar el mapa de pedidos cuando cambian los pedidos de entrada
  useEffect(() => {
    // Organizamos los pedidos por columna
    const initialOrdersMap = {};
    columns.forEach(column => {
      initialOrdersMap[column.id] = orders.filter(order => {
        if (column.id === 'pendiente' && order.estado === 'Pendiente') return true;
        if (column.id === 'revision' && order.estado === 'En Revisión') return true;
        if (column.id === 'proceso' && order.estado === 'En Proceso') return true;
        if (column.id === 'listo' && order.estado === 'Listo para Entrega') return true;
        if (column.id === 'entregado' && order.estado === 'Entregado') return true;
        return false;
      });
    });
    setOrdersMap(initialOrdersMap);
  }, [orders]);

  // Ya no necesitamos el manejador de drag and drop aquí
  // porque ahora lo maneja el componente padre con el DndContext unificado

  return (
    <div className="w-full px-2">
      <h2 className="text-2xl font-bold mb-4 px-2">Tablero de Pedidos</h2>
      
      {/* Contenedor del tablero */}
      <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'} gap-3 w-full`}>
        {/* Ajustamos el grid para mejor distribución en diferentes tamaños de pantalla */}
        {/* Columnas del tablero Kanban */}
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            orders={ordersMap[column.id] || []}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

export default OrdersKanbanBoard;
