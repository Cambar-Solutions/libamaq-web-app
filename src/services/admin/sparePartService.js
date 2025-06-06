import apiClient from "../apiClient";
import { uploadMedia, updateMediaForEntity } from "./mediaService";

// Endpoint base para repuestos
const SPARE_PARTS_ENDPOINT = '/l/spare-parts';

/**
 * Obtiene todos los repuestos
 * @returns {Promise<Object>} - Lista de repuestos
 */
export const getAllSpareParts = async () => {
  try {
    const response = await apiClient.get(SPARE_PARTS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error al obtener repuestos:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene todos los repuestos activos
 * @returns {Promise<Object>} - Lista de repuestos activos
 */
export const getActiveSpareParts = async () => {
  try {
    const response = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/active`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener repuestos activos:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene un repuesto por su ID
 * @param {number|string} id - ID del repuesto
 * @returns {Promise<Object>} - Datos del repuesto en formato { result: {...} }
 */
export const getSparePartById = async (id) => {
  try {
    console.log(`Obteniendo repuesto con ID: ${id}`);
    const response = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/${id}`);
    console.log('Respuesta de la API para getSparePartById:', response);
    
    // La respuesta tiene la forma { data: {...}, status: 200, message: 'success' }
    if (response?.data?.data) {
      return { result: response.data.data };
    } 
    // Si la respuesta es directa (sin data anidada)
    else if (response?.data) {
      return { result: response.data };
    }
    
    console.warn('La respuesta no contiene datos válidos:', response);
    return { result: null };
  } catch (error) {
    console.error(`Error al obtener repuesto con ID ${id}:`, error);
    throw error.response?.data || error.message || error;
  }
};

/**
 * Crea un nuevo repuesto
 * @param {Object} sparePartData - Datos del repuesto a crear
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const createSparePart = async (sparePartData) => {
  try {
    const response = await apiClient.post(SPARE_PARTS_ENDPOINT, sparePartData);
    return response.data;
  } catch (error) {
    console.error('Error al crear repuesto:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un repuesto existente
 * @param {Object} sparePartData - Datos actualizados del repuesto
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const updateSparePart = async (sparePartData) => {
  try {
    // Asegurarse de que el ID sea un número
    const sparePartId = Number(sparePartData.id);
    if (isNaN(sparePartId) || sparePartId <= 0) {
      throw new Error('ID de repuesto no válido');
    }

    // Crear un nuevo objeto para evitar modificar el original
    const dataToSend = {
      ...sparePartData,
      id: sparePartId, // Asegurar que el ID sea un número
      price: Number(sparePartData.price) || 0,
      stock: Number(sparePartData.stock) || 0,
      // Asegurar que rentable sea un booleano
      rentable: Boolean(sparePartData.rentable)
    };

    console.log('Enviando datos de actualización:', dataToSend);
    
    const response = await apiClient.put(
      `${SPARE_PARTS_ENDPOINT}`, 
      dataToSend
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar repuesto:`, error);
    // Mejorar el manejo de errores
    const errorData = error.response?.data || { message: error.message };
    console.error('Detalles del error:', errorData);
    throw errorData;
  }
};

/**
 * Elimina un repuesto
 * @param {number} id - ID del repuesto a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteSparePart = async (id) => {
  try {
    const response = await apiClient.delete(`${SPARE_PARTS_ENDPOINT}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar repuesto ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Sube archivos multimedia para un repuesto
 * @param {File|File[]} files - Archivo o array de archivos a subir
 * @returns {Promise<Array>} - Array con la información de los archivos subidos
 */
export const uploadSparePartMedia = async (files) => {
  try {
    return await uploadMedia(files);
  } catch (error) {
    console.error('Error al subir archivos multimedia para repuesto:', error);
    throw error.response?.data || error.message || error;
  }
};

/**
 * Crea un repuesto con imágenes que ya han sido subidas
 * @param {Object} sparePartData - Datos del repuesto incluyendo el array de media
 * @returns {Promise<Object>} - Repuesto creado
 */
export const createSparePartWithImages = async (sparePartData) => {
  try {
    console.log('Iniciando creación de repuesto con imágenes ya subidas');
    console.log('Datos del repuesto:', {
      ...sparePartData,
      media: `Array(${sparePartData.media?.length || 0} imágenes)`
    });
    
    // Crear el repuesto con las referencias a las imágenes ya subidas
    const sparePartPayload = {
      ...sparePartData,
      // Asegurar que los campos numéricos sean números
      price: sparePartData.price ? Number(sparePartData.price) : 0,
      stock: sparePartData.stock ? Number(sparePartData.stock) : 0,
      // Asegurar que el estado sea válido
      status: sparePartData.status || 'ACTIVE',
      // Fecha de creación si no está presente
      createdAt: sparePartData.createdAt || new Date().toISOString(),
      // Usar las imágenes ya subidas
      media: (sparePartData.media || []).map(media => ({
        ...media,
        // Asegurar que entityType sea correcto
        entityType: 'SPARE_PART',
        // Asegurar que el ID sea un número
        id: media.id ? Number(media.id) : 0
      }))
    };
    
    console.log('Creando repuesto con referencias a imágenes...');
    const response = await createSparePart(sparePartPayload);
    
    console.log('Repuesto creado exitosamente:', response);
    return response;
    
  } catch (error) {
    console.error('Error al crear repuesto con imágenes:', error);
    throw error.response?.data || error.message || error;
  }
};
