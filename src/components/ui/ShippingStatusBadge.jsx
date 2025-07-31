import React from 'react';
import { getShippingStatusClasses, getShippingStatusLabel } from '@/utils/shippingStatus';

const ShippingStatusBadge = ({ shippingStatus, size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg'
  };

  return (
    <span className={`rounded-full font-medium ${getShippingStatusClasses(shippingStatus)} ${sizeClasses[size]} ${className}`}>
      {getShippingStatusLabel(shippingStatus)}
    </span>
  );
};

export default ShippingStatusBadge; 