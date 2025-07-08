import apiClient from "../apiClient";

/**
 * @typedef {Object} CartItem
 * @property {number} id - The ID of the cart item.
 * @property {string} updatedBy - The user who last updated the item (e.g., "ADMIN").
 * @property {string} updatedAt - The timestamp of the last update (e.g., "2024-03-20T14:00:00.000Z").
 * @property {number} quantity - The quantity of the product in the cart.
 */

/**
 * @typedef {Object} NewCartItem
 * @property {string} createdBy - The user who created the item (e.g., "ADMIN").
 * @property {string} createdAt - The timestamp of creation (e.g., "2024-03-20T14:00:00.000Z").
 * @property {number} userId - The ID of the user associated with the cart.
 * @property {number} productId - The ID of the product being added to the cart.
 * @property {number} quantity - The quantity of the product to add.
 */

// --- Funciones para el Carrito ---

/**
 * Obtiene el carrito de un usuario específico.
 * @param {string|number} userId - ID del usuario.
 * @returns {Promise<Object>} Objeto con la respuesta de la API que contiene los ítems del carrito.
 */
export const getCartByUser = async (userId) => {
  try {
    console.log(`Obteniendo carrito del usuario ${userId}...`);
    const { data } = await apiClient.get(`/l/car/user/${userId}`);
    console.log(`Respuesta del carrito del usuario ${userId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener el carrito del usuario ${userId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Añade un producto al carrito.
 * @param {NewCartItem} cartItemData - Datos del ítem a añadir al carrito.
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
 */
export const addProductToCart = async (cartItemData) => {
  try {
    console.log('Añadiendo producto al carrito:', cartItemData);
    const { data } = await apiClient.post("/l/car", cartItemData);
    console.log('Respuesta de adición de producto al carrito:', data);
    return data;
  } catch (error) {
    console.error('Error al añadir producto al carrito:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un ítem existente en el carrito (ej. para cambiar la cantidad de un producto).
 * @param {CartItem} updateData - Datos completos del ítem del carrito a actualizar, incluyendo su 'id'.
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
 */
export const updateCartItem = async (updateData) => {
  try {
    console.log(`Actualizando ítem del carrito ${updateData.id} con datos:`, updateData);
    const { data } = await apiClient.put("/l/car", updateData);
    console.log(`Respuesta de actualización de ítem del carrito ${updateData.id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al actualizar ítem del carrito ${updateData?.id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina un producto del carrito.
 * @param {string|number} id - ID del producto a eliminar del carrito.
 * @returns {Promise<Object>} Objeto con la respuesta de la API (o vacío si es una eliminación sin contenido).
 */
export const removeProductFromCart = async (id) => {
  try {
    console.log(`Eliminando producto con ID ${id} del carrito...`);
    const { data } = await apiClient.delete(`/l/car/delete/${id}`);
    console.log(`Respuesta de eliminación de producto con ID ${id} del carrito:`, data);
    return data;
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${id} del carrito:`, error);
    throw error.response?.data || error.message;
  }
};