import { toast } from 'react-hot-toast';
import { 
  createSparePart as createSparePartService,
  updateSparePart as updateSparePartService,
  deleteSparePart as deleteSparePartService,
  getSparePartById as getSparePartByIdService,
  SparePartStatus
} from '../../../../../services/admin/sparePartService';
import mediaService from '../../../../../services/admin/mediaService';

/**
 * Workflow para manejar las operaciones de SpareParts
 */
const sparePartWorkflow = {
  /**
   * Crea un nuevo repuesto con sus imágenes
   * @param {Object} sparePartData - Datos del repuesto
   * @param {File[]} [files=[]] - Archivos de imágenes a subir
   * @returns {Promise<Object>} - Respuesta con el repuesto creado
   */
  createSparePart: async (sparePartData, files = []) => {
    try {
      // 1. Subir imágenes si hay archivos
      let media = [];
      if (files && files.length > 0) {
        media = await mediaService.uploadImages(files);
      }

      // 2. Crear el repuesto con las referencias a las imágenes
      const sparePartWithMedia = {
        ...sparePartData,
        media: [
          ...media.map(img => ({
            id: img.id,
            url: img.url,
            fileType: img.fileType,
            entityType: 'SPARE_PART',
            displayOrder: 0
          }))
        ],
        ...(sparePartData.ranking !== undefined ? { ranking: sparePartData.ranking } : {})
      };

      const response = await createSparePartService(sparePartWithMedia);
      toast.success('Repuesto creado exitosamente');
      return response;
    } catch (error) {
      console.error('Error al crear el repuesto:', error);
      toast.error(error.response?.data?.message || 'Error al crear el repuesto');
      throw error;
    }
  },

  /**
   * Actualiza un repuesto existente
   * @param {Object} sparePartData - Datos actualizados del repuesto
   * @param {File[]} [newFiles=[]] - Nuevas imágenes a subir
   * @param {Array} [mediaToDelete=[]] - IDs de imágenes a eliminar
   * @returns {Promise<Object>} - Respuesta con el repuesto actualizado
   */
  updateSparePart: async (sparePartData = {}, newFiles = [], mediaToDelete = []) => {
    try {
      // Validar datos básicos
      if (!sparePartData || !sparePartData.id) {
        throw new Error('Datos del repuesto no válidos');
      }

      // 1. Subir nuevas imágenes si hay archivos
      let newMedia = [];
      if (newFiles && newFiles.length > 0) {
        try {
          newMedia = await mediaService.uploadImages(newFiles);
        } catch (error) {
          console.error('Error al subir nuevas imágenes:', error);
          throw new Error('Error al subir las imágenes');
        }
      }

      // 2. Eliminar imágenes marcadas para borrar
      if (mediaToDelete && mediaToDelete.length > 0) {
        try {
          await mediaService.deleteImages(mediaToDelete);
        } catch (error) {
          console.error('Error al eliminar imágenes antiguas:', error);
          // Continuar aunque falle la eliminación
        }
      }

      // 3. Filtrar las imágenes existentes que no se hayan marcado para eliminar
      const existingMedia = (sparePartData.media || []).filter(
        img => img && img.id && !mediaToDelete.includes(img.id)
      );

      // 4. Crear el objeto final con solo los campos necesarios
      const { id, ...restData } = sparePartData;
      const updatedSparePart = {
        ...restData,
        media: [
          ...existingMedia,
          ...newMedia.map(img => ({
            id: Number(img.id),
            url: img.url,
            fileType: img.fileType || 'IMAGE',
            entityType: 'SPARE_PART',
            displayOrder: 0
          }))
        ],
        ...(sparePartData.ranking !== undefined ? { ranking: sparePartData.ranking } : {})
      };

      // 5. Eliminar campos que no deberían ir en el payload
      const { files, mediaToDelete: _, ...cleanPayload } = updatedSparePart;

      console.log('Actualizando repuesto con datos:', cleanPayload);
      const response = await updateSparePartService(id, cleanPayload);
      toast.success('Repuesto actualizado exitosamente');
      return response;
    } catch (error) {
      console.error('Error al actualizar el repuesto:', error);
      toast.error(error.response?.data?.message || error.message || 'Error al actualizar el repuesto');
      throw error;
    }
  },

  /**
   * Elimina un repuesto y sus imágenes asociadas
   * @param {string|number} sparePartId - ID del repuesto a eliminar
   * @param {Array} [mediaIds=[]] - IDs de las imágenes asociadas al repuesto
   * @returns {Promise<Object>} - Respuesta de la operación
   */
  deleteSparePart: async (sparePartId, mediaIds = []) => {
    try {
      // 1. Eliminar el repuesto
      const response = await deleteSparePartService(sparePartId);
      
      // 2. Si hay imágenes asociadas, intentar eliminarlas
      if (mediaIds && mediaIds.length > 0) {
        try {
          await mediaService.deleteImages(mediaIds);
        } catch (error) {
          console.error('Error al eliminar imágenes del repuesto:', error);
          // No hacemos throw aquí para no interrumpir el flujo principal
        }
      }
      
      toast.success('Repuesto eliminado exitosamente');
      return response;
    } catch (error) {
      console.error('Error al eliminar el repuesto:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el repuesto');
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un repuesto por su ID
   * @param {string|number} sparePartId - ID del repuesto
   * @returns {Promise<Object>} - Datos del repuesto
   */
  getSparePart: async (sparePartId) => {
    try {
      const response = await getSparePartByIdService(sparePartId);
      return response;
    } catch (error) {
      console.error('Error al obtener el repuesto:', error);
      throw error;
    }
  },

  // Constantes útiles para los componentes
  constants: {
    SparePartStatus,
    // Puedes agregar más constantes aquí según sea necesario
  }
};

export default sparePartWorkflow;
