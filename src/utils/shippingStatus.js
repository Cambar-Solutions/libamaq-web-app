// Utilidad para manejar los estados de envío
export const getShippingStatusInfo = (shippingStatus) => {
  const status = shippingStatus?.toUpperCase() || 'PENDING';
  
  const statusConfig = {
    'PENDING': {
      label: 'Pendiente',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300'
    },
    'PENDIENTE': {
      label: 'Pendiente',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300'
    },
    'SHIPPED': {
      label: 'Enviado',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300'
    },
    'ENVIADO': {
      label: 'Enviado',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300'
    },
    'DELIVERED': {
      label: 'Entregado',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300'
    },
    'ENTREGADO': {
      label: 'Entregado',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300'
    },
    'IN_TRANSIT': {
      label: 'En tránsito',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300'
    },
    'EN_TRANSITO': {
      label: 'En tránsito',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300'
    }
  };

  return statusConfig[status] || statusConfig['PENDING'];
};

// Función para obtener las clases CSS del badge
export const getShippingStatusClasses = (shippingStatus) => {
  const statusInfo = getShippingStatusInfo(shippingStatus);
  return `${statusInfo.bgColor} ${statusInfo.textColor}`;
};

// Función para obtener el label del estado
export const getShippingStatusLabel = (shippingStatus) => {
  const statusInfo = getShippingStatusInfo(shippingStatus);
  return statusInfo.label;
}; 