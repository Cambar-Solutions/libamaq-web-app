import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getActiveSpareParts } from '../../../../../services/admin/sparePartService';
import sparePartWorkflow from '../workflows/sparePartWorkflow';

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
  const [products, setProducts] = useState([]);

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

  /**
   * Crea un nuevo repuesto
   * @param {Object} sparePartData - Datos del repuesto
   * @param {File[]} [files=[]] - Archivos de imágenes
   * @returns {Promise<void>}
   */
  const createNewSparePart = async (sparePartData, files = []) => {
    try {
      const newSparePart = await sparePartWorkflow.createSparePart(sparePartData, files);
      await loadSpareParts();
      return newSparePart;
    } catch (error) {
      console.error('Error al crear repuesto:', error);
      toast.error(error.response?.data?.message || 'Error al crear el repuesto');
      throw error;
    }
  };

  /**
   * Actualiza un repuesto existente
   * @param {Object} sparePartData - Datos actualizados del repuesto
   * @param {File[]} [newFiles=[]] - Nuevas imágenes a subir
   * @param {string[]} [mediaToDelete=[]] - IDs de imágenes a eliminar
   * @returns {Promise<void>}
   */
  const updateExistingSparePart = async (sparePartData, newFiles = [], mediaToDelete = []) => {
    try {
      const updatedSparePart = await sparePartWorkflow.updateSparePart(
        sparePartData,
        newFiles,
        mediaToDelete
      );
      await loadSpareParts();
      return updatedSparePart;
    } catch (error) {
      console.error('Error al actualizar repuesto:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el repuesto');
      throw error;
    }
  };

  /**
   * Elimina un repuesto
   * @param {string|number} sparePartId - ID del repuesto a eliminar
   * @param {string[]} [mediaIds=[]] - IDs de las imágenes asociadas
   * @returns {Promise<void>}
   */
  const deleteSparePart = async (sparePartId, mediaIds = []) => {
    try {
      await sparePartWorkflow.deleteSparePart(sparePartId, mediaIds);
      await loadSpareParts();
      toast.success('Repuesto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar repuesto:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el repuesto');
      throw error;
    }
  };

  // Refrescar la lista de repuestos
  const refreshSpareParts = () => {
    return loadSpareParts();
  };

  return {
    spareParts,
    filteredSpareParts,
    isLoading,
    searchTerm,
    setSearchTerm,
    products,
    createNewSparePart,
    updateExistingSparePart,
    deleteSparePart,
    refreshSpareParts,
    SparePartStatus: sparePartWorkflow.constants.SparePartStatus
  };
};

export default useSpareParts;