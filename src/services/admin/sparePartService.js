import apiClient from "../apiClient";

// Endpoint base para repuestos
const SPARE_PARTS_ENDPOINT = '/l/spare-parts';

/**
 * Obtiene todos los repuestos
 * @returns {Promise<Object>} - Lista de repuestos
 */
export const getAllSpareParts = async () => {
  try {
    const response = await apiClient.get(SPARE_PARTS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error al obtener repuestos:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene todos los repuestos activos
 * @returns {Promise<Object>} - Lista de repuestos activos
 */
export const getActiveSpareParts = async () => {
  try {
    const response = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/active`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener repuestos activos:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene un repuesto por su ID
 * @param {number} id - ID del repuesto
 * @returns {Promise<Object>} - Datos del repuesto
 */
export const getSparePartById = async (id) => {
  try {
    const response = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener repuesto con ID ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crea un nuevo repuesto
 * @param {Object} sparePartData - Datos del repuesto a crear
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const createSparePart = async (sparePartData) => {
  try {
    const response = await apiClient.post(SPARE_PARTS_ENDPOINT, sparePartData);
    return response.data;
  } catch (error) {
    console.error('Error al crear repuesto:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un repuesto existente
 * @param {Object} sparePartData - Datos actualizados del repuesto
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const updateSparePart = async (sparePartData) => {
  try {
    const response = await apiClient.put(
      `${SPARE_PARTS_ENDPOINT}/${sparePartData.id}`, 
      sparePartData
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar repuesto ${sparePartData.id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina un repuesto
 * @param {number} id - ID del repuesto a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteSparePart = async (id) => {
  try {
    const response = await apiClient.delete(`${SPARE_PARTS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar repuesto ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Sube archivos multimedia para un repuesto
 * @param {FormData} formData - Datos del formulario con los archivos
 * @returns {Promise<Object>} - Respuesta del servidor con los datos de los archivos subidos
 */
export const uploadSparePartMedia = async (formData) => {
  try {
    const response = await apiClient.post('/l/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir archivos multimedia:', error);
    throw error.response?.data || error.message;
  }
};
