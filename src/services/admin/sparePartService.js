import apiClient from "../apiClient";

// Configuración base para las peticiones
const SPARE_PARTS_ENDPOINT = '/l/spare-parts';
const MEDIA_ENDPOINT = '/l/media';

// Constantes para tipos de entidad y archivo
const ENTITY_TYPE_SPARE_PART = 'SPARE_PART';
const FILE_TYPE_IMAGE = 'IMAGE';

/**
 * Obtiene todos los repuestos con paginación
 * @param {number} page - Número de página (comienza en 1)
 * @param {number} size - Tamaño de página
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} - Datos de repuestos paginados
 */
export const getAllSpareParts = async (page = 1, size = 10, filters = {}) => {
  try {
    // Usar el endpoint de repuestos activos por defecto, a menos que se especifique lo contrario
    const endpoint = filters.status === 'ALL' ? SPARE_PARTS_ENDPOINT : `${SPARE_PARTS_ENDPOINT}/active`;
    
    // Eliminar el filtro de estado para el endpoint de activos
    const { status, ...otherFilters } = filters;
    
    const response = await apiClient.get(endpoint, {
      params: { 
        page: page - 1, // Ajuste para la paginación basada en 0
        size,
        ...(status === 'ALL' ? filters : otherFilters)
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
    // Desestructuro para obtener el id y el resto de campos
    const { id, externalId, code, name, description, material, price, stock, rentable, status, media, updatedBy, updatedAt } = sparePartData;

    // 1) Construyo el objeto EXACTO que el backend espera según tu Swagger:
    const requestData = {
      id:         parseInt(id, 10),
      updatedBy:  updatedBy  || "1",                       // Usuario que edita (o tu lógica de auth)
      updatedAt:  updatedAt  || new Date().toISOString(), // Timestamp ISO
      externalId: externalId || "",
      code:       code       || "",
      name:       name       || "",
      description:description || "",
      material:   material   || "",
      price:      parseFloat(price) || 0,
      stock:      parseInt(stock, 10)   || 0,
      rentable:   (typeof rentable === "boolean") ? rentable : false,
      status:     status     || "ACTIVE",
      media:      []
    };

    // 2) Si tu sparePartData.media existe y es array, normalízalo:
    if (Array.isArray(media)) {
      requestData.media = media.map(m => ({
        id:           m.id           || 0,
        url:          m.url          || "",
        fileType:     m.fileType     || "IMAGE",
        entityId:     parseInt(id, 10),
        entityType:   m.entityType   || "SPARE_PART", // O "PRODUCT" si el back explícitamente solo acepta eso
        displayOrder: m.displayOrder || 0
      }));
    }

    console.log("→ PUT a:", SPARE_PARTS_ENDPOINT, "\n   Payload:", requestData);

    // 3) Llamo exactamente a /l/spare-parts (sin id en la ruta)
    const response = await apiClient.put(SPARE_PARTS_ENDPOINT, requestData);
    console.log("← Respuesta exitosa:", response.data);

    return { result: response.data };
  }
  catch (error) {
    console.error("Error al actualizar repuesto:", error);
    if (error.response) {
      console.error("→ Respuesta del servidor (error):", error.response.data);
      console.error("→ HTTP Status:", error.response.status);
    }
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
    formData.append('file', file);

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    };

    // Subir el archivo
    const response = await apiClient.post(
      `${MEDIA_ENDPOINT}/upload`,
      formData,
      config
    );

    console.log('Respuesta completa de subida de archivo:', response);

    // Verificar que la respuesta tenga la estructura esperada
    if (!response.data || !response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
      console.error('Estructura de respuesta inesperada:', response.data);
      throw new Error('La respuesta del servidor no tiene el formato esperado');
    }

    const uploadedFile = response.data.data[0];
    
    if (!uploadedFile.url) {
      console.error('URL no encontrada en la respuesta:', uploadedFile);
      throw new Error('No se recibió una URL válida en la respuesta');
    }

    console.log('Archivo subido exitosamente. URL:', uploadedFile.url);
    return { url: uploadedFile.url };
  } catch (error) {
    console.error('Error al subir archivo multimedia:', error);
    throw error.response?.data?.message || error.message || 'Error al subir el archivo';
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
        // Usar el formato UpdateMediaDTO esperado por el backend
        uploadedMedia.push({
          id: 0, // ID temporal, el backend lo asignará
          url: uploadResult.url || uploadResult.data?.[0]?.url, // Ajustar según la respuesta real
          fileType: FILE_TYPE_IMAGE,
          entityType: ENTITY_TYPE_SPARE_PART,
          displayOrder: i,
          status: 'ACTIVE'
        });
      }
    }
    
    // 4. Agregar los medios al payload según el formato esperado
    if (uploadedMedia.length > 0) {
      sparePartPayload.media = uploadedMedia;
    } else {
      // Si no hay imágenes, asegurarse de que el campo media sea un array vacío
      sparePartPayload.media = [];
    }
    
    // 5. Crear el repuesto con todas sus relaciones
    const result = await createSparePart(sparePartPayload);
    return result;
  } catch (error) {
    console.error("Error al crear repuesto con imágenes:", error);
    throw error.response?.data?.message || error.message || 'Error al crear el repuesto';
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
        id: productAssignment.id || 0, // Incluir ID si existe
        productId: productAssignment.productId,
        compatibilityNotes: productAssignment.compatibilityNotes || ""
      };
    }
    
    // 3. Preparar el array de medios actualizado
    const updatedMedia = [];
    
    // 4. Procesar imágenes existentes si las hay
    if (existingImages && existingImages.length > 0) {
      existingImages.forEach(img => {
        updatedMedia.push({
          id: img.id || 0,
          url: img.url,
          fileType: FILE_TYPE_IMAGE,
          entityType: ENTITY_TYPE_SPARE_PART,
          entityId: sparePartData.id,
          displayOrder: img.displayOrder || 0,
          status: 'ACTIVE'
        });
      });
    }
    
    // 5. Subir las nuevas imágenes
    if (newImageFiles && newImageFiles.length > 0) {
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const uploadResult = await uploadMediaFile(file);
        
        if (uploadResult && uploadResult.url) {
          updatedMedia.push({
            id: 0, // Nuevo registro
            url: uploadResult.url || uploadResult.data?.[0]?.url,
            fileType: FILE_TYPE_IMAGE,
            entityType: ENTITY_TYPE_SPARE_PART,
            entityId: sparePartData.id,
            displayOrder: updatedMedia.length + 1,
            status: 'ACTIVE'
          });
        }
      }
    }
    
    // 6. Agregar los medios al payload según el formato esperado
    sparePartPayload.media = updatedMedia;
    
    // 7. Actualizar el repuesto con todas sus relaciones
    const result = await updateSparePart(sparePartPayload);
    return result;
  } catch (error) {
    console.error("Error al actualizar repuesto con imágenes:", error);
    throw error.response?.data?.message || error.message || 'Error al actualizar el repuesto';
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
    // El endpoint para eliminar medios acepta un array de IDs en el cuerpo de la petición
    const response = await apiClient.post(`${MEDIA_ENDPOINT}/delete`, [mediaId]);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar medio con ID ${mediaId}:`, error);
    throw error.response?.data?.message || error.message || 'Error al eliminar la imagen';
  }
};

/**
 * Obtiene las imágenes asociadas a un repuesto
 * @param {number} sparePartId - ID del repuesto
 * @returns {Promise<Array>} - Array de imágenes asociadas al repuesto
 */
export const getSparePartImages = async (sparePartId) => {
  try {
    // Obtener el repuesto completo que ya incluye las imágenes
    const response = await apiClient.get(`${SPARE_PARTS_ENDPOINT}/${sparePartId}`);
    
    // Verificar si hay imágenes en la respuesta
    if (response.data?.result?.images) {
      return Array.isArray(response.data.result.images) ? response.data.result.images : [response.data.result.images];
    }
    
    // Si no hay imágenes, devolver array vacío
    return [];
  } catch (error) {
    console.error(`Error al obtener imágenes del repuesto ${sparePartId}:`, error);
    // En caso de error, devolver un array vacío para no romper la UI
    return [];
  }
};