import apiClient from "../apiClient";

/**
 * Obtiene todas las categorías activas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllActiveCategories = async () => {
  try {
    console.log('Obteniendo categorías activas...');
    const { data } = await apiClient.get("/l/categories/active");
    console.log('Respuesta de categorías activas:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener categorías activas:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una categoría específica por su ID
 * @param {string|number} id - ID de la categoría
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getCategoryById = async (id) => {
  try {
    console.log(`Obteniendo categoría con ID ${id}...`);
    const { data } = await apiClient.get(`/l/categories/${id}`);
    console.log('Respuesta de categoría por ID:', data);
    return data;
  } catch (error) {
    console.error(`Error al obtener categoría con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene las categorías asociadas a una marca específica
 * @param {string|number} brandId - ID de la marca
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getCategoriesByBrand = async (brandId) => {
  try {
    console.log(`Obteniendo categorías para la marca ${brandId}...`);
    const { data } = await apiClient.get(`/l/brand-categories/brand/${brandId}`);
    console.log('Respuesta de categorías por marca:', data);
    return data;
  } catch (error) {
    console.error(`Error al obtener categorías para la marca ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};
