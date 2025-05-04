import apiClient from "../apiClient";

/**
 * Servicio para gestionar el contenido de landings (TikToks, imágenes, etc.)
 */

/**
 * Crear nuevo landing (sin archivo, solo datos)
 * @param {Object} landingData - Datos del landing a crear
 * @returns {Promise<Object>} - Datos del landing creado
 */
export const createLanding = async (landingData) => {
  try {
    // Verificar la estructura exacta de la URL en las imágenes de Postman
    const { data } = await apiClient.post("/admin/landing/create", landingData);
    return data.result || data;
  } catch (error) {
    console.error("Error al crear landing:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Subir archivo multimedia (por separado)
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} - Información del archivo subido
 */
export const uploadLandingFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post("/admin/landing/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
    });

    return data.result || data;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualizar un landing existente
 * @param {Object} landingData - Datos actualizados del landing
 * @returns {Promise<Object>} - Datos del landing actualizado
 */
export const updateLanding = async (landingData) => {
  try {
    console.log(`Actualizando landing con ID ${landingData.id}:`, landingData);
    
    // Usar exactamente la misma ruta que funciona en Postman
    // https://libamaq.com/api/admin/landing/update (sin ID al final)
    const { data } = await apiClient.put(`/admin/landing/update`, landingData);
    console.log('Respuesta de actualización:', data);
    return data.result || data;
  } catch (error) {
    console.error("Error al actualizar landing:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtener un landing por ID
 * @param {string|number} id - ID del landing a obtener
 * @returns {Promise<Object>} - Datos del landing
 */
export const getLandingById = async (id) => {
  try {
    const { data } = await apiClient.get(`/admin/landing/${id}`);
    return data.result || data;
  } catch (error) {
    console.error(`Error al obtener landing con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtener todos los elementos activos (para uso público)
 * @returns {Promise<Array>} - Lista de landings activos
 */
export const getAllActiveLandings = async () => {
  try {
    const { data } = await apiClient.get("/public/landing/all");
    return data;
  } catch (error) {
    console.error("Error al obtener landings activos:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtener landings con opciones de filtrado y paginación
 * @param {Object} options - Opciones de filtrado y paginación
 * @returns {Promise<Object>} - Lista de landings y metadata de paginación
 */
export const getLandings = async (options = {}) => {
  try {
    const { page = 1, limit = 10, type, status, search } = options;
    
    // Construir query params
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const { data } = await apiClient.get(`/admin/landing/list?${params.toString()}`);
    return data;
  } catch (error) {
    console.error("Error al obtener landings:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Eliminar un landing por su ID
 * @param {string|number} id - ID del landing a eliminar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteLanding = async (id) => {
  try {
    const { data } = await apiClient.delete(`/admin/landing/delete/${id}`);
    return data.result || data;
  } catch (error) {
    console.error(`Error al eliminar landing con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};



/**
 * Cambiar el estado de un landing (activar/desactivar)
 * @param {Object} landingData - Datos del landing incluyendo id, title, description, url, type y status
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const changeLandingStatus = async (landingData) => {
  try {
    console.log(`Cambiando estado del landing ID ${landingData.id} a ${landingData.status}`);
    
    // Usar la misma URL que updateLanding: /admin/landing/update
    // Enviamos todos los campos requeridos
    const { data } = await apiClient.put(`/admin/landing/update`, landingData);
    
    console.log('Respuesta de cambio de estado:', data);
    return data.result || data;
  } catch (error) {
    console.error(`Error al cambiar estado del landing con ID ${landingData.id}:`, error);
    throw error.response?.data || error.message;
  }
};
