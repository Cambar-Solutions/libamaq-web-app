import apiClient from "../apiClient";

// --- Funciones para Orders (Órdenes) ---

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

/**
 * Actualiza el estado de una orden (ej. para marcar un carrito como "comprado").
 * @param {string|number} orderId - ID de la orden a actualizar.
 * @param {string} newStatus - El nuevo estado de la orden (ej. 'purchased', 'completed', 'pending', etc.).
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    console.log(`Actualizando estado de la orden ${orderId} a: ${newStatus}`);
    const { data } = await apiClient.put(`/l/orders/${orderId}/status`, { status: newStatus });
    console.log(`Respuesta de actualización de estado de orden ${orderId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al actualizar estado de la orden ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
};

// --- Funciones para Order Details (Detalles de la Orden) ---

/**
 * Obtiene los detalles de una orden específica
 * @param {string|number} orderId - ID de la orden
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
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
 * @param {string|number} id - ID del detalle de orden.
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
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
 * Añade un nuevo producto (detalle de orden) a una orden/carrito.
 * @param {Object} orderDetailData - Datos del detalle de orden a crear (ej. { orderId: 'id-del-carrito', productId: 'id-del-producto', quantity: 1, unitPrice: 100, discount: 0 }).
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
 */
export const createOrderDetail = async (orderDetailData) => {
  try {
    console.log('Añadiendo nuevo detalle de orden:', orderDetailData);
    const { data } = await apiClient.post("/l/order-details", orderDetailData);
    console.log('Respuesta de creación de detalle de orden:', data);
    return data;
  } catch (error) {
    console.error('Error al añadir detalle de orden:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un detalle de orden existente (ej. para cambiar la cantidad de un producto en el carrito).
 * Recibe el ID del detalle de orden como parte de los datos a actualizar en el cuerpo de la solicitud.
 * @param {Object} updateData - Datos completos del detalle de orden a actualizar, incluyendo su 'id' (ej. { id: 1, orderId: 1, productId: 1, quantity: 2, unitPrice: 100.5, discount: 10 }).
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
 */
export const updateOrderDetail = async (updateData) => {
  try {
    console.log(`Actualizando detalle de orden ${updateData.id} con datos:`, updateData);
    const { data } = await apiClient.put("/l/order-details", updateData);
    console.log(`Respuesta de actualización de detalle de orden ${updateData.id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al actualizar detalle de orden ${updateData?.id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina un detalle de orden específico (eliminar un producto del carrito).
 * @param {string|number} detailId - ID del detalle de orden a eliminar.
 * @returns {Promise<Object>} Objeto con la respuesta de la API (o vacío si es una eliminación sin contenido).
 */
export const deleteOrderDetail = async (detailId) => {
  try {
    console.log(`Eliminando detalle de orden ${detailId}...`);
    const { data } = await apiClient.delete(`/l/order-details/delete/${detailId}`);
    console.log(`Respuesta de eliminación de detalle de orden ${detailId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al eliminar detalle de orden ${detailId}:`, error);
    throw error.response?.data || error.message;
  }
};
