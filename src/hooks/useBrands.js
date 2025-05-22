import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllBrands, 
  getAllActiveBrands, 
  getBrandById, 
  createBrand, 
  updateBrand, 
  changeBrandStatus 
} from '../services/admin/brandService';
import { toast } from 'sonner';

// Hook para obtener todas las marcas
export const useAllBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getAllBrands,
    staleTime: 5 * 60 * 1000, // 5 minutos
    onError: (error) => {
      console.error('Error al obtener marcas:', error);
      toast.error('Error al cargar las marcas');
    }
  });
};

// Hook para obtener solo las marcas activas
export const useActiveBrands = () => {
  return useQuery({
    queryKey: ['brands', 'active'],
    queryFn: getAllActiveBrands,
    staleTime: 5 * 60 * 1000, // 5 minutos
    onError: (error) => {
      console.error('Error al obtener marcas activas:', error);
      toast.error('Error al cargar las marcas activas');
    }
  });
};

// Hook para obtener una marca por su ID
export const useBrandById = (id) => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => getBrandById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    onError: (error) => {
      console.error(`Error al obtener marca con ID ${id}:`, error);
      toast.error('Error al cargar los detalles de la marca');
    }
  });
};

// Hook para crear una nueva marca
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success('Marca creada correctamente');
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Error al crear marca:', error);
      toast.error(`Error al crear la marca: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para actualizar una marca existente
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateBrand,
    onSuccess: () => {
      toast.success('Marca actualizada correctamente');
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Error al actualizar marca:', error);
      toast.error(`Error al actualizar la marca: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para cambiar el estado de una marca (activar/desactivar)
export const useChangeBrandStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newStatus }) => changeBrandStatus(id, newStatus),
    onSuccess: (_, variables) => {
      const actionText = variables.newStatus === 'ACTIVE' ? 'activada' : 'desactivada';
      toast.success(`Marca ${actionText} correctamente`);
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Error al cambiar estado de marca:', error);
      toast.error(`Error al cambiar estado: ${error.message || 'Error desconocido'}`);
    }
  });
};
