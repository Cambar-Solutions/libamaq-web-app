import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { OrderCard } from './OrderCard';

export const KanbanColumn = ({ id, title, color, orders, isMobile }) => {
  // Configuración para hacer esta columna un área donde se pueden soltar elementos
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      columnId: id,
      type: 'column',
    },
  });
  
  // Aplicamos estilos visuales cuando un elemento está siendo arrastrado sobre esta columna
  const columnStyle = isOver ? {
    backgroundColor: '#f0f9ff', // Azul muy claro
    boxShadow: '0 0 0 2px #3b82f6', // Borde azul
    transition: 'all 0.2s ease'
  } : {};

  return (
    <div 
      ref={setNodeRef}
      style={columnStyle}
      className={`
        ${isMobile ? 'w-full' : 'w-full min-w-[250px]'}
        bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col
      `}
    >
      {/* Encabezado de la columna */}
      <div className={`p-3 ${color} text-white font-semibold rounded-t-lg flex items-center justify-between`}>
        <h3>{title}</h3>
        <span className="bg-white text-gray-800 text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
          {orders.length}
        </span>
      </div>
      
      {/* Contenido de la columna - lista de pedidos */}
      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
        <SortableContext items={orders.map(order => order.id)} strategy={verticalListSortingStrategy}>
          {orders.length > 0 ? (
            <div className="space-y-2">
              {orders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  columnId={id}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-sm">Sin pedidos</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
