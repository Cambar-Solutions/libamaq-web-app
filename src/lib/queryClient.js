import { QueryClient } from '@tanstack/react-query';

// Crear una instancia del cliente de consulta
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 60 * 60 * 1000, // 1 hora
      refetchOnWindowFocus: false, // No recargar datos al enfocar la ventana
      retry: 1, // Solo reintentar una vez si falla
    },
  },
});
