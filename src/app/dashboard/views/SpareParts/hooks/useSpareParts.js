import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getAllSpareParts, 
  getSparePartById, 
  createSparePart, 
  updateSparePart, 
  deleteSparePart,
  uploadSparePartMedia,
  getActiveSpareParts,
  createSparePartWithImages
} from '@/services/admin/sparePartService';
import { getActiveProducts } from '@/services/admin/productService';

export function useSpareParts() {
  const [spareParts, setSpareParts] = useState([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  // Cargar repuestos
  const fetchSpareParts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getActiveSpareParts();
      // La respuesta tiene la forma { data: [...], status: 200, message: 'success' }
      if (response && response.data) {
        setSpareParts(response.data);
        setFilteredSpareParts(response.data);
      } else {
        setSpareParts([]);
        setFilteredSpareParts([]);
      }
    } catch (err) {
      console.error('Error al cargar repuestos:', err);
      toast.error('Error al cargar repuestos');
      setSpareParts([]);
      setFilteredSpareParts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar productos para el selector de compatibilidad
  const fetchProducts = useCallback(async () => {
    try {
      const response = await getActiveProducts(1, 100);
      setProducts(response.content || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      toast.error('Error al cargar la lista de productos');
      setProducts([]);
    }
  }, []);

  // Filtrar repuestos según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      const filtered = spareParts.filter(
        (part) =>
          part.name?.toLowerCase().includes(lower) ||
          part.code?.toLowerCase().includes(lower) ||
          part.externalId?.toLowerCase().includes(lower)
      );
      setFilteredSpareParts(filtered);
    } else {
      setFilteredSpareParts(spareParts);
    }
  }, [searchTerm, spareParts]);

  // Crear un nuevo repuesto
  const createNewSparePart = async (sparePartData) => {
    try {
      setIsLoading(true);
      const { files, ...sparePart } = sparePartData;
      
      console.log('Creando nuevo repuesto con datos:', sparePart);
      console.log('Archivos a subir:', files);
      
      // Usar la nueva función que maneja todo el proceso
      const response = await createSparePartWithImages(
        sparePart,
        files ? Array.from(files) : []
      );
      
      console.log('Respuesta de creación de repuesto con imágenes:', response);
      
      // Verificar que el repuesto se creó correctamente
      const sparePartId = response?.data?.id || response?.id || response?.data?.data?.id;
      if (!sparePartId) {
        console.error('No se pudo obtener el ID del repuesto creado:', response);
        throw new Error('No se pudo crear el repuesto correctamente');
      }
      
      console.log('Repuesto creado exitosamente con ID:', sparePartId);

      // Actualizar la lista de repuestos
      await fetchSpareParts();
      toast.success('Repuesto creado correctamente');
      return { 
        ...response.data, 
        id: sparePartId,
        success: true 
      };
    } catch (err) {
      console.error('Error al crear repuesto:', err);
      toast.error(`Error al crear repuesto: ${err.message || 'Error desconocido'}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar un repuesto existente
  const updateExistingSparePart = async (sparePartData) => {
    try {
      setIsLoading(true);
      const { files, mediaToRemove = [], ...sparePart } = sparePartData;
      
      // Actualizar el repuesto
      const response = await updateSparePart(sparePart);

      // Si hay archivos para subir
      if (files && files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach((file, index) => {
          formData.append('files', file);
        });
        
        // Subir archivos multimedia
        const mediaResponse = await uploadSparePartMedia(formData);
        console.log('Archivos subidos:', mediaResponse);
      }

      // Aquí podrías manejar la eliminación de medios si es necesario
      // usando mediaToRemove

      await fetchSpareParts();
      toast.success('Repuesto actualizado correctamente');
      return response;
    } catch (err) {
      console.error('Error al actualizar repuesto:', err);
      toast.error(`Error al actualizar repuesto: ${err.message || 'Error desconocido'}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un repuesto
  const handleDeleteSparePart = async (id) => {
    try {
      setIsLoading(true);
      const response = await deleteSparePart(id);
      if (response) {
        await fetchSpareParts();
        toast.success('Repuesto eliminado correctamente');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al eliminar repuesto:', err);
      toast.error(`Error al eliminar repuesto: ${err.message || 'Error desconocido'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchSpareParts();
    fetchProducts();
  }, [fetchSpareParts, fetchProducts]);

  return {
    spareParts,
    deleteSparePart: handleDeleteSparePart,
    filteredSpareParts,
    isLoading,
    searchTerm,
    setSearchTerm,
    products,
    createNewSparePart,
    updateExistingSparePart,
    deleteSparePart,
    refreshSpareParts: fetchSpareParts
  };
}
