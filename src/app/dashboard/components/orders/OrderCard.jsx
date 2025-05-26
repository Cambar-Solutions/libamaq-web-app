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
      <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing text-xs">
        <CardContent className="p-2">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold truncate max-w-[100px]">{order.id}</h4>
            <div className="flex items-center gap-1">
              {getPaymentIcon()}
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getBadgeColor(order.tipo)}`}>
                {order.tipo}
              </Badge>
            </div>
          </div>
          
          <div className="mt-1 mb-1.5 truncate">{order.producto}</div>
          
          <div className="flex justify-between items-center text-gray-500">
            <div className="truncate max-w-[100px]">{order.cliente}</div>
            <div className="font-semibold">{formatPrice(order.total)}</div>
          </div>
        </CardContent>
        
        <CardFooter className="p-1.5 pt-0 flex justify-between items-center">
          <div className="text-gray-500 text-[11px]">
            {new Date(order.fecha).toLocaleDateString('es-MX', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
          </div>
          <button className="p-0.5 rounded-full hover:bg-gray-100">
            <Eye className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};
