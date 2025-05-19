import apiClient from "../apiClient";

/**
 * Obtiene las órdenes de un usuario específico
 * @param {string|number} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getOrdersByUser = async (userId) => {
  try {
    console.log(`Obteniendo órdenes del usuario ${userId}...`);
    const { data } = await apiClient.get(`/l/orders/user/${userId}`);
    console.log(`Respuesta de órdenes del usuario ${userId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener órdenes del usuario ${userId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una orden específica por su ID
 * @param {string|number} id - ID de la orden
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getOrderById = async (id) => {
  try {
    console.log(`Obteniendo orden con ID ${id}...`);
    const { data } = await apiClient.get(`/l/orders/${id}`);
    console.log('Respuesta de orden por ID:', data);
    return data;
  } catch (error) {
    console.error(`Error al obtener orden con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva orden
 * @param {Object} orderData - Datos de la orden a crear
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createOrder = async (orderData) => {
  try {
    console.log('Creando nueva orden:', orderData);
    const { data } = await apiClient.post("/l/orders", orderData);
    console.log('Respuesta de creación de orden:', data);
    return data;
  } catch (error) {
    console.error('Error al crear orden:', error);
    throw error.response?.data || error.message;
  }
};
