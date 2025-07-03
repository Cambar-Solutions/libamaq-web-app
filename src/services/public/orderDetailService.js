import apiClient from "../apiClient";

// --- Funciones para Order Details (Detalles de la Orden) ---

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
    // Aquí el 'id' del detalle de la orden se espera dentro del 'updateData' (el request body).
    console.log(`Actualizando detalle de orden ${updateData.id} con datos:`, updateData);
    // El endpoint para actualizar un detalle de orden es PUT /l/order-details (sin el ID en la URL).
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

// --- Funciones para Orders (Órdenes) ---

/**
 * Actualiza el estado de una orden (ej. para marcar un carrito como "comprado").
 * @param {string|number} orderId - ID de la orden a actualizar.
 * @param {string} newStatus - El nuevo estado de la orden (ej. 'purchased', 'completed', 'pending', etc.).
 * @returns {Promise<Object>} Objeto con la respuesta de la API.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    console.log(`Actualizando estado de la orden ${orderId} a: ${newStatus}`);
    // El endpoint es PUT /l/orders/{orderId}/status.
    // Asumo que tu API espera el estado como un objeto JSON { "status": "nuevo_estado" } en el cuerpo.
    const { data } = await apiClient.put(`/l/orders/${orderId}/status`, { status: newStatus });
    console.log(`Respuesta de actualización de estado de orden ${orderId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al actualizar estado de la orden ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Las funciones previas (getOrdersByUser, getOrderById, createOrder, getOrderDetailsByOrderId, getOrderDetailById)
// que ya tenías siguen siendo válidas y necesarias para la lógica del carrito.