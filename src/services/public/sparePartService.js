import apiClient from "../apiClient";

/**
 * Obtiene todas las refacciones activas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllActiveSpareParts = async () => {
  try {
    const { data } = await apiClient.get("/l/spare-parts/active");
    return data;
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene un repuesto específico por su ID
 * @param {string|number} id - ID del repuesto
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getSparePartById = async (id) => {
  try {
    console.log(`Obteniendo repuesto con ID ${id}...`);
    const { data } = await apiClient.get(`/l/spare-parts/${id}`);
    console.log('Respuesta de repuesto por ID:', data);
    return data;
  } catch (error) {
    console.error(`Error al obtener repuesto con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene los repuestos activos asociados a un producto específico
 * @param {string|number} productId - ID del producto
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getActiveSparePartsByProduct = async (productId) => {
  try {
    console.log(`Obteniendo repuestos activos para el producto ${productId}...`);
    const { data } = await apiClient.get(`/l/product-spare-parts/product/${productId}/active`);
    console.log('Respuesta de repuestos activos por producto:', data);
    return data.result || [];
  } catch (error) {
    console.error(`Error al obtener repuestos activos para el producto ${productId}:`, error);
    return []; // Devolver array vacío en caso de error para no interrumpir el flujo
  }
};
