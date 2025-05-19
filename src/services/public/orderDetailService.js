import apiClient from "../apiClient";

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
