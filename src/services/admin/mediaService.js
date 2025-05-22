import apiClient from "../apiClient";

/**
 * Sube archivos multimedia al servidor
 * @param {File|Array<File>} files - Archivo o array de archivos a subir
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const uploadMedia = async (files) => {
  try {
    const formData = new FormData();
    
    // Si files es un array, agregar cada archivo al formData
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    } else {
      // Si es un solo archivo
      formData.append('files', files);
    }
    
    const response = await apiClient.post("/l/media/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    console.log('Respuesta de subida de archivos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al subir archivos multimedia:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina archivos multimedia del servidor
 * @param {Array<number>} mediaIds - Array de IDs de archivos multimedia a eliminar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const deleteMedia = async (mediaIds) => {
  try {
    console.log('Eliminando archivos multimedia con IDs:', mediaIds);
    const response = await apiClient.post("/l/media/delete", mediaIds);
    console.log('Respuesta de eliminación de archivos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar archivos multimedia:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea o actualiza un registro de multimedia para una entidad
 * @param {Object} mediaData - Datos del medio según UpdateMediaDTO
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateMediaForEntity = async (mediaData) => {
  try {
    // Validar que el objeto cumpla con el UpdateMediaDTO
    if (!mediaData.id && !mediaData.url) {
      throw new Error('Se requiere id o url para actualizar un medio');
    }
    
    // Asegurarse de que fileType sea uno de los valores permitidos
    if (mediaData.fileType && !['IMAGE', 'PDF', 'VIDEO', 'OTHER'].includes(mediaData.fileType)) {
      throw new Error('fileType debe ser uno de: IMAGE, PDF, VIDEO, OTHER');
    }
    
    // Asegurarse de que entityType sea uno de los valores permitidos
    if (mediaData.entityType && !['PACK', 'PRODUCT', 'VARIANT'].includes(mediaData.entityType)) {
      throw new Error('entityType debe ser uno de: PACK, PRODUCT, VARIANT');
    }
    
    console.log('Actualizando medio:', mediaData);
    const response = await apiClient.put('/l/media', mediaData);
    console.log('Respuesta de actualización de medio:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar medio:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina un archivo de Cloudflare por su URL
 * @param {string} fileUrl - URL del archivo a eliminar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const deleteCloudflareFile = async (fileUrl) => {
  try {
    console.log('Eliminando archivo de Cloudflare:', fileUrl);
    const response = await apiClient.delete("/l/cloudflare/delete", {
      data: { fileUrl }
    });
    console.log('Respuesta de eliminación de archivo de Cloudflare:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar archivo de Cloudflare:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Sube un archivo a Cloudflare
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} Objeto con la respuesta de la API incluyendo la URL del archivo
 */
export const uploadToCloudflare = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post("/l/cloudflare/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Respuesta de subida a Cloudflare:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al subir archivo a Cloudflare:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Prepara un objeto multimedia para asociarlo a un producto o repuesto
 * @param {string} url - URL del archivo
 * @param {string} fileType - Tipo de archivo (IMAGE, PDF, VIDEO, OTHER)
 * @param {string} entityType - Tipo de entidad (PACK, PRODUCT, VARIANT)
 * @param {number} entityId - ID de la entidad relacionada
 * @param {number} displayOrder - Orden de aparición
 * @param {number} id - ID del media (opcional, solo para actualizaciones)
 * @returns {Object} Objeto con la estructura correcta para el DTO
 */
export const prepareMediaDTO = ({
  url,
  fileType = 'IMAGE',
  entityType = 'PRODUCT',
  entityId,
  displayOrder = 1,
  id = null
}) => {
  const mediaDTO = {
    url,
    fileType,
    entityType,
    displayOrder
  };
  
  if (entityId) {
    mediaDTO.entityId = Number(entityId);
  }
  
  if (id) {
    mediaDTO.id = Number(id);
  }
  
  return mediaDTO;
};
