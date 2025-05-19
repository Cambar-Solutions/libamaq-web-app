import apiClient from "../apiClient";

/**
 * Obtiene todas las órdenes
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllOrders = async () => {
  try {
    console.log('Obteniendo todas las órdenes...');
    const { data } = await apiClient.get("/l/orders");
    console.log('Respuesta de órdenes:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
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
 * Obtiene órdenes por estado
 * @param {string} status - Estado de las órdenes a buscar (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getOrdersByStatus = async (status) => {
  try {
    console.log(`Obteniendo órdenes con estado ${status}...`);
    const { data } = await apiClient.get(`/l/orders/status/${status}`);
    console.log(`Respuesta de órdenes con estado ${status}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener órdenes con estado ${status}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene órdenes de un usuario específico
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

/**
 * Actualiza una orden existente
 * @param {Object} orderData - Datos de la orden a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateOrder = async (orderData) => {
  try {
    console.log('Actualizando orden:', orderData);
    const { data } = await apiClient.put("/l/orders", orderData);
    console.log('Respuesta de actualización de orden:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cambia el estado de una orden
 * @param {string|number} id - ID de la orden
 * @param {string} status - Nuevo estado (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const changeOrderStatus = async (id, status) => {
  try {
    console.log(`Cambiando estado de orden ${id} a ${status}...`);
    const orderData = {
      id,
      status
    };
    const { data } = await apiClient.put("/l/orders", orderData);
    console.log('Respuesta de cambio de estado de orden:', data);
    return data;
  } catch (error) {
    console.error(`Error al cambiar estado de orden ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
