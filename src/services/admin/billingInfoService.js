import apiClient from "../apiClient";

/**
 * Obtiene toda la información de facturación
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllBillingInfo = async () => {
  try {
    const { data } = await apiClient.get("/l/billing-infos");
    return data;
  } catch (error) {
    console.error('Error al obtener información de facturación:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene información de facturación por su ID
 * @param {string|number} id - ID de la información de facturación
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getBillingInfoById = async (id) => {
  try {
    const { data } = await apiClient.get(`/l/billing-infos/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener información de facturación con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene información de facturación de un usuario específico
 * @param {string|number} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getBillingInfoByUser = async (userId) => {
  try {
    const { data } = await apiClient.get(`/l/billing-infos/user/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener información de facturación del usuario ${userId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea nueva información de facturación
 * @param {Object} billingInfoData - Datos de la información de facturación a crear
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createBillingInfo = async (billingInfoData) => {
  try {
    const { data } = await apiClient.post("/l/billing-infos", billingInfoData);
    return data;
  } catch (error) {
    console.error('Error al crear información de facturación:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza información de facturación existente
 * @param {Object} billingInfoData - Datos de la información de facturación a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateBillingInfo = async (billingInfoData) => {
  try {
    const { data } = await apiClient.put("/l/billing-infos", billingInfoData);
    return data;
  } catch (error) {
    console.error('Error al actualizar información de facturación:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Establece información de facturación como predeterminada para un usuario
 * @param {string|number} id - ID de la información de facturación
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const setDefaultBillingInfo = async (id) => {
  try {
    const { data } = await apiClient.put(`/l/billing-infos/default/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al establecer información de facturación ${id} como predeterminada:`, error);
    throw error.response?.data || error.message;
  }
};
