import { useQuery } from '@tanstack/react-query';
import { 
  getAllPublicProducts, 
  getProductById, 
  getProductsByBrand, 
  getProductsByCategoryAndBrand 
} from '@/services/public/productService';

/**
 * Hook para obtener todos los productos activos
 */
export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: getAllPublicProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para obtener un producto específico por ID
 * @param {string|number} id - ID del producto
 */
export function useProductById(id) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => getProductById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    enabled: !!id, // Solo ejecutar la consulta si hay un ID
  });
}

/**
 * Hook para obtener productos por marca
 * @param {string|number} brandId - ID de la marca
 */
export function useProductsByBrand(brandId) {
  return useQuery({
    queryKey: ['products', 'brand', brandId],
    queryFn: () => getProductsByBrand(brandId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    enabled: !!brandId, // Solo ejecutar la consulta si hay un brandId
  });
}

/**
 * Hook para obtener productos por categoría y marca
 * @param {string|number} categoryId - ID de la categoría
 * @param {string|number} brandId - ID de la marca
 */
export function useProductsByCategoryAndBrand(categoryId, brandId) {
  return useQuery({
    queryKey: ['products', 'category', categoryId, 'brand', brandId],
    queryFn: () => getProductsByCategoryAndBrand(categoryId, brandId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    enabled: !!categoryId && !!brandId, // Solo ejecutar si hay categoryId y brandId
  });
}
