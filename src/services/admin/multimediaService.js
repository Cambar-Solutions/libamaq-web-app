import apiClient from "../apiClient";

/**
 * Sube un archivo multimedia al servidor
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} - Datos del archivo subido
 */
export const createMultimedia = async (file) => {
  try {
    const formData = new FormData();
    
    // Intentar sin nombre de campo específico
    formData.append(file.name, file);
    
    const { data } = await apiClient.post("/l/cloudflare/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Respuesta de subida exitosa:', data);
    
    // Devolver los datos en un formato consistente
    return {
      id: data.id || 0,
      url: data.url || data.result?.url || '',
      fileType: file.type.startsWith('image/') ? 'IMAGE' : 'OTHER'
    };
  } catch (error) {
    console.error('Error en createMultimedia:', error);
    console.error('Respuesta del servidor:', error.response?.data);
    throw error.response?.data || error.message;
  }
};
