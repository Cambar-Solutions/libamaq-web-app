import apiClient from "../apiClient";

/**
 * @typedef {Object} ShippingAddress
 * @property {number} id - The ID of the shipping address.
 * @property {string} updatedBy - The user who last updated the address (e.g., "ADMIN").
 * @property {string} updatedAt - The timestamp of the last update (e.g., "2024-03-20T14:00:00.000Z").
 * @property {string} receiver - The name of the person receiving the shipment.
 * @property {string} street - The street name.
 * @property {string} exteriorNumber - The exterior number of the address.
 * @property {string} [interiorNumber] - The interior number of the address (optional).
 * @property {string} neighborhood - The neighborhood.
 * @property {string} city - The city.
 * @property {string} state - The state.
 * @property {string} postalCode - The postal code.
 * @property {string} phoneNumber - The phone number for the address.
 * @property {string} [referencesText] - Additional references for the address (optional).
 * @property {boolean} isSelected - Indicates if this is the currently selected address.
 * @property {string} status - The status of the address (e.g., "ACTIVE").
 */

/**
 * @typedef {Object} NewShippingAddress
 * @property {string} createdBy - The user who created the address (e.g., "ADMIN").
 * @property {string} createdAt - The timestamp of creation (e.g., "2024-03-20T14:00:00.000Z").
 * @property {number} userId - The ID of the user associated with the address.
 * @property {string} receiver - The name of the person receiving the shipment.
 * @property {string} street - The street name.
 * @property {string} exteriorNumber - The exterior number of the address.
 * @property {string} [interiorNumber] - The interior number of the address (optional).
 * @property {string} neighborhood - The neighborhood.
 * @property {string} city - The city.
 * @property {string} state - The state.
 * @property {string} postalCode - The postal code.
 * @property {string} phoneNumber - The phone number for the address.
 * @property {string} [referencesText] - Additional references for the address (optional).
 * @property {boolean} isSelected - Indicates if this is the currently selected address.
 * @property {string} status - The status of the address (e.g., "ACTIVE").
 */

// --- Funciones para Direcciones de Envío ---

/**
 * Obtiene todas las direcciones de envío.
 * @returns {Promise<ShippingAddress[]>} Un arreglo de objetos de direcciones de envío.
 */
export const getAllShippingAddresses = async () => {
  try {
    console.log('Obteniendo todas las direcciones de envío...');
    const { data } = await apiClient.get('/l/shipping-addresses');
    console.log('Respuesta de todas las direcciones de envío:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener todas las direcciones de envío:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una dirección de envío por su ID.
 * @param {number} addressId - El ID de la dirección de envío.
 * @returns {Promise<ShippingAddress>} El objeto de la dirección de envío.
 */
export const getShippingAddressById = async (addressId) => {
  try {
    console.log(`Obteniendo dirección de envío con ID ${addressId}...`);
    const { data } = await apiClient.get(`/l/shipping-addresses/${addressId}`);
    console.log(`Respuesta de la dirección de envío con ID ${addressId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener la dirección de envío con ID ${addressId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva dirección de envío.
 * @param {NewShippingAddress} addressData - Los datos de la nueva dirección de envío.
 * @returns {Promise<ShippingAddress>} El objeto de la dirección de envío creada.
 */
export const createShippingAddress = async (addressData) => {
  try {
    console.log('Creando nueva dirección de envío:', addressData);
    const { data } = await apiClient.post('/l/shipping-addresses', addressData);
    console.log('Respuesta de creación de dirección de envío:', data);
    return data;
  } catch (error) {
    console.error('Error al crear la dirección de envío:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza una dirección de envío existente.
 * @param {ShippingAddress} updateData - Los datos completos de la dirección de envío a actualizar, incluyendo su 'id'.
 * @returns {Promise<ShippingAddress>} El objeto de la dirección de envío actualizada.
 */
export const updateShippingAddress = async (updateData) => {
  try {
    console.log(`Actualizando dirección de envío con ID ${updateData.id} con datos:`, updateData);
    const { data } = await apiClient.put('/l/shipping-addresses', updateData);
    console.log(`Respuesta de actualización de dirección de envío con ID ${updateData.id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al actualizar la dirección de envío con ID ${updateData?.id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina una dirección de envío por su ID.
 * @param {number} id - El ID de la dirección de envío a eliminar.
 * @returns {Promise<Object>} Objeto con la respuesta de la API (o vacío si es una eliminación sin contenido).
 */
export const deleteShippingAddress = async (id) => {
  try {
    console.log(`Eliminando dirección de envío con ID ${id}...`);
    const { data } = await apiClient.delete(`/l/shipping-addresses/delete/${id}`);
    console.log(`Respuesta de eliminación de dirección de envío con ID ${id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al eliminar la dirección de envío con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};