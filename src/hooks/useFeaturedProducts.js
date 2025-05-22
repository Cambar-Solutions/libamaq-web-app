import { useQuery } from '@tanstack/react-query';
import { items } from '@/App'; // Importamos los items desde App.jsx

/**
 * Hook para obtener los modelos representativos
 * Este hook simula una petición a la API, pero en realidad utiliza los datos estáticos
 * definidos en App.jsx. En un entorno real, aquí se haría una petición a la API.
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: () => {
      // Simulamos una petición asíncrona
      return new Promise((resolve) => {
        // Devolvemos los items después de un pequeño delay para simular una petición
        setTimeout(() => {
          resolve(items);
        }, 100);
      });
    },
    // Estos datos casi nunca cambian, así que podemos cachearlos por más tiempo
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 días
    // Inicializamos con los datos estáticos para evitar parpadeos
    initialData: items,
  });
}
