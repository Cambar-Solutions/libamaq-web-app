import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getActiveSpareParts, 
  createSparePart as createSparePartService,
  updateSparePart as updateSparePartService,
  deleteSparePart as deleteSparePartService
} from '../../../../../services/admin/sparePartService';

/**
 * Hook personalizado para manejar la lógica de repuestos
 * @returns {Object} Estado y funciones para manejar repuestos
 */
const useSpareParts = () => {
  // Estados
  const [spareParts, setSpareParts] = useState([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]); // Para futura integración con productos

  // Cargar repuestos
  const loadSpareParts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getActiveSpareParts();
      if (response && response.data) {
        setSpareParts(response.data);
        setFilteredSpareParts(response.data);
      }
    } catch (error) {
      console.error('Error al cargar repuestos:', error);
      toast.error('Error al cargar la lista de repuestos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtrar repuestos según el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSpareParts(spareParts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = spareParts.filter(
      (sparePart) =>
        sparePart.name.toLowerCase().includes(term) ||
        sparePart.code.toLowerCase().includes(term) ||
        sparePart.externalId?.toLowerCase().includes(term) ||
        sparePart.description?.toLowerCase().includes(term)
    );
    setFilteredSpareParts(filtered);
  }, [searchTerm, spareParts]);

  // Cargar datos iniciales
  useEffect(() => {
    loadSpareParts();
  }, [loadSpareParts]);

  // Crear un nuevo repuesto
  const createNewSparePart = async (sparePartData, files = []) => {
    try {
      // Primero creamos el repuesto
      const createResponse = await createSparePartService({
        ...sparePartData,
        status: 'ACTIVE',
        rentable: Boolean(sparePartData.rentable),
        price: parseFloat(sparePartData.price) || 0,
        stock: parseInt(sparePartData.stock, 10) || 0,
      });

      if (files.length > 0 && createResponse.data?.id) {
        // Aquí iría la lógica para subir archivos si es necesario
        console.log('Subiendo archivos para el repuesto:', createResponse.data.id, files);
      }

      // Recargar la lista de repuestos
      await loadSpareParts();
      return createResponse;
    } catch (error) {
      console.error('Error al crear el repuesto:', error);
      throw error;
    }
  };

  // Actualizar un repuesto existente
  const updateExistingSparePart = async (sparePartData, files = []) => {
    try {
      const updateResponse = await updateSparePartService(sparePartData.id, {
        ...sparePartData,
        rentable: Boolean(sparePartData.rentable),
        price: parseFloat(sparePartData.price) || 0,
        stock: parseInt(sparePartData.stock, 10) || 0,
      });

      if (files.length > 0) {
        // Aquí iría la lógica para actualizar archivos si es necesario
        console.log('Actualizando archivos para el repuesto:', sparePartData.id, files);
      }

      // Recargar la lista de repuestos
      await loadSpareParts();
      return updateResponse;
    } catch (error) {
      console.error('Error al actualizar el repuesto:', error);
      throw error;
    }
  };

  // Eliminar un repuesto
  const deleteSparePart = async (id) => {
    try {
      const response = await deleteSparePartService(id);
      // Recargar la lista de repuestos
      await loadSpareParts();
      return response;
    } catch (error) {
      console.error('Error al eliminar el repuesto:', error);
      throw error;
    }
  };

  return {
    // Estados
    spareParts,
    filteredSpareParts,
    isLoading,
    searchTerm,
    products,
    
    // Setters
    setSearchTerm,
    
    // Funciones
    createNewSparePart,
    updateExistingSparePart,
    deleteSparePart,
    refreshSpareParts: loadSpareParts,
  };
};

export default useSpareParts;