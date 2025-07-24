import apiClient from '../apiClient';

/**
 * @typedef {Object} Media
 * @property {number|string} id - Identificador único del medio
 * @property {string} url - URL del archivo de medios
 * @property {string} fileType - Tipo de archivo (ej: 'IMAGE')
 * @property {number|string} [entityId] - ID de la entidad relacionada
 * @property {'SPARE_PART'|'PRODUCT'} [entityType] - Tipo de entidad
 * @property {number} [displayOrder] - Orden de visualización
 */

/**
 * @typedef {Object} SparePart
 * @property {string} [id] - ID del repuesto (solo para actualización)
 * @property {string} [externalId] - ID externo del repuesto
 * @property {string} code - Código interno
 * @property {string} name - Nombre del repuesto
 * @property {string} description - Descripción detallada
 * @property {string} material - Material del repuesto
 * @property {number|string} price - Precio unitario
 * @property {number|string} stock - Cantidad en inventario
 * @property {boolean} [rentable] - Si está disponible para renta
 * @property {'ACTIVE'|'INACTIVE'} [status] - Estado del repuesto
 * @property {Media[]} [media] - Array de medios (imágenes) asociados
 * @property {string} [createdBy] - ID del usuario que creó el repuesto
 * @property {string} [updatedBy] - ID del usuario que actualizó
 */

/**
 * Obtiene todos los repuestos
 * @returns {Promise<{data: SparePart[], status: number, message: string}>}
 */
const getAllSpareParts = async () => {
  const { data } = await apiClient.get('/l/spare-parts');
  return data;
};

/**
 * Crea un nuevo repuesto
 * @param {Omit<SparePart, 'id'>} sparePartData - Datos del repuesto a crear
 * @returns {Promise<{data: SparePart, status: number, message: string}>}
 */
const createSparePart = async (sparePartData) => {
  const { data } = await apiClient.post('/l/spare-parts', {
    ...sparePartData,
    price: Number(sparePartData.price) || 0,
    stock: Number(sparePartData.stock) || 0,
    rentable: Boolean(sparePartData.rentable),
    status: sparePartData.status || 'ACTIVE',
    media: sparePartData.media?.map(media => ({
      ...media,
      entityType: 'SPARE_PART',
      entityId: 0, // Se asignará automáticamente en el backend
      displayOrder: Number(media.displayOrder) || 0
    })) || [],
    ...(sparePartData.ranking !== undefined ? { ranking: sparePartData.ranking } : {})
  });
  return data;
};

/**
 * Actualiza un repuesto existente
 * @param {string|number} id - ID del repuesto a actualizar
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
const updateSparePart = async (id, updateData) => {
  // Solo asegurarnos de que el ID sea un número
  const sparePartId = Number(id);
  
  // Crear el payload con el formato exacto que espera el backend
  const payload = {
    id: sparePartId,
    name: updateData.name,
    description: updateData.description,
    material: updateData.material,
    price: parseFloat(updateData.price),
    stock: parseInt(updateData.stock, 10),
    rentable: Boolean(updateData.rentable),
    status: updateData.status || 'ACTIVE',
    externalId: updateData.externalId,
    code: updateData.code,
    media: (updateData.media || []).map(media => ({
      id: Number(media.id),
      url: media.url,
      fileType: media.fileType || 'IMAGE',
      entityType: 'SPARE_PART',
      displayOrder: Number(media.displayOrder) || 0
    })),
    ...(updateData.ranking !== undefined ? { ranking: updateData.ranking } : {})
  };

  console.log('Enviando actualización de repuesto:', payload);
  const { data } = await apiClient.put('/l/spare-parts', payload);
  return data;
};

/**
 * Obtiene los repuestos activos
 * @returns {Promise<{data: SparePart[], status: number, message: string}>}
 */
const getActiveSpareParts = async () => {
  const { data } = await apiClient.get('/l/spare-parts/active');
  return data;
};

/**
 * Obtiene un repuesto por su ID
 * @param {string|number} id - ID del repuesto
 * @returns {Promise<{data: SparePart, status: number, message: string}>}
 */
const getSparePartById = async (id) => {
  const { data } = await apiClient.get(`/l/spare-parts/${id}`);
  return data;
};

/**
 * Elimina un repuesto por su ID
 * @param {string|number} id - ID del repuesto a eliminar
 * @returns {Promise<{data: any, status: number, message: string}>}
 */
const deleteSparePart = async (id) => {
  const { data } = await apiClient.delete(`/l/spare-parts/delete/${id}`);
  return data;
};

// Constantes para estados
const SparePartStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

const SparePartStatuses = Object.values(SparePartStatus);

export {
  getAllSpareParts,
  createSparePart,
  updateSparePart,
  getActiveSpareParts,
  getSparePartById,
  deleteSparePart,
  SparePartStatus,
  SparePartStatuses
};

export default {
  getAllSpareParts,
  createSparePart,
  updateSparePart,
  getActiveSpareParts,
  getSparePartById,
  deleteSparePart,
  SparePartStatus,
  SparePartStatuses
};