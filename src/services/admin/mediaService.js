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
    
    const { data } = await apiClient.post("/l/media/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    console.log('Respuesta de subida de archivos:', data);
    return data.result || data;
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
    const { data } = await apiClient.post("/l/media/delete", mediaIds);
    console.log('Respuesta de eliminación de archivos:', data);
    return data;
  } catch (error) {
    console.error('Error al eliminar archivos multimedia:', error);
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
    const { data } = await apiClient.delete("/l/cloudflare/delete", {
      data: { fileUrl }
    });
    console.log('Respuesta de eliminación de archivo de Cloudflare:', data);
    return data;
  } catch (error) {
    console.error('Error al eliminar archivo de Cloudflare:', error);
    throw error.response?.data || error.message;
  }
};
