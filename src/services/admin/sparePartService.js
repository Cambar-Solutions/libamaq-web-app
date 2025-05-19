import apiClient from "../apiClient";
import { createMultimedia } from "./multimediaService";

/**
 * Obtiene todos los repuestos con paginación
 * @param {number} page - Número de página (comienza en 1)
 * @param {number} size - Tamaño de página
 * @returns {Promise<Object>} - Datos de repuestos paginados
 */
export const getAllSpareParts = async (page = 1, size = 10) => {
  try {
    const { data } = await apiClient.get("/l/spare-parts", {
      params: { page, size }
    });
    return data;
  } catch (error) {
    console.error("Error al obtener repuestos:", error);
    throw error.response?.data || error.message;
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
    const { data } = await apiClient.get(`/l/product-spare-parts/product/${productId}`);
    return data.result || [];
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
    const { data } = await apiClient.get(`/l/product-spare-parts/product/${productId}/active`);
    return data.result || [];
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
    const { data } = await apiClient.get(`/l/spare-parts/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener repuesto con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene las imágenes asociadas a un repuesto
 * @param {number} sparePartId - ID del repuesto
 * @returns {Promise<Array>} - Array de imágenes asociadas al repuesto
 */
export const getSparePartImages = async (sparePartId) => {
  try {
    console.log(`Intentando obtener imágenes para el repuesto con ID ${sparePartId}`);
    
    // Según los comentarios del desarrollador backend, el endpoint /admin/sparePart/{id}
    // debería devolver todos los medios del repuesto, pero si no lo hace,
    // podemos intentar obtener las imágenes de otra manera
    
    // Intentamos obtener el repuesto completo nuevamente, ya que debería incluir las imágenes
    const { data } = await apiClient.get(`/admin/sparePart/${sparePartId}`);
    
    // Si la respuesta incluye sparePartMultimediaDto, extraemos las imágenes
    if (data.result?.sparePartMultimediaDto && Array.isArray(data.result.sparePartMultimediaDto)) {
      return data.result.sparePartMultimediaDto;
    }
    
    // Si no hay imágenes en la respuesta, devolvemos un array vacío
    console.warn(`No se encontraron imágenes para el repuesto con ID ${sparePartId}`);
    return [];
  } catch (error) {
    console.error(`Error al obtener imágenes para el repuesto con ID ${sparePartId}:`, error);
    return []; // Devolver array vacío en caso de error para no interrumpir el flujo
  }
};

/**
 * Crea un nuevo repuesto con sus imágenes y relaciones a productos
 * @param {Object} sparePartData - Datos del repuesto a crear
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const createSparePart = async (sparePartData) => {
  try {
    const { data } = await apiClient.post("/l/spare-parts", sparePartData);
    return data;
  } catch (error) {
    console.error("Error al crear repuesto:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza un repuesto existente con sus imágenes y relaciones a productos
 * @param {Object} sparePartData - Datos del repuesto a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const updateSparePart = async (sparePartData) => {
  try {
    const { data } = await apiClient.put("/l/spare-parts", sparePartData);
    return data;
  } catch (error) {
    console.error("Error al actualizar repuesto:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea un repuesto completo con imágenes y asignación a producto en un solo proceso
 * @param {Object} sparePartData - Datos básicos del repuesto
 * @param {File[]} imageFiles - Archivos de imagen a subir
 * @param {Object} productAssignment - Datos de asignación a producto (opcional)
 * @returns {Promise<Object>} - Repuesto creado con todas sus relaciones
 */
export const createSparePartWithImages = async (sparePartData, imageFiles = [], productAssignment = null) => {
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
    
    // 3. Subir las imágenes primero y obtener sus IDs
    const uploadedImages = [];
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const response = await createMultimedia(file);
        if (response && response.id) {
          uploadedImages.push({
            multimediaId: response.id,
            displayOrder: i + 1
          });
        }
      }
    }
    
    // 4. Agregar las imágenes al payload si se subieron correctamente
    if (uploadedImages.length > 0) {
      sparePartPayload.sparePartMultimediaDto = uploadedImages;
    }
    
    // 5. Crear el repuesto con todas sus relaciones
    const { data } = await apiClient.post("/admin/sparePart/create", sparePartPayload);
    return data;
  } catch (error) {
    console.error("Error al crear repuesto con imágenes:", error);
    throw error.response?.data || error.message;
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

/**
 * Elimina un repuesto (soft delete - cambio de estado a INACTIVE)
 * @param {number} id - ID del repuesto a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteSparePart = async (id) => {
  try {
    // Primero obtener el repuesto para tener todos sus datos
    const response = await getSparePartById(id);
    const sparePart = response.result || response;
    
    // Cambiar el estado a INACTIVE para realizar el soft delete
    sparePart.status = "INACTIVE";
    
    // Actualizar el repuesto con el nuevo estado
    const { data } = await apiClient.put("/admin/sparePart/update", sparePart);
    return data;
  } catch (error) {
    console.error(`Error al eliminar repuesto con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};