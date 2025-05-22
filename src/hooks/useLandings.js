import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllActiveLandings, 
  getLandings,
  getLandingById, 
  createLanding, 
  updateLanding, 
  changeLandingStatus,
  deleteLanding,
  uploadLandingFile,
  deleteLandingFile
} from '../services/admin/landingService';
import { toast } from 'sonner';

// Hook para obtener todos los landings activos
export const useActiveLandings = () => {
  return useQuery({
    queryKey: ['landings', 'active'],
    queryFn: async () => {
      try {
        const data = await getAllActiveLandings();
        console.log('Datos obtenidos de getAllActiveLandings:', data);
        return data;
      } catch (error) {
        console.error('Error en useActiveLandings:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Solo reintentar una vez
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener landings activos:', error);
      toast.error('Error al cargar los contenidos activos');
    }
  });
};

// Hook para obtener landings con filtrado y paginación
export const useLandings = (options = {}) => {
  const { page = 1, limit = 10, type, status, search } = options;
  
  return useQuery({
    queryKey: ['landings', { page, limit, type, status, search }],
    queryFn: () => getLandings(options),
    staleTime: 5 * 60 * 1000, // 5 minutos
    keepPreviousData: true, // Mantener datos anteriores mientras se cargan los nuevos
    onError: (error) => {
      console.error('Error al obtener landings:', error);
      toast.error('Error al cargar los contenidos');
    }
  });
};

// Hook para obtener un landing por su ID
export const useLandingById = (id) => {
  return useQuery({
    queryKey: ['landings', id],
    queryFn: () => getLandingById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    onError: (error) => {
      console.error(`Error al obtener landing con ID ${id}:`, error);
      toast.error('Error al cargar los detalles del contenido');
    }
  });
};

// Hook para crear un nuevo landing
export const useCreateLanding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createLanding,
    onSuccess: () => {
      toast.success('Contenido creado correctamente');
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['landings'] });
    },
    onError: (error) => {
      console.error('Error al crear landing:', error);
      toast.error(`Error al crear el contenido: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para actualizar un landing existente
export const useUpdateLanding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateLanding,
    onSuccess: () => {
      toast.success('Contenido actualizado correctamente');
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['landings'] });
    },
    onError: (error) => {
      console.error('Error al actualizar landing:', error);
      toast.error(`Error al actualizar el contenido: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para cambiar el estado de un landing (activar/desactivar)
export const useChangeLandingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeLandingStatus,
    onSuccess: (_, variables) => {
      const actionText = variables.status === 'ACTIVE' ? 'activado' : 'desactivado';
      toast.success(`Contenido ${actionText} correctamente`);
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['landings'] });
    },
    onError: (error) => {
      console.error('Error al cambiar estado de landing:', error);
      toast.error(`Error al cambiar estado: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para eliminar un landing
export const useDeleteLanding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteLanding,
    onSuccess: () => {
      toast.success('Contenido eliminado correctamente');
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['landings'] });
    },
    onError: (error) => {
      console.error('Error al eliminar landing:', error);
      toast.error(`Error al eliminar el contenido: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para subir un archivo multimedia
export const useUploadLandingFile = () => {
  return useMutation({
    mutationFn: uploadLandingFile,
    onSuccess: () => {
      toast.success('Archivo subido correctamente');
    },
    onError: (error) => {
      console.error('Error al subir archivo:', error);
      toast.error(`Error al subir el archivo: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook para eliminar un archivo multimedia
export const useDeleteLandingFile = () => {
  return useMutation({
    mutationFn: deleteLandingFile,
    onSuccess: () => {
      toast.success('Archivo eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error al eliminar archivo:', error);
      toast.error(`Error al eliminar el archivo: ${error.message || 'Error desconocido'}`);
    }
  });
};

// Hook combinado para gestionar archivos y landings juntos
export const useLandingWithFile = () => {
  const queryClient = useQueryClient();
  const uploadFile = useUploadLandingFile();
  const createLandingMutation = useCreateLanding();
  const updateLandingMutation = useUpdateLanding();
  
  // Función para crear un landing con archivo
  const createLandingWithFile = async ({ file, landingData }) => {
    try {
      // Si hay un archivo, primero lo subimos
      if (file) {
        const fileResponse = await uploadFile.mutateAsync(file);
        // Actualizar la URL en los datos del landing
        landingData.url = fileResponse.url;
      }
      
      // Luego creamos el landing con la URL del archivo
      return await createLandingMutation.mutateAsync(landingData);
    } catch (error) {
      console.error('Error en la operación combinada:', error);
      throw error;
    }
  };
  
  // Función para actualizar un landing con archivo
  const updateLandingWithFile = async ({ file, landingData, previousUrl }) => {
    try {
      // Si hay un nuevo archivo, primero lo subimos
      if (file) {
        const fileResponse = await uploadFile.mutateAsync(file);
        // Actualizar la URL en los datos del landing
        landingData.url = fileResponse.url;
      }
      
      // Luego actualizamos el landing
      const result = await updateLandingMutation.mutateAsync(landingData);
      
      // Si se cambió el archivo, eliminar el anterior
      if (file && previousUrl && previousUrl !== landingData.url) {
        try {
          await deleteLandingFile(previousUrl);
        } catch (deleteError) {
          console.error('Error al eliminar archivo anterior:', deleteError);
          // No interrumpimos la operación si falla la eliminación
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error en la operación combinada:', error);
      throw error;
    }
  };
  
  return {
    createLandingWithFile,
    updateLandingWithFile,
    isLoading: uploadFile.isLoading || createLandingMutation.isLoading || updateLandingMutation.isLoading,
    isError: uploadFile.isError || createLandingMutation.isError || updateLandingMutation.isError,
    error: uploadFile.error || createLandingMutation.error || updateLandingMutation.error
  };
};
