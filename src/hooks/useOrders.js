import { useQuery } from '@tanstack/react-query';
import { getOrdersByUser } from '@/services/public/orderService';

export const useOrders = (userId) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => getOrdersByUser(userId),
    enabled: !!userId,
    refetchInterval: 15000, // Recarga cada 15 segundos
    refetchIntervalInBackground: true, // Continúa recargando incluso cuando la pestaña no está activa
    staleTime: 10000, // Los datos se consideran frescos por 10 segundos
    cacheTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
}; 