import apiClient from "../apiClient";

/**
 * Obtiene todas las direcciones de envío
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllShippingAddresses = async () => {
  try {
    const { data } = await apiClient.get("/l/shipping-addresses");
    return data;
  } catch (error) {
    console.error('Error al obtener direcciones de envío:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una dirección de envío por su ID
 * @param {string|number} id - ID de la dirección de envío
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getShippingAddressById = async (id) => {
  try {
    const { data } = await apiClient.get(`/l/shipping-addresses/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener dirección de envío con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene las direcciones de envío de un usuario específico
 * @param {string|number} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getShippingAddressesByUser = async (userId) => {
  try {
    const { data } = await apiClient.get(`/l/shipping-addresses/user/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener direcciones de envío del usuario ${userId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva dirección de envío
 * @param {Object} addressData - Datos de la dirección de envío a crear
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createShippingAddress = async (addressData) => {
  try {
    const { data } = await apiClient.post("/l/shipping-addresses", addressData);
    return data;
  } catch (error) {
    console.error('Error al crear dirección de envío:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza una dirección de envío existente
 * @param {Object} addressData - Datos de la dirección de envío a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateShippingAddress = async (addressData) => {
  try {
    const { data } = await apiClient.put("/l/shipping-addresses", addressData);
    return data;
  } catch (error) {
    console.error('Error al actualizar dirección de envío:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Establece una dirección de envío como predeterminada para un usuario
 * @param {string|number} id - ID de la dirección de envío
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const setDefaultShippingAddress = async (id) => {
  try {
    const { data } = await apiClient.put(`/l/shipping-addresses/default/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al establecer dirección de envío ${id} como predeterminada:`, error);
    throw error.response?.data || error.message;
  }
};
