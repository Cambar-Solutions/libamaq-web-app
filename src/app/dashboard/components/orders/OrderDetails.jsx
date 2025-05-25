import React from 'react';
import { Badge } from "@/components/ui/badge";

// Componente para mostrar los detalles de un pedido en formato desktop
export const OrderDetailsDesktop = ({ order }) => {
  if (!order) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Información del Cliente</h3>
        <p><span className="text-gray-500">Nombre:</span> {order.cliente}</p>
        <p><span className="text-gray-500">Email:</span> {order.email}</p>
        <p><span className="text-gray-500">Teléfono:</span> {order.telefono}</p>
        <p><span className="text-gray-500">Dirección:</span> {order.direccion}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Información del Pedido</h3>
        <p><span className="text-gray-500">Producto:</span> {order.producto}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Tipo:</span> 
          <Badge variant="outline" className={`
            ${order.tipo === 'Renta' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300'}
          `}>
            {order.tipo}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Estado:</span>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            order.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
            order.estado === 'En proceso' || order.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
            order.estado === 'En Revisión' ? 'bg-purple-100 text-purple-800' :
            order.estado === 'Listo para Entrega' ? 'bg-green-100 text-green-800' :
            order.estado === 'Entregado' ? 'bg-gray-100 text-gray-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {order.estado}
          </span>
        </div>
        <p><span className="text-gray-500">Fecha:</span> {new Date(order.fecha).toLocaleDateString()}</p>
        {order.fechaEntrega && (
          <p><span className="text-gray-500">Entrega:</span> {new Date(order.fechaEntrega).toLocaleDateString()}</p>
        )}
        {order.fechaDevolucion && (
          <p><span className="text-gray-500">Devolución:</span> {new Date(order.fechaDevolucion).toLocaleDateString()}</p>
        )}
        <p><span className="text-gray-500">Total:</span> {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.total)}</p>
      </div>
      
      <div className="col-span-1 md:col-span-2">
        <h3 className="font-semibold">Detalles</h3>
        <p className="text-gray-700">{order.detalles}</p>
      </div>
    </div>
  );
};

// Componente para mostrar los detalles de un pedido en formato móvil
export const OrderDetailsMobile = ({ order }) => {
  if (!order) return null;
  
  return (
    <div className="px-4 py-2 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Estado</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          order.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
          order.estado === 'En proceso' || order.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
          order.estado === 'En Revisión' ? 'bg-purple-100 text-purple-800' :
          order.estado === 'Listo para Entrega' ? 'bg-green-100 text-green-800' :
          order.estado === 'Entregado' ? 'bg-gray-100 text-gray-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {order.estado}
        </span>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Cliente</h3>
        <p className="text-sm">{order.cliente}</p>
        <p className="text-xs text-gray-500">{order.email}</p>
        <p className="text-xs text-gray-500">{order.telefono}</p>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Producto</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm">{order.producto}</p>
          <Badge variant="outline" className={`
            ${order.tipo === 'Renta' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300'}
          `}>
            {order.tipo}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Fechas</h3>
        <p className="text-xs"><span className="text-gray-500">Pedido:</span> {new Date(order.fecha).toLocaleDateString()}</p>
        {order.fechaEntrega && (
          <p className="text-xs"><span className="text-gray-500">Entrega:</span> {new Date(order.fechaEntrega).toLocaleDateString()}</p>
        )}
        {order.fechaDevolucion && (
          <p className="text-xs"><span className="text-gray-500">Devolución:</span> {new Date(order.fechaDevolucion).toLocaleDateString()}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Detalles</h3>
        <p className="text-sm text-gray-700">{order.detalles}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Total</h3>
        <p className="font-bold">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.total)}</p>
      </div>
    </div>
  );
};
