import apiClient from "../apiClient";

/**
 * Obtiene todas las categorías
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllCategories = async () => {
  try {
    console.log('Obteniendo todas las categorías...');
    const { data } = await apiClient.get("/admin/category/all");
    console.log('Respuesta de categorías:', data);
    return data; // Devolver el objeto completo con type y result
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - Datos de la categoría a crear
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createCategory = async (categoryData) => {
  try {
    // Asegurar que solo enviamos los campos requeridos por el backend
    const payload = {
      name: categoryData.name || "",
      url: categoryData.url || "",
      description: categoryData.description || ""
    };
    
    console.log('Creando nueva categoría:', payload);
    const { data } = await apiClient.post("/admin/category/create", payload);
    console.log('Respuesta de creación de categoría:', data);
    return data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza una categoría existente
 * @param {Object} categoryData - Datos de la categoría a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateCategory = async (categoryData) => {
  try {
    console.log('Actualizando categoría:', categoryData);
    const { data } = await apiClient.put("/admin/category/update", categoryData);
    console.log('Respuesta de actualización de categoría:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cambia el estado de una categoría (activa/inactiva)
 * @param {number} id - ID de la categoría
 * @param {string} currentStatus - Estado actual de la categoría
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const changeCategoryStatus = async (id, currentStatus) => {
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log(`Cambiando estado de categoría ${id} de ${currentStatus} a ${newStatus}`);
    
    // Para cambiar el estado, usamos el endpoint de actualización con el nuevo estado
    const categoryData = {
      id,
      status: newStatus
    };
    
    const { data } = await apiClient.put("/admin/category/update", categoryData);
    console.log('Respuesta de cambio de estado de categoría:', data);
    return data;
  } catch (error) {
    console.error('Error al cambiar estado de categoría:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene categorías por marca
 * @param {number} brandId - ID de la marca
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getCategoriesByBrand = async (brandId) => {
  try {
    console.log(`Obteniendo categorías para la marca ${brandId}...`);
    const { data } = await apiClient.get(`/admin/category/brand/${brandId}`);
    console.log('Respuesta de categorías por marca:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener categorías por marca:', error);
    throw error.response?.data || error.message;
  }
};