import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Eye, Send } from "lucide-react";

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
              <Badge variant="outline" className={
                order.tipo === 'Compra' || order.tipo === 'PURCHASE'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-green-100 text-green-800 border-green-300'
              }>
                {order.tipo}
              </Badge>
            </div>
            <div className="text-sm text-gray-700 font-medium truncate">{order.cliente}</div>
            <div className="text-xs text-gray-500">Referencia: {order.referencia}</div>
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <span className="text-xs text-gray-500">Estado Envío:</span>
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
            <div className="text-xs text-gray-900">Guía de envío: {order.guia}</div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
              <span>Fecha: {order.fecha && order.fecha !== '-' ? order.fecha : '-'}</span>
              <span>Entrega estimada: {order.fechaEntrega && order.fechaEntrega !== '-' ? order.fechaEntrega : '-'}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <span className="text-xs text-gray-500">Estatus:</span>
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
                <Send size={18} /> Mandar guía
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Envío</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guía de envío</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega estimada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOrderClick(order)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.cliente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.referencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Badge variant="outline" className={
                      order.tipo === 'Compra' || order.tipo === 'PURCHASE'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-green-100 text-green-800 border-green-300'
                    }>
                      {order.tipo}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.guia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fechaEntrega}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge variant="outline" className={
                      order.estatus === 'Activo' || order.estatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : order.estatus === 'Inactivo' || order.estatus === 'INACTIVE'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                    }>
                      {order.estatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
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
