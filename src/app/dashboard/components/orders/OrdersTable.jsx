import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Eye, Send, ExternalLink, Package } from "lucide-react";

const ESTADOS = [
  'Pendiente',
  'En Revisión',
  'En Proceso',
  'Listo para Entrega',
  'Entregado'
];

export const OrdersTable = ({ orders, onOrderClick, onSendGuide }) => {
  // Handler para mandar guía
  const handleSendGuide = (order) => {
    if (onSendGuide) onSendGuide(order);
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

  // Función para renderizar la guía de envío
  const renderShippingGuide = (guia) => {
    if (guia === 'Pendiente') {
      return (
        <div className="flex items-center justify-center gap-1">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500 italic text-sm">{guia}</span>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center">
          <a 
            href={guia} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={guia}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      );
    }
  };

  // Función para mostrar el método de pago
  const renderPaymentMethod = (metodoPago) => {
    if (!metodoPago || metodoPago === '-') return '-';
    
    const metodo = metodoPago.toLowerCase();
    if (metodo.includes('tarjeta de crédito') || metodo.includes('credit card')) {
      return 'Efectivo';
    }
    return metodoPago;
  };

  return (
    <>
      {/* Mobile: Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 cursor-pointer border hover:shadow-md transition"
            onClick={() => onOrderClick(order)}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-base">{order.id}</span>
              <Badge variant="outline" className={getTypeBadgeColor(order.tipo)}>
                {order.tipo}
              </Badge>
            </div>
            <div className="text-sm text-gray-700 font-medium truncate">{order.cliente}</div>
            <div className="text-xs text-gray-500">Método de pago: {renderPaymentMethod(order.metodoPago)}</div>
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <span className="text-xs text-gray-500">Estado Envío:</span>
              <Badge variant="outline" className={getShippingStatusBadgeColor(order.estado)}>
                {order.estado}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Guía de envío:</span>
              {renderShippingGuide(order.guia)}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
              <span>Fecha: {order.fecha}</span>
              <span>Entrega estimada: {order.fechaEntrega}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-blue-600 text-sm font-medium"
                onClick={e => { e.stopPropagation(); onOrderClick(order); }}
              >
                <Eye size={18} /> Ver
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-gray-100 hover:bg-emerald-50 text-emerald-600 text-sm font-medium"
                onClick={e => { e.stopPropagation(); handleSendGuide(order); }}
              >
                <Send size={18} /> {order.guia === 'Pendiente' ? 'Asignar guía' : 'Actualizar guía'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Tabla */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Método Pago</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Envío</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Guía de envío</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega estimada</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOrderClick(order)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{order.cliente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <Badge variant="outline" className={getTypeBadgeColor(order.tipo)}>
                      {order.tipo}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {renderPaymentMethod(order.metodoPago)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <Badge variant="outline" className={getShippingStatusBadgeColor(order.estado)}>
                      {order.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {renderShippingGuide(order.guia)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{order.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{order.fechaEntrega}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center flex gap-2 justify-center">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={e => { e.stopPropagation(); onOrderClick(order); }}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="text-emerald-600 hover:text-emerald-900"
                      onClick={e => { e.stopPropagation(); handleSendGuide(order); }}
                    >
                      <Send size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
