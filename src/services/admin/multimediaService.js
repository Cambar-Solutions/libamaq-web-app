import apiClient from "../apiClient";
import axios from "axios";

/**
 * Sube un archivo multimedia al servidor usando el endpoint de Media
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} - Datos del archivo subido
 */
export const createMultimedia = async (file) => {
  try {
    const formData = new FormData();
    
    // Usar 'file' como nombre de campo para el archivo
    formData.append('file', file);
    
    console.log('Iniciando subida de archivo a /l/media/upload:', file.name);
    
    // Usar axios directamente para asegurar el formato correcto
    const { data } = await axios({
      method: 'post',
      url: 'https://libamaq.com/l/media/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      timeout: 30000 // 30 segundos de timeout
    });
    
    console.log('Respuesta de subida exitosa:', data);
    
    // Verificar la respuesta del servidor
    if (!data || !Array.isArray(data.data) || data.data.length === 0 || !data.data[0].url) {
      throw new Error('La respuesta del servidor no es válida o no contiene la URL del archivo');
    }
    
    const mediaData = data.data[0];
    
    // Devolver los datos en un formato consistente
    const result = {
      id: mediaData.id || 0,
      url: mediaData.url,
      fileType: mediaData.fileType || (file.type.startsWith('image/') ? 'IMAGE' : 'OTHER'),
      displayOrder: mediaData.displayOrder || 0,
      entityType: mediaData.entityType || 'PRODUCT',
      entityId: mediaData.entityId || null
    };
    
    console.log('Archivo subido correctamente:', result);
    return result;
    
  } catch (error) {
    console.error('Error en createMultimedia:', error);
    console.error('Error detallado:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error al subir el archivo. Por favor, inténtalo de nuevo.';
    
    throw new Error(errorMessage);
  }
};

/**
 * Elimina uno o más archivos multimedia
 * @param {string|string[]} mediaIds - ID o array de IDs de los archivos a eliminar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteMedia = async (mediaIds) => {
  try {
    // Asegurarse de que mediaIds sea un array
    const idsArray = Array.isArray(mediaIds) ? mediaIds : [mediaIds];
    
    // Crear el array de objetos con los IDs a eliminar
    const deletePayload = idsArray.map(id => ({
      id: id.toString() // Asegurarse de que el ID sea un string
    }));
    
    console.log('Eliminando archivos multimedia con IDs:', idsArray);
    
    // Usar axios directamente para asegurar el formato correcto
    const response = await axios({
      method: 'post',
      url: 'https://libamaq.com/l/media/delete',
      data: deletePayload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Respuesta de eliminación exitosa:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error al eliminar el/los archivo(s) multimedia:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
