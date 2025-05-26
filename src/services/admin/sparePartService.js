import apiClient from "../apiClient";

// Configuración base para las peticiones
const API_PREFIX = '/l';
const SPARE_PARTS_ENDPOINT = `${API_PREFIX}/spare-parts`;
const MEDIA_ENDPOINT = `${API_PREFIX}/media`;

/**
 * Obtiene todos los repuestos con paginación
 * @param {number} page - Número de página (comienza en 1)
 * @param {number} size - Tamaño de página
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} - Datos de repuestos paginados
 */
export const getAllSpareParts = async (page = 1, size = 10, filters = {}) => {
  try {
    const response = await apiClient.get(SPARE_PARTS_ENDPOINT, {
      params: { 
        page: page - 1, // Ajuste para la paginación basada en 0
        size,
        ...filters
      }
    });
    
    console.log('Respuesta original de la API:', response.data);
    
    // Extraer los datos según el formato de respuesta que estamos recibiendo
    const responseData = response.data;
    
    // Adaptar la respuesta al formato esperado por el frontend
    return {
      ...responseData,
      content: responseData.data || [], // Los repuestos están en data.data
      totalElements: responseData.totalElements || responseData.data?.length || 0,
      totalPages: responseData.totalPages || 1,
      size: responseData.size || size,
      number: (responseData.number || 0) + 1, // Ajuste para la paginación basada en 1
      data: responseData.data || [] // Mantener también en data para compatibilidad
    };
  } catch (error) {
    console.error("Error al obtener repuestos:", error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Obtiene los repuestos asociados a un producto específico
 * @param {number} productId - ID del producto
 * @returns {Promise<Array>} - Lista de repuestos asociados al producto
 */
export const getSparePartsByProduct = async (productId) => {
  try {
    console.log(`Obteniendo repuestos para el producto con ID ${productId}`);
    const { data } = await apiClient.get(`${API_PREFIX}/products/${productId}/spare-parts`);
    return data || [];
  } catch (error) {
    console.error(`Error al obtener repuestos para el producto con ID ${productId}:`, error);
    return []; // Devolver array vacío en caso de error para no interrumpir el flujo
  }
};

/**
 * Obtiene los repuestos activos asociados a un producto específico (endpoint público)
 * @param {number} productId - ID del producto
 * @returns {Promise<Array>} - Lista de repuestos activos asociados al producto
 */
export const getActiveSparePartsByProduct = async (productId) => {
  try {
    console.log(`Obteniendo repuestos activos para el producto con ID ${productId}`);
    const { data } = await apiClient.get(`${API_PREFIX}/products/${productId}/spare-parts/active`);
    return data || [];
  } catch (error) {
    console.error(`Error al obtener repuestos activos para el producto con ID ${productId}:`, error);
    return []; // Devolver array vacío en caso de error para no interrumpir el flujo
  }
};

/**
 * Obtiene un repuesto por su ID, incluyendo imágenes y relaciones con productos
 * @param {number} id - ID del repuesto
 * @returns {Promise<Object>} - Datos completos del repuesto
 */
export const getSparePartById = async (id) => {
  try {
    const { data } = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/${id}`);
    return { result: data };
  } catch (error) {
    console.error(`Error al obtener repuesto con ID ${id}:`, error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Obtiene las imágenes asociadas a un repuesto
 * @param {number} sparePartId - ID del repuesto
 * @returns {Promise<Array>} - Array de imágenes asociadas al repuesto
 */
export const getSparePartImages = async (sparePartId) => {
  try {
    console.log(`Obteniendo imágenes para el repuesto con ID ${sparePartId}`);
    const { data } = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/${sparePartId}/media`);
    return data || [];
  } catch (error) {
    console.error(`Error al obtener imágenes para el repuesto con ID ${sparePartId}:`, error);
    return [];
  }
};

/**
 * Crea un nuevo repuesto con sus imágenes y relaciones a productos
 * @param {Object} sparePartData - Datos del repuesto a crear
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const createSparePart = async (sparePartData) => {
  try {
    const { data } = await apiClient.post(SPARE_PARTS_ENDPOINT, sparePartData);
    return { result: data };
  } catch (error) {
    console.error("Error al crear repuesto:", error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Actualiza un repuesto existente con sus imágenes y relaciones a productos
 * @param {Object} sparePartData - Datos del repuesto a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const updateSparePart = async (sparePartData) => {
  try {
    const { id, ...updateData } = sparePartData;
    const { data } = await apiClient.put(`${SPARE_PARTS_ENDPOINT}/${id}`, updateData);
    return { result: data };
  } catch (error) {
    console.error("Error al actualizar repuesto:", error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Elimina un repuesto (borrado físico)
 * @param {number} id - ID del repuesto a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteSparePart = async (id) => {
  try {
    const { data } = await apiClient.delete(`${SPARE_PARTS_ENDPOINT}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al eliminar repuesto con ID ${id}:`, error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Realiza un soft delete de un repuesto (cambia su estado a INACTIVE)
 * @param {number} id - ID del repuesto a desactivar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const softDeleteSparePart = async (id) => {
  try {
    // Primero obtener el repuesto para tener todos sus datos
    const response = await getSparePartById(id);
    const sparePart = response.result || response;
    
    // Cambiar el estado a INACTIVE para realizar el soft delete
    sparePart.status = "INACTIVE";
    
    // Actualizar el repuesto con el nuevo estado
    const result = await updateSparePart(sparePart);
    return result;
  } catch (error) {
    console.error(`Error al desactivar repuesto con ID ${id}:`, error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Sube un archivo multimedia al servidor
 * @param {File} file - Archivo a subir
 * @param {Function} onUploadProgress - Función para reportar el progreso de la carga
 * @returns {Promise<Object>} - Datos del archivo subido
 */
export const uploadMediaFile = async (file, onUploadProgress = null) => {
  try {
    const formData = new FormData();
    // Usar 'media' como nombre del campo
    formData.append('media', file);

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    };

    const response = await apiClient.post(
      `${API_PREFIX}/media/upload`,
      formData,
      config
    );

    return response.data;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Crea un nuevo repuesto con imágenes y asignación a producto
 * @param {Object} sparePartData - Datos básicos del repuesto
 * @param {File[]} imageFiles - Archivos de imagen a subir
 * @param {Object} productAssignment - Datos de asignación a producto (opcional)
 * @param {Function} onProgress - Función para reportar el progreso de la carga
 * @returns {Promise<Object>} - Repuesto creado con todas sus relaciones
 */
export const createSparePartWithImages = async (sparePartData, imageFiles = [], productAssignment = null, onProgress = null) => {
  try {
    // 1. Preparar el objeto de datos del repuesto
    const sparePartPayload = { ...sparePartData };
    
    // 2. Si hay asignación a producto, agregarla al payload
    if (productAssignment && productAssignment.productId) {
      sparePartPayload.productSparePartDto = {
        productId: productAssignment.productId,
        compatibilityNotes: productAssignment.compatibilityNotes || ""
      };
    }
    
    // 3. Subir las imágenes
    const uploadedMedia = [];
    
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // Función para reportar el progreso de la carga
        const progressCallback = onProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(i, percentCompleted, file.name);
        } : null;

        // Subir el archivo
        const uploadResult = await uploadMediaFile(file, progressCallback);
        
        // Preparar el objeto de media para el repuesto
        uploadedMedia.push({
          id: 0, // ID temporal, el backend lo asignará
          url: uploadResult.url,
          fileType: file.type.startsWith('image/') ? 'IMAGE' : 'OTHER',
          entityType: 'SPARE_PART',
          displayOrder: i
        });
      }
    }
    
    // 4. Agregar los medios al payload
    if (uploadedMedia.length > 0) {
      sparePartPayload.media = uploadedMedia;
    }
    
    // 5. Crear el repuesto con todas sus relaciones
    const result = await createSparePart(sparePartPayload);
    return result;
  } catch (error) {
    console.error("Error al crear repuesto con imágenes:", error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Actualiza un repuesto existente con nuevas imágenes y/o asignación a producto
 * @param {Object} sparePartData - Datos básicos del repuesto
 * @param {File[]} newImageFiles - Nuevos archivos de imagen a subir (opcional)
 * @param {Array} existingImages - Imágenes existentes a mantener (opcional)
 * @param {Object} productAssignment - Datos de asignación a producto (opcional)
 * @returns {Promise<Object>} - Repuesto actualizado con todas sus relaciones
 */
export const updateSparePartWithImages = async (sparePartData, newImageFiles = [], existingImages = [], productAssignment = null) => {
  try {
    // 1. Preparar el objeto de datos del repuesto
    const sparePartPayload = { ...sparePartData };
    
    // 2. Si hay asignación a producto, agregarla al payload
    if (productAssignment && productAssignment.productId) {
      sparePartPayload.productSparePartDto = {
        productId: productAssignment.productId,
        compatibilityNotes: productAssignment.compatibilityNotes || ""
      };
      
      // Si existe un ID para la relación, incluirlo
      if (productAssignment.id) {
        sparePartPayload.productSparePartDto.id = productAssignment.id;
      }
    }
    
    // 3. Preparar las imágenes existentes
    const allImages = [...existingImages];
    
    // 4. Subir las nuevas imágenes y obtener sus IDs
    if (newImageFiles && newImageFiles.length > 0) {
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const response = await createMultimedia(file);
        if (response && response.id) {
          allImages.push({
            multimediaId: response.id,
            displayOrder: existingImages.length + i + 1,
            sparePartId: sparePartData.id
          });
        }
      }
    }
    
    // 5. Agregar todas las imágenes al payload
    if (allImages.length > 0) {
      sparePartPayload.sparePartMultimediaDto = allImages.map((img, index) => ({
        multimediaId: img.multimediaId || img.id,
        displayOrder: img.displayOrder || (index + 1),
        sparePartId: sparePartData.id,
        id: img.id // Incluir el ID de la relación si existe
      }));
    } else {
      // Si no hay imágenes, enviar un array vacío para eliminar todas las relaciones existentes
      sparePartPayload.sparePartMultimediaDto = [];
    }
    
    // 6. Actualizar el repuesto con todas sus relaciones
    const { data } = await apiClient.put("/admin/sparePart/update", sparePartPayload);
    return data;
  } catch (error) {
    console.error("Error al actualizar repuesto con imágenes:", error);
    throw error.response?.data || error.message;
  }
};

// La función deleteSparePart ya está definida arriba

/**
 * Elimina un medio asociado a un repuesto
 * @param {number} mediaId - ID del medio a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteSparePartMedia = async (mediaId) => {
  try {
    // Según las imágenes que mostraste, el endpoint para eliminar medios es /l/media/delete
    // y acepta un array de IDs en el cuerpo de la petición
    const { data } = await apiClient.post(`${API_PREFIX}/media/delete`, [mediaId]);
    return data;
  } catch (error) {
    console.error(`Error al eliminar medio con ID ${mediaId}:`, error);
    throw error.response?.data?.message || error.message;
  }
};