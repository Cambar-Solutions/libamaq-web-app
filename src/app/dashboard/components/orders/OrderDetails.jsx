import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Package } from "lucide-react";

// Función para renderizar la guía de envío
const renderShippingGuide = (guia) => {
  if (guia === 'Pendiente') {
    return (
      <div className="flex items-center gap-1">
        <Package className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500 italic">{guia}</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <a 
          href={guia} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title={guia}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <span className="text-xs text-gray-500">Ver seguimiento</span>
      </div>
    );
  }
};

// Función para obtener el color del badge según el tipo
const getTypeBadgeColor = (tipo) => {
  switch (tipo.toLowerCase()) {
    case 'compra':
    case 'purchase':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'renta':
    case 'rental':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'servicio':
    case 'service':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Función para obtener el color del badge según el estado de envío
const getShippingStatusBadgeColor = (estado) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'enviado':
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'entregado':
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'en tránsito':
    case 'in_transit':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Función para obtener el color del badge según el estatus
const getStatusBadgeColor = (estatus) => {
  switch (estatus.toLowerCase()) {
    case 'activo':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'inactivo':
    case 'inactive':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Componente para mostrar los detalles de un pedido en formato desktop
export const OrderDetailsDesktop = ({ order }) => {
  if (!order) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Información del Pedido</h3>
        <p><span className="text-gray-500">ID:</span> {order.id}</p>
        <p><span className="text-gray-500">Cliente:</span> {order.cliente}</p>
        <p><span className="text-gray-500">Método de pago:</span> {order.metodoPago}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Guía de envío:</span>
          {renderShippingGuide(order.guia)}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Estado y Fechas</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Tipo:</span>
          <Badge variant="outline" className={getTypeBadgeColor(order.tipo)}>
            {order.tipo}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Estado Envío:</span>
          <Badge variant="outline" className={getShippingStatusBadgeColor(order.estado)}>
            {order.estado}
          </Badge>
        </div>
        <p><span className="text-gray-500">Fecha:</span> {order.fecha}</p>
        <p><span className="text-gray-500">Entrega estimada:</span> {order.fechaEntrega}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Estatus:</span>
          <Badge variant="outline" className={getStatusBadgeColor(order.estatus)}>
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
        <Badge variant="outline" className={getShippingStatusBadgeColor(order.estado)}>
          {order.estado}
        </Badge>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Pedido</h3>
        <p className="text-sm"><span className="text-gray-500">ID:</span> {order.id}</p>
        <p className="text-sm"><span className="text-gray-500">Cliente:</span> {order.cliente}</p>
        <p className="text-sm"><span className="text-gray-500">Método de pago:</span> {order.metodoPago}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Guía de envío:</span>
          {renderShippingGuide(order.guia)}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Fechas</h3>
        <p className="text-xs"><span className="text-gray-500">Fecha:</span> {order.fecha}</p>
        <p className="text-xs"><span className="text-gray-500">Entrega estimada:</span> {order.fechaEntrega}</p>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Tipo y Estatus</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Tipo:</span>
          <Badge variant="outline" className={getTypeBadgeColor(order.tipo)}>
            {order.tipo}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500">Estado Envío:</span>
          <Badge variant="outline" className={getShippingStatusBadgeColor(order.estado)}>
            {order.estado}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500">Estatus:</span>
          <Badge variant="outline" className={getStatusBadgeColor(order.estatus)}>
            {order.estatus}
          </Badge>
        </div>
      </div>
    </div>
  );
};
