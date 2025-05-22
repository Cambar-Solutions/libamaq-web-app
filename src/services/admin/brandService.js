import apiClient from "../apiClient";

/**
 * Obtiene todas las marcas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllBrands = async () => {
  try {
    const response = await apiClient.get("/l/brands");
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
    const response = await apiClient.get("/l/brands/active");
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
    const response = await apiClient.get(`/l/brands/${id}`);
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
    const response = await apiClient.get(`/l/brands/categories/${brandId}`);
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
    if (!brandData.name) {
      throw new Error('El nombre de la marca es obligatorio');
    }
    
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
    
    const response = await apiClient.post("/l/brands", payload);
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
    if (!brandData.id) {
      throw new Error('El ID de la marca es obligatorio para actualizarla');
    }
    
    if (Object.keys(brandData).length === 2 && brandData.id && brandData.status !== undefined) {
      return changeBrandStatus(brandData.id, brandData.status);
    }
    
    const currentBrandResponse = await getBrandById(brandData.id);
    if (!currentBrandResponse || !currentBrandResponse.data) {
      throw new Error(`No se pudo obtener la marca con ID ${brandData.id}`);
    }
    
    const currentBrand = currentBrandResponse.data;
    
    // Preparar el payload exactamente como se espera en el DTO
    const payload = {
      id: Number(brandData.id),
      updatedBy: "1",
      updatedAt: new Date().toISOString(),
      name: brandData.name || currentBrand.name,
      description: brandData.description || currentBrand.description || "",
      color: brandData.color || currentBrand.color || "#000000",
      url: brandData.url || currentBrand.url || "",
      status: brandData.status || currentBrand.status || "ACTIVE",
      categoryIds: brandData.categoryIds || []
    };
    
    const response = await apiClient.put("/l/brands", payload);
    return response.data;
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
    if (newStatus !== "ACTIVE" && newStatus !== "INACTIVE") {
      throw new Error(`Estado inválido: ${newStatus}. Debe ser ACTIVE o INACTIVE`);
    }
    
    // Obtener la marca actual
    const brandResponse = await getBrandById(id);
    if (!brandResponse || !brandResponse.data) {
      throw new Error(`No se pudo obtener la marca con ID ${id}`);
    }
    
    const brandData = brandResponse.data;
    
    // Preparar el payload exactamente como se espera en el DTO
    const payload = {
      id: Number(id),
      updatedBy: "1",
      updatedAt: new Date().toISOString(),
      name: brandData.name || "",
      description: brandData.description || "",
      color: brandData.color || "#000000",
      url: brandData.url || "",
      status: newStatus,
      categoryIds: []
    };
    
    const response = await apiClient.put("/l/brands", payload);
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
    if (!relationData.id || !relationData.brandId || !relationData.categoryId) {
      throw new Error('ID de relación, marca y categoría son obligatorios');
    }
    
    const payload = {
      id: Number(relationData.id),
      brandId: Number(relationData.brandId),
      categoryId: Number(relationData.categoryId)
    };
    
    const response = await apiClient.put("/l/brands/categories", payload);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar relación marca-categoría:', error);
    throw error.response?.data || error;
  }
};