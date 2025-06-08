import apiClient from '@/lib/apiClient';

/**
 * @typedef {Object} Media
 * @property {number} id - ID único del medio
 * @property {string} url - URL pública del archivo
 * @property {string} mimeType - Tipo MIME del archivo (ej. 'image/jpeg')
 * @property {string} fileName - Nombre original del archivo
 * @property {number} fileSize - Tamaño del archivo en bytes
 * @property {string} entityType - Tipo de entidad asociada (ej. 'SPARE_PART')
 * @property {number} entityId - ID de la entidad asociada
 * @property {number} displayOrder - Orden de visualización
 * @property {string} [title] - Título opcional del medio
 * @property {string} [description] - Descripción opcional del medio
 * @property {string} [createdAt] - Fecha de creación en formato ISO
 * @property {string} [updatedAt] - Fecha de actualización en formato ISO
 */

/**
 * Sube un archivo al servidor
 * @param {Object} params - Parámetros para la subida
 * @param {File} params.file - Archivo a subir
 * @param {string} params.entityType - Tipo de entidad (ej. 'SPARE_PART')
 * @param {number} [params.entityId] - ID de la entidad (opcional, se puede asociar después)
 * @param {number} [params.displayOrder=0] - Orden de visualización
 * @param {string} [params.title] - Título opcional
 * @param {string} [params.description] - Descripción opcional
 * @returns {Promise<Media>} Medio subido
 */
export const uploadMedia = async ({
  file,
  entityType,
  entityId,
  displayOrder = 0,
  title,
  description,
}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    
    if (entityId) {
      formData.append('entityId', entityId);
    }
    
    formData.append('displayOrder', displayOrder.toString());
    
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene los medios asociados a una entidad
 * @param {string} entityType - Tipo de entidad (ej. 'SPARE_PART')
 * @param {number} entityId - ID de la entidad
 * @returns {Promise<Media[]>} Lista de medios asociados
 */
export const getMediaByEntity = async (entityType, entityId) => {
  try {
    const response = await apiClient.get(`/media/entity/${entityType}/${entityId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error al obtener medios para ${entityType} ${entityId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina un medio por su ID
 * @param {number} mediaId - ID del medio a eliminar
 * @returns {Promise<boolean>} `true` si la operación fue exitosa
 */
export const deleteMedia = async (mediaId) => {
  try {
    await apiClient.delete(`/media/${mediaId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar el medio con ID ${mediaId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza la información de un medio existente
 * @param {number} mediaId - ID del medio a actualizar
 * @param {Object} updates - Campos a actualizar
 * @param {string} [updates.title] - Nuevo título
 * @param {string} [updates.description] - Nueva descripción
 * @param {number} [updates.displayOrder] - Nuevo orden de visualización
 * @returns {Promise<Media>} Medio actualizado
 */
export const updateMedia = async (mediaId, { title, description, displayOrder }) => {
  try {
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;

    const response = await apiClient.patch(`/media/${mediaId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el medio con ID ${mediaId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Reordena los medios de una entidad
 * @param {string} entityType - Tipo de entidad (ej. 'SPARE_PART')
 * @param {number} entityId - ID de la entidad
 * @param {Array<{id: number, displayOrder: number}>} orderMap - Mapa de IDs y sus nuevos órdenes
 * @returns {Promise<boolean>} `true` si la operación fue exitosa
 */
export const reorderMedia = async (entityType, entityId, orderMap) => {
  try {
    await apiClient.patch(`/media/reorder/${entityType}/${entityId}`, { orderMap });
    return true;
  } catch (error) {
    console.error(`Error al reordenar medios para ${entityType} ${entityId}:`, error);
    throw error.response?.data || error.message;
  }
};

export default {
  uploadMedia,
  getMediaByEntity,
  deleteMedia,
  updateMedia,
  reorderMedia,
};