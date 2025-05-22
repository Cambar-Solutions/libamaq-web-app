import apiClient from "../apiClient";

// Obtener todos los productos activos (sin filtro de marca o categoría)
export const getAllPublicProducts = async () => {
  try {
    const response = await apiClient.get("/l/products/active");
    console.log('Respuesta completa de productos activos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching public products:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener un producto específico por ID
export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/l/products/active/${id}`);
    console.log('Respuesta de producto activo por ID:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por marca
export const getProductsByBrand = async (brandId) => {
  try {
    const response = await apiClient.get(`/l/products/brand/${brandId}`);
    console.log('Respuesta de productos por marca:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por categoría y marca
export const getProductsByCategoryAndBrand = async (categoryId, brandId) => {
  try {
    const response = await apiClient.get(`/l/products/category/${categoryId}/brand/${brandId}`);
    console.log('Respuesta de productos por categoría y marca:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId} and brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await apiClient.get(`/l/products/category/${categoryId}`);
    console.log(`Respuesta de productos por categoría ${categoryId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener vista previa de productos
export const getProductPreviews = async () => {
  try {
    const response = await apiClient.get("/l/products/preview");
    console.log('Respuesta completa de vista previa de productos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product previews:', error);
    throw error.response?.data || error.message;
  }
};
