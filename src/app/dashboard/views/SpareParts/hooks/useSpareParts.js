import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getAllSpareParts, 
  getSparePartById, 
  createSparePart, 
  updateSparePart, 
  deleteSparePart,
  uploadSparePartMedia
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
      const response = await getAllSpareParts(1, 50);
      setSpareParts(response.content || []);
      setFilteredSpareParts(response.content || []);
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
      
      // Crear el repuesto
      const response = await createSparePart(sparePart);

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

      await fetchSpareParts();
      toast.success('Repuesto creado correctamente');
      return response;
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
      await deleteSparePart(id);
      await fetchSpareParts();
      toast.success('Repuesto eliminado correctamente');
      return true;
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
