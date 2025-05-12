import apiClient from "../apiClient";

// Obtener todos los productos activos (sin filtro de marca o categoría)
export const getAllPublicProducts = async () => {
  try {
    // No existe un endpoint para todos los productos públicos sin filtro,
    // así que usamos el endpoint de admin y filtramos los activos en el frontend
    const { data } = await apiClient.get("/admin/product/all");
    console.log('Respuesta completa de productos:', data);
    return data;
  } catch (error) {
    console.error('Error fetching public products:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener un producto específico por ID
export const getProductById = async (id) => {
  try {
    const { data } = await apiClient.get(`/public/product/${id}`);
    console.log('Respuesta de producto por ID:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por marca
export const getProductsByBrand = async (brandId) => {
  try {
    // Usamos el endpoint correcto para productos por marca
    const { data } = await apiClient.get(`/public/product/brand/${brandId}`);
    console.log('Respuesta de productos por marca:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching products for brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por categoría y marca
export const getProductsByCategoryAndBrand = async (categoryId, brandId) => {
  try {
    // Usamos el endpoint correcto para productos por categoría y marca
    const { data } = await apiClient.get(`/public/product/category/${categoryId}/brand/${brandId}`);
    console.log('Respuesta de productos por categoría y marca:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId} and brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};
