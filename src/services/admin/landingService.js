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
    // Asegurarse de que todos los campos requeridos están presentes
    if (!landingData.title) {
      throw new Error('El título es obligatorio');
    }
    if (!landingData.url) {
      throw new Error('La URL es obligatoria');
    }
    
    // Limpiar la URL de TikTok si es necesario
    let cleanUrl = landingData.url;
    if (cleanUrl.includes('?')) {
      // Eliminar parámetros de consulta que podrían causar problemas
      cleanUrl = cleanUrl.split('?')[0];
    }
    
    // Crear el objeto con la estructura exacta que espera la API según Swagger
    // CreateLandingDto: title, description, type, status, url
    // Valores permitidos para type: 'PROMOTION', 'EVENT', 'NEWS', 'PRODUCT_LAUNCH'
    const payload = {
      title: landingData.title.trim(),
      description: (landingData.description || "").trim(),
      type: landingData.type || "PROMOTION", // Usar PROMOTION como valor por defecto
      status: "ACTIVE",  // Siempre usar ACTIVE como valor por defecto
      url: cleanUrl
    };
    
    console.log('Enviando payload a /l/landing:', payload);
    const { data } = await apiClient.post("/l/landing", payload);
    return data.result || data;
  } catch (error) {
    console.error("Error al crear landing:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Subir archivo multimedia (por separado)
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} - Información del archivo subido con la URL
 */
export const uploadLandingFile = async (file) => {
  try {
    console.log('Subiendo archivo:', file.name, 'Tipo:', file.type);
    
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post("/l/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
    });

    console.log('Respuesta de subida de archivo:', data);
    
    // Asegurarse de que la respuesta contiene una URL
    if (!data.data?.[0]?.url && !data.url) {
      throw new Error('La respuesta del servidor no contiene una URL válida');
    }
    
    // Devolver la URL del archivo subido
    return {
      url: data.data?.[0]?.url || data.url,
      fileId: data.data?.[0]?.fileId || null
    };
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Eliminar un archivo multimedia de Cloudflare
 * @param {string} fileUrl - URL del archivo a eliminar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteLandingFile = async (fileUrl) => {
  try {
    console.log('Eliminando archivo:', fileUrl);
    
    const payload = { fileUrl };
    
    const { data } = await apiClient.post("/l/media/delete", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log('Respuesta de eliminación de archivo:', data);
    return data;
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
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
    
    // Crear un objeto con solo los campos necesarios
    const payload = {
      id: Number(landingData.id), // Convertir a número para cumplir con las restricciones del backend
      title: landingData.title,
      description: landingData.description || "",
      type: landingData.type || "PROMOTION",
      status: landingData.status || "ACTIVE",
      url: landingData.url
    };
    
    console.log('Enviando payload de actualización:', payload);
    
    // Usar exactamente la misma ruta que funciona en Postman
    const { data } = await apiClient.put(`/l/landing`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
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
    const { data } = await apiClient.get(`/l/landing/${id}`);
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
    const { data } = await apiClient.get("/l/landing/active");
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
    
    const { data } = await apiClient.get(`/l/landing?${params.toString()}`);
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
    const { data } = await apiClient.delete(`/l/landing/${id}`);
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
    
    // Usar la misma URL que updateLanding
    const { data } = await apiClient.put(`/l/landing`, landingData);
    
    console.log('Respuesta de cambio de estado:', data);
    return data.result || data;
  } catch (error) {
    console.error(`Error al cambiar estado del landing con ID ${landingData.id}:`, error);
    throw error.response?.data || error.message;
  }
};
