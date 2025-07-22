import React from 'react';
import { Badge } from "@/components/ui/badge";

// Componente para mostrar los detalles de un pedido en formato desktop
export const OrderDetailsDesktop = ({ order }) => {
  if (!order) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Información del Pedido</h3>
        <p><span className="text-gray-500">ID:</span> {order.id}</p>
        <p><span className="text-gray-500">Cliente:</span> {order.cliente}</p>
        <p><span className="text-gray-500">Referencia:</span> {order.referencia}</p>
        <p><span className="text-gray-500">Guía de envío:</span> {order.guia}</p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Estado y Fechas</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Tipo:</span>
          <Badge variant="outline" className={
            order.tipo === 'Compra' || order.tipo === 'PURCHASE'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-green-100 text-green-800 border-green-300'
          }>
            {order.tipo}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Estado Envío:</span>
          <Badge variant="outline" className={
            order.estado === 'Pendiente' || order.estado === 'PENDING'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : order.estado === 'Enviado' || order.estado === 'SHIPPED'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : order.estado === 'Entregado' || order.estado === 'DELIVERED'
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300'
          }>
            {order.estado}
          </Badge>
        </div>
        <p><span className="text-gray-500">Fecha:</span> {order.fecha && order.fecha !== '-' ? order.fecha : '-'}</p>
        <p><span className="text-gray-500">Entrega estimada:</span> {order.fechaEntrega && order.fechaEntrega !== '-' ? order.fechaEntrega : '-'}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Estatus:</span>
          <Badge variant="outline" className={
            order.estatus === 'Activo' || order.estatus === 'ACTIVE'
              ? 'bg-green-100 text-green-800 border-green-300'
              : order.estatus === 'Inactivo' || order.estatus === 'INACTIVE'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-gray-100 text-gray-800 border-gray-300'
          }>
            {order.estatus}
          </Badge>
        </div>
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
        <h3 className="font-semibold text-sm">Pedido</h3>
        <p className="text-sm"><span className="text-gray-500">ID:</span> {order.id}</p>
        <p className="text-sm"><span className="text-gray-500">Cliente:</span> {order.cliente}</p>
        <p className="text-sm"><span className="text-gray-500">Referencia:</span> {order.referencia}</p>
        <p className="text-sm"><span className="text-gray-500">Guía de envío:</span> {order.guia}</p>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Fechas</h3>
        <p className="text-xs"><span className="text-gray-500">Fecha:</span> {order.fecha && order.fecha !== '-' ? order.fecha : '-'}</p>
        <p className="text-xs"><span className="text-gray-500">Entrega estimada:</span> {order.fechaEntrega && order.fechaEntrega !== '-' ? order.fechaEntrega : '-'}</p>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Tipo y Estatus</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Tipo:</span>
          <Badge variant="outline" className={
            order.tipo === 'Compra' || order.tipo === 'PURCHASE'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-green-100 text-green-800 border-green-300'
          }>
            {order.tipo}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500">Estado Envío:</span>
          <Badge variant="outline" className={
            order.estado === 'Pendiente' || order.estado === 'PENDING'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : order.estado === 'Enviado' || order.estado === 'SHIPPED'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : order.estado === 'Entregado' || order.estado === 'DELIVERED'
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300'
          }>
            {order.estado}
          </Badge>
        </div>
        <p className="text-sm mt-1"><span className="text-gray-500">Guía de envío:</span> <span className="text-gray-900">{order.guia}</span></p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500">Estatus:</span>
          <Badge variant="outline" className={
            order.estatus === 'Activo' || order.estatus === 'ACTIVE'
              ? 'bg-green-100 text-green-800 border-green-300'
              : order.estatus === 'Inactivo' || order.estatus === 'INACTIVE'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-gray-100 text-gray-800 border-gray-300'
          }>
            {order.estatus}
          </Badge>
        </div>
      </div>
    </div>
  );
};
