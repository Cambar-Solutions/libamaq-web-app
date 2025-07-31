import { useEffect, useState } from 'react';
import { getShippingStatusInfo } from '@/utils/shippingStatus';

export const useShippingStatus = (selected) => {
  const [localStatus, setLocalStatus] = useState(
    (selected?.shippingStatus || selected?.status || 'PENDING').toUpperCase()
  );

  useEffect(() => {
    if (selected) {
      const newStatus = (selected.shippingStatus || selected.status || 'PENDING').toUpperCase();
      setLocalStatus(newStatus);
    }
  }, [selected?.id, selected?.shippingStatus, selected?.status]);

  const statusInfo = getShippingStatusInfo(selected?.shippingStatus || localStatus);
  
  return {
    localStatus,
    setLocalStatus,
    statusInfo,
    statusLabel: statusInfo.label,
    statusColor: statusInfo.textColor.replace('text-', 'text-')
  };
}; 