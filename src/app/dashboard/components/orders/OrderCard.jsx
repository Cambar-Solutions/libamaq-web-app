import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, CreditCard, DollarSign } from 'lucide-react';

export const OrderCard = ({ order, columnId }) => {
  // Configuración para hacer esta tarjeta arrastrable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: order.id,
    data: {
      order,
      columnId,
      type: 'order',
    },
  });

  // Estilos para el elemento arrastrable
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Función para formatear el precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Determinar el color del badge según el tipo de pedido
  const getBadgeColor = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'renta':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'compra':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Determinar el icono según el método de pago (simulado)
  const getPaymentIcon = () => {
    // Simulamos que algunos pedidos son en efectivo y otros con tarjeta
    const isEfectivo = order.id.endsWith('1') || order.id.endsWith('3') || order.id.endsWith('5');
    
    return isEfectivo ? 
      <DollarSign className="h-4 w-4 text-green-600" /> : 
      <CreditCard className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation cursor-grab active:cursor-grabbing"
    >
      <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm truncate">{order.id}</h4>
            <div className="flex items-center space-x-1">
              {getPaymentIcon()}
              <Badge variant="outline" className={`text-xs ${getBadgeColor(order.tipo)}`}>
                {order.tipo}
              </Badge>
            </div>
          </div>
          
          <div className="text-sm mb-2 truncate">{order.producto}</div>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="truncate">{order.cliente}</div>
            <div className="font-semibold">{formatPrice(order.total)}</div>
          </div>
        </CardContent>
        
        <CardFooter className="p-2 pt-0 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {new Date(order.fecha).toLocaleDateString('es-MX', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
          </div>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};
