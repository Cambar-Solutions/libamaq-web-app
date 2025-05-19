import apiClient from "../apiClient";

/**
 * Obtiene todas las facturas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllBills = async () => {
  try {
    const { data } = await apiClient.get("/l/bills");
    return data;
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una factura por su ID
 * @param {string|number} id - ID de la factura
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getBillById = async (id) => {
  try {
    const { data } = await apiClient.get(`/l/bills/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener factura con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva factura
 * @param {Object} billData - Datos de la factura a crear
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createBill = async (billData) => {
  try {
    const { data } = await apiClient.post("/l/bills", billData);
    return data;
  } catch (error) {
    console.error('Error al crear factura:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza una factura existente
 * @param {Object} billData - Datos de la factura a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateBill = async (billData) => {
  try {
    const { data } = await apiClient.put("/l/bills", billData);
    return data;
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene las facturas de un usuario específico
 * @param {string|number} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getBillsByUser = async (userId) => {
  try {
    const { data } = await apiClient.get(`/l/bills/user/${userId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener facturas del usuario ${userId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cambia el estado de una factura
 * @param {string|number} id - ID de la factura
 * @param {string} status - Nuevo estado (PAID, PENDING, CANCELLED)
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const changeBillStatus = async (id, status) => {
  try {
    const billData = {
      id,
      status
    };
    const { data } = await apiClient.put("/l/bills", billData);
    return data;
  } catch (error) {
    console.error(`Error al cambiar estado de factura ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
