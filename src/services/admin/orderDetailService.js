import apiClient from "../apiClient";

/**
 * Obtiene todos los detalles de órdenes
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllOrderDetails = async () => {
  try {
    console.log('Obteniendo todos los detalles de órdenes...');
    const { data } = await apiClient.get("/l/order-details");
    console.log('Respuesta de detalles de órdenes:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener detalles de órdenes:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene un detalle de orden específico por su ID
 * @param {string|number} id - ID del detalle de orden
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getOrderDetailById = async (id) => {
  try {
    console.log(`Obteniendo detalle de orden con ID ${id}...`);
    const { data } = await apiClient.get(`/l/order-details/${id}`);
    console.log('Respuesta de detalle de orden por ID:', data);
    return data;
  } catch (error) {
    console.error(`Error al obtener detalle de orden con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene los detalles de una orden específica
 * @param {string|number} orderId - ID de la orden
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getOrderDetailsByOrderId = async (orderId) => {
  try {
    console.log(`Obteniendo detalles de la orden ${orderId}...`);
    const { data } = await apiClient.get(`/l/order-details/order/${orderId}`);
    console.log(`Respuesta de detalles de la orden ${orderId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener detalles de la orden ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea un nuevo detalle de orden
 * @param {Object} orderDetailData - Datos del detalle de orden a crear
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createOrderDetail = async (orderDetailData) => {
  try {
    console.log('Creando nuevo detalle de orden:', orderDetailData);
    const { data } = await apiClient.post("/l/order-details", orderDetailData);
    console.log('Respuesta de creación de detalle de orden:', data);
    return data;
  } catch (error) {
    console.error('Error al crear detalle de orden:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un detalle de orden existente
 * @param {Object} orderDetailData - Datos del detalle de orden a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateOrderDetail = async (orderDetailData) => {
  try {
    console.log('Actualizando detalle de orden:', orderDetailData);
    const { data } = await apiClient.put("/l/order-details", orderDetailData);
    console.log('Respuesta de actualización de detalle de orden:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar detalle de orden:', error);
    throw error.response?.data || error.message;
  }
};
