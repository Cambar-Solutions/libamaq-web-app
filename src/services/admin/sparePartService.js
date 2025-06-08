import apiClient from '../apiClient';

/**
 * @typedef {Object} Media
 * @property {string} id - Identificador único del medio
 * @property {string} url - URL del archivo de medios
 * @property {string} entityId - ID de la entidad relacionada
 * @property {'SPARE_PART'} entityType - Tipo de entidad (siempre 'SPARE_PART' para este módulo)
 * @property {'IMAGE'} fileType - Tipo de archivo
 * @property {number} displayOrder - Orden de visualización
 * @property {'ACTIVE'|'INACTIVE'} status - Estado del medio
 * @property {string} createdAt - Fecha de creación (ISO string)
 * @property {string} updatedAt - Fecha de actualización (ISO string)
 */

/**
 * @typedef {Object} SparePart
 * @property {string} [createdBy] - ID del usuario que creó el repuesto
 * @property {string|null} [updatedBy] - ID del usuario que actualizó por última vez
 * @property {string} [createdAt] - Fecha de creación (ISO string)
 * @property {string} [updatedAt] - Fecha de última actualización (ISO string)
 * @property {string|null} [deletedAt] - Fecha de eliminación (si aplica)
 * @property {string} id - Identificador único del repuesto
 * @property {string} externalId - ID externo del repuesto
 * @property {string} code - Código interno
 * @property {string} name - Nombre del repuesto
 * @property {string} description - Descripción detallada
 * @property {string} material - Material del repuesto
 * @property {number} price - Precio unitario
 * @property {number} stock - Cantidad en inventario
 * @property {boolean} rentable - Si está disponible para renta
 * @property {'ACTIVE'|'INACTIVE'} status - Estado del repuesto
 * @property {Media[]} [media] - Array de medios (imágenes) asociados
 */

/**
 * @typedef {Object} ApiResponse
 * @property {T} [data] - Datos de la respuesta
 * @property {number} status - Código de estado HTTP
 * @property {string} message - Mensaje descriptivo
 * @template T
 */

import sparePartService from './sparePartService';

/**
 * Obtiene todos los repuestos
 * @returns {Promise<ApiResponse<SparePart[]>>} Lista de repuestos
 */
export const getAllSpareParts = async () => {
  try {
    const response = await apiClient.get('/l/spare-parts');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los repuestos:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea un nuevo repuesto
 * @param {Omit<SparePart, 'id'|'createdAt'|'updatedAt'|'deletedAt'|'media'> & { 
 *   media?: Array<Omit<Media, 'id'|'createdAt'|'updatedAt'|'entityId'|'status'>> 
 * }} sparePartData - Datos del repuesto a crear
 * @returns {Promise<ApiResponse<SparePart>>} - Respuesta con el repuesto creado
 */
export const createSparePart = async (sparePartData) => {
  try {
    // Preparamos los datos del repuesto
    const payload = {
      ...sparePartData,
      // Aseguramos que los valores numéricos sean números
      price: Number(sparePartData.price) || 0,
      stock: Number(sparePartData.stock) || 0,
      // Aseguramos que rentable sea booleano
      rentable: Boolean(sparePartData.rentable),
      // Aseguramos que el estado sea válido
      status: sparePartData.status || 'ACTIVE',
      // Preparamos los medios si existen
      media: sparePartData.media?.map(media => ({
        ...media,
        // Aseguramos que el tipo de entidad sea correcto
        entityType: 'SPARE_PART',
        // El entityId se asignará automáticamente en el backend
        entityId: 0,
        // Aseguramos que el displayOrder sea un número
        displayOrder: Number(media.displayOrder) || 0
      })) || []
    };

    const response = await apiClient.post('/l/spare-parts', payload);
    return response.data;
  } catch (error) {
    console.error('Error al crear el repuesto:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un repuesto existente
 * @param {string} id - ID del repuesto a actualizar
 * @param {Partial<Omit<SparePart, 'id'|'createdAt'|'updatedAt'|'deletedAt'>> & {
 *   media?: Array<Partial<Omit<Media, 'createdAt'|'updatedAt'>> & { id?: number }>,
 *   updatedBy: string
 * }} updateData - Datos a actualizar
 * @returns {Promise<ApiResponse<SparePart>>} - Respuesta con el repuesto actualizado
 */
export const updateSparePart = async (id, updateData) => {
  try {
    // Preparamos los datos de actualización
    const payload = {
      ...updateData,
      id: Number(id),
      // Aseguramos que los valores numéricos sean números
      price: updateData.price !== undefined ? Number(updateData.price) : undefined,
      stock: updateData.stock !== undefined ? Number(updateData.stock) : undefined,
      // Aseguramos que rentable sea booleano si se proporciona
      rentable: updateData.rentable !== undefined ? Boolean(updateData.rentable) : undefined,
      // Preparamos los medios si existen
      media: updateData.media?.map(media => ({
        ...media,
        // Aseguramos que el ID sea un número si existe
        id: media.id !== undefined ? Number(media.id) : undefined,
        // Aseguramos que el tipo de entidad sea correcto
        entityType: 'SPARE_PART',
        // El entityId se asignará automáticamente en el backend
        entityId: 0,
        // Aseguramos que el displayOrder sea un número
        displayOrder: media.displayOrder !== undefined ? Number(media.displayOrder) : 0
      }))
    };

    const response = await apiClient.put(`/l/spare-parts`, payload);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el repuesto:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene todos los repuestos activos
 * @returns {Promise<ApiResponse<SparePart[]>>} - Lista de repuestos activos
 */
export const getActiveSpareParts = async () => {
  try {
    const response = await apiClient.get('/l/spare-parts/active');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los repuestos activos:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene un repuesto por su ID
 * @param {string|number} id - ID del repuesto a obtener
 * @returns {Promise<ApiResponse<SparePart>>} - Datos del repuesto
 */
export const getSparePartById = async (id) => {
  try {
    const response = await apiClient.get(`/l/spare-parts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el repuesto con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Elimina un repuesto por su ID
 * @param {string|number} id - ID del repuesto a eliminar
 * @returns {Promise<ApiResponse<{generatedMaps: any[], raw: any[], affected: number}>>} - Respuesta de la operación
 */
export const deleteSparePart = async (id) => {
  try {
    const response = await apiClient.delete(`/l/spare-parts/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el repuesto con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Exportar tipos para su uso en otros archivos
export const SparePartTypes = {
  /** @type {'ACTIVE'} */
  ACTIVE: 'ACTIVE',
  /** @type {'INACTIVE'} */
  INACTIVE: 'INACTIVE'
};

/** @type {Readonly<Array<'ACTIVE'|'INACTIVE'>>} */
export const SparePartStatuses = Object.freeze(['ACTIVE', 'INACTIVE']);

export default {
  getAllSpareParts,
  createSparePart,
  updateSparePart,
  getActiveSpareParts,
  getSparePartById,
  deleteSparePart,
  SparePartStatuses,
  SparePartTypes
};