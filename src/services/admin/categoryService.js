import apiClient from "../apiClient";

/**
 * Obtiene todas las categorías
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getAllCategories = async () => {
  try {
    console.log('Obteniendo todas las categorías...');
    const response = await apiClient.get("/l/categories");
    console.log('Respuesta de categorías:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene todas las categorías activas
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getActiveCategories = async () => {
  try {
    console.log('Obteniendo categorías activas...');
    const response = await apiClient.get("/l/categories/active");
    console.log('Respuesta de categorías activas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías activas:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Obtiene una categoría por su ID
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const getCategoryById = async (id) => {
  try {
    console.log(`Obteniendo categoría con ID ${id}...`);
    const response = await apiClient.get(`/l/categories/${id}`);
    console.log('Respuesta de categoría por ID:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener categoría con ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Crea una nueva categoría
 * @param {Object} categoryData - Datos de la categoría a crear según CreateCategoryDto
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const createCategory = async (categoryData) => {
  try {
    // Validar que el nombre es obligatorio
    if (!categoryData.name) {
      throw new Error('El nombre de la categoría es obligatorio');
    }
    
    // Preparar el payload según el DTO
    const payload = {
      createdBy: categoryData.createdBy || "1",
      createdAt: categoryData.createdAt || new Date().toISOString(),
      name: categoryData.name,
      description: categoryData.description || "",
      url: categoryData.url || "",
      status: categoryData.status || "ACTIVE"
    };
    
    console.log('Creando nueva categoría:', payload);
    const response = await apiClient.post("/l/categories", payload);
    console.log('Respuesta de creación de categoría:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Actualiza una categoría existente
 * @param {Object} categoryData - Datos de la categoría a actualizar según UpdateCategoryDto
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const updateCategory = async (categoryData) => {
  try {
    // Validar que el ID es obligatorio para actualizar
    if (!categoryData.id) {
      throw new Error('El ID de la categoría es obligatorio para actualizarla');
    }
    
    // Preparar el payload según el DTO
    const payload = {
      id: Number(categoryData.id),
      updatedBy: categoryData.updatedBy || "1",
      updatedAt: categoryData.updatedAt || new Date().toISOString(),
      name: categoryData.name,
      description: categoryData.description,
      url: categoryData.url,
      status: categoryData.status
    };
    
    // Validar que el status sea uno de los valores permitidos
    if (payload.status && !['ACTIVE', 'INACTIVE'].includes(payload.status)) {
      throw new Error('El estado debe ser ACTIVE o INACTIVE');
    }
    
    console.log('Actualizando categoría:', payload);
    const response = await apiClient.put("/l/categories", payload);
    console.log('Respuesta de actualización de categoría:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cambia el estado de una categoría (activa/inactiva)
 * @param {number} id - ID de la categoría
 * @param {string} currentStatus - Estado actual de la categoría
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const changeCategoryStatus = async (id, currentStatus) => {
  try {
    // Determinar el nuevo estado (inverso al actual)
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    // Preparar payload para la actualización
    const payload = {
      id: Number(id),
      status: newStatus,
      updatedBy: "1",
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Cambiando estado de categoría ${id} a ${newStatus}`);
    const response = await apiClient.put("/l/categories", payload);
    console.log('Respuesta de cambio de estado:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de categoría ${id}:`, error);
    throw error.response?.data || error.message;
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
 * Elimina una categoría
 * @param {number} id - ID de la categoría a eliminar
 * @returns {Promise<Object>} Objeto con la respuesta de la API
 */
export const deleteCategory = async (id) => {
  try {
    console.log(`Eliminando categoría con ID: ${id}...`);
    const response = await apiClient.delete(`/l/categories/delete/${id}`);
    console.log('Respuesta de eliminación de categoría:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Prepara un objeto de categoría para crear o actualizar
 * @param {Object} categoryData - Datos básicos de la categoría
 * @param {boolean} isUpdate - Indica si es una actualización (true) o creación (false)
 * @returns {Object} Objeto formateado según el DTO correspondiente
 */
export const prepareCategoryDTO = (categoryData, isUpdate = false) => {
  if (isUpdate) {
    // Para actualización, usar UpdateCategoryDto
    return {
      id: Number(categoryData.id),
      updatedBy: categoryData.updatedBy || "1",
      updatedAt: categoryData.updatedAt || new Date().toISOString(),
      name: categoryData.name,
      description: categoryData.description || "",
      url: categoryData.url || "",
      status: categoryData.status || "ACTIVE"
    };
  } else {
    // Para creación, usar CreateCategoryDto
    return {
      createdBy: categoryData.createdBy || "1",
      createdAt: categoryData.createdAt || new Date().toISOString(),
      name: categoryData.name,
      description: categoryData.description || "",
      url: categoryData.url || "",
      status: categoryData.status || "ACTIVE"
    };
  }
};