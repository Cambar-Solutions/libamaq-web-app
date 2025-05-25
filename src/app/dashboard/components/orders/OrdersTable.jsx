import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Edit, Eye } from "lucide-react";

export const OrdersTable = ({ orders, onOrderClick }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOrderClick(order)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.cliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.producto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Badge variant="outline" className={`
                    ${order.tipo === 'Renta' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300'}
                  `}>
                    {order.tipo}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.fecha).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Eye size={18} />
                  </button>
                  <button className="text-indigo-600 hover:text-indigo-900">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
