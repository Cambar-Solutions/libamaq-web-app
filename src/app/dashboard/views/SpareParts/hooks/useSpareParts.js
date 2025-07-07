import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useSparePartsStore from './useSparePartsStore';
import sparePartWorkflow from '../workflows/sparePartWorkflow';

/**
 * Hook personalizado para manejar la lógica de repuestos
 * Ahora usa el store Zustand internamente
 * @returns {Object} Estado y funciones para manejar repuestos
 */
const useSpareParts = () => {
  const {
    spareParts,
    filteredSpareParts,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchSpareParts,
    addSparePart,
    updateSparePart,
    removeSparePart
  } = useSparePartsStore();

  // Cargar datos iniciales
  useEffect(() => {
    fetchSpareParts();
  }, [fetchSpareParts]);

  /**
   * Crea un nuevo repuesto
   * @param {Object} sparePartData - Datos del repuesto
   * @param {File[]} [files=[]] - Archivos de imágenes
   * @returns {Promise<void>}
   */
  const createNewSparePart = async (sparePartData, files = []) => {
    try {
      const newSparePart = await sparePartWorkflow.createSparePart(sparePartData, files);
      addSparePart(newSparePart.data || newSparePart);
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
      updateSparePart(updatedSparePart.data || updatedSparePart);
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
      removeSparePart(sparePartId);
      toast.success('Repuesto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar repuesto:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el repuesto');
      throw error;
    }
  };

  // Refrescar la lista de repuestos
  const refreshSpareParts = () => {
    return fetchSpareParts();
  };

  return {
    spareParts,
    filteredSpareParts,
    isLoading,
    searchTerm,
    setSearchTerm,
    products: [], // Mantener compatibilidad
    createNewSparePart,
    updateExistingSparePart,
    deleteSparePart,
    refreshSpareParts,
    SparePartStatus: sparePartWorkflow.constants.SparePartStatus
  };
};

export default useSpareParts;