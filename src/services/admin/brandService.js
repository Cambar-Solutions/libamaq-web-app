import apiClient from "../apiClient";
import axios from "axios";

/**
 * Obtiene todas las marcas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllBrands = async () => {
  try {
    console.log('Obteniendo todas las marcas...');
    const response = await apiClient.get("/l/brands");
    console.log('Respuesta de marcas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene todas las marcas activas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllActiveBrands = async () => {
  try {
    console.log('Obteniendo marcas activas...');
    const response = await apiClient.get("/l/brands/active");
    console.log('Respuesta de marcas activas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener marcas activas:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una marca por su ID
 * @param {number} id - ID de la marca
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getBrandById = async (id) => {
  try {
    console.log(`Obteniendo marca con ID ${id}...`);
    const response = await apiClient.get(`/l/brands/${id}`);
    console.log('Respuesta de marca por ID:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener marca con ID ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Obtiene categorías por marca
 * @param {number} brandId - ID de la marca
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getCategoriesByBrand = async (brandId) => {
  try {
    console.log(`Obteniendo categorías para marca ${brandId}...`);
    const response = await apiClient.get(`/l/brands/categories/${brandId}`);
    console.log('Respuesta de categorías por marca:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener categorías para marca ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva marca
 * @param {Object} brandData - Datos de la marca a crear según CreateBrandDto
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createBrand = async (brandData) => {
  try {
    // Validar campos requeridos
    if (!brandData.name) {
      throw new Error('El nombre de la marca es obligatorio');
    }
    
    // Preparar payload con valores por defecto para campos opcionales
    const payload = {
      createdBy: brandData.createdBy || "1",
      createdAt: brandData.createdAt || new Date().toISOString(),
      name: brandData.name,
      description: brandData.description || "",
      color: brandData.color || "#000000",
      url: brandData.url || "",
      status: brandData.status || "ACTIVE",
      categoryIds: Array.isArray(brandData.categoryIds) ? brandData.categoryIds : []
    };
    
    console.log('Creando marca (PAYLOAD EXITOSO):', JSON.stringify(payload, null, 2));
    const response = await apiClient.post("/l/brands", payload);
    console.log('Respuesta de creación de marca (EXITOSA):', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error al crear marca:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualiza una marca existente
 * @param {Object} brandData - Datos de la marca a actualizar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateBrand = async (brandData) => {
  try {
    // Validar que el ID es obligatorio para actualizar
    if (!brandData.id) {
      throw new Error('El ID de la marca es obligatorio para actualizarla');
    }
    
    // Si solo tenemos id y status, redirigir a changeBrandStatus
    if (Object.keys(brandData).length === 2 && brandData.id && brandData.status !== undefined) {
      return changeBrandStatus(brandData.id, brandData.status);
    }
    
    // Primero, obtener la marca actual para tener todos los datos
    console.log(`Obteniendo datos actuales de la marca ID ${brandData.id} antes de actualizar...`);
    const currentBrandResponse = await getBrandById(brandData.id);
    if (!currentBrandResponse || !currentBrandResponse.data) {
      throw new Error(`No se pudo obtener la marca con ID ${brandData.id}`);
    }
    
    const currentBrand = currentBrandResponse.data;
    console.log('Datos actuales de la marca:', JSON.stringify(currentBrand, null, 2));
    
    // Crear un payload similar al de createBrand que sabemos que funciona
    const payload = {
      id: Number(brandData.id),
      // Usar el formato exacto de createBrand pero con updatedBy en lugar de createdBy
      updatedBy: "1",
      updatedAt: new Date().toISOString(),
      name: brandData.name || currentBrand.name,
      description: brandData.description || currentBrand.description || "",
      color: brandData.color || currentBrand.color || "#000000",
      url: brandData.url || currentBrand.url || "",
      status: brandData.status || currentBrand.status || "ACTIVE",
      // Intentar con un array vacío primero
      categoryIds: []
    };
    
    console.log('Actualizando marca (NUEVO PAYLOAD):', JSON.stringify(payload, null, 2));
    
    // Intentar con este nuevo formato
    try {
      const response = await apiClient.put("/l/brands", payload);
      console.log('Respuesta de actualización de marca (EXITOSA):', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (innerError) {
      console.error('Error con el nuevo formato, intentando sin categoryIds:', innerError);
      
      // Intentar sin el campo categoryIds
      const minimalPayload = {
        id: Number(brandData.id),
        updatedBy: "1",
        updatedAt: new Date().toISOString(),
        name: brandData.name || currentBrand.name,
        description: brandData.description || currentBrand.description || "",
        color: brandData.color || currentBrand.color || "#000000",
        url: brandData.url || currentBrand.url || "",
        status: brandData.status || currentBrand.status || "ACTIVE"
      };
      
      console.log('Intentando con payload mínimo (sin categoryIds):', JSON.stringify(minimalPayload, null, 2));
      const minimalResponse = await apiClient.put("/l/brands", minimalPayload);
      console.log('Respuesta con payload mínimo:', JSON.stringify(minimalResponse.data, null, 2));
      return minimalResponse.data;
    }
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cambiar el estado de una marca (activar/desactivar)
 * @param {number} id - ID de la marca
 * @param {string} newStatus - Nuevo estado de la marca (ACTIVE o INACTIVE)
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const changeBrandStatus = async (id, newStatus) => {
  try {
    // Validar el nuevo estado
    if (newStatus !== "ACTIVE" && newStatus !== "INACTIVE") {
      throw new Error(`Estado inválido: ${newStatus}. Debe ser ACTIVE o INACTIVE`);
    }
    
    // Primero obtener los datos completos de la marca
    const brandResponse = await getBrandById(id);
    if (!brandResponse || !brandResponse.data) {
      throw new Error(`No se pudo obtener la marca con ID ${id}`);
    }
    
    const brandData = brandResponse.data;
    
    // Preparar payload completo para la actualización según el formato de Swagger
    const payload = {
      id: Number(id),
      updatedBy: "1",
      updatedAt: new Date().toISOString(),
      name: brandData.name || "",
      description: brandData.description || "",
      color: brandData.color || "#000000",
      url: brandData.url || "",
      status: newStatus,
      // Si hay categorías, incluirlas
      categoryIds: Array.isArray(brandData.brandCategories) 
        ? brandData.brandCategories.map(cat => Number(cat.categoryId)) 
        : []
    };
    
    console.log(`Cambiando estado de marca ${id} a ${newStatus}`, payload);
    const response = await apiClient.put("/l/brands", payload);
    console.log('Respuesta de cambio de estado:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de marca ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Actualiza la relación entre marca y categoría
 * @param {Object} relationData - Datos de la relación según UpdateBrandCategoryDto
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateBrandCategory = async (relationData) => {
  try {
    // Validar que los campos requeridos estén presentes
    if (!relationData.id || !relationData.brandId || !relationData.categoryId) {
      throw new Error('Los campos id, brandId y categoryId son obligatorios');
    }
    
    // Asegurarse de que los IDs sean números
    const payload = {
      id: Number(relationData.id),
      brandId: Number(relationData.brandId),
      categoryId: Number(relationData.categoryId)
    };
    
    console.log('Actualizando relación marca-categoría:', payload);
    const response = await apiClient.put("/l/brand-categories", payload);
    console.log('Respuesta de actualización de relación marca-categoría:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar relación marca-categoría:', error);
    throw error.response?.data || error;
  }
};

/**
 * Prepara un objeto de marca para crear o actualizar
 * @param {Object} brandData - Datos básicos de la marca
 * @param {boolean} isUpdate - Indica si es una actualización (true) o creación (false)
 * @returns {Object} Objeto formateado según el DTO correspondiente
 */
export const prepareBrandDTO = (brandData, isUpdate = false) => {
  if (isUpdate) {
    // Para actualización
    return {
      id: Number(brandData.id),
      name: brandData.name,
      description: brandData.description || "",
      color: brandData.color || "#000000",
      url: brandData.url || "",
      status: brandData.status || "ACTIVE",
      categoryIds: Array.isArray(brandData.categoryIds) ? brandData.categoryIds.map(id => Number(id)) : []
    };
  } else {
    // Para creación, usar CreateBrandDto
    return {
      createdBy: brandData.createdBy || "1",
      createdAt: brandData.createdAt || new Date().toISOString(),
      name: brandData.name,
      description: brandData.description || "",
      color: brandData.color || "#000000",
      url: brandData.url || "",
      status: brandData.status || "ACTIVE",
      categoryIds: Array.isArray(brandData.categoryIds) ? brandData.categoryIds.map(id => Number(id)) : []
    };
  }
};