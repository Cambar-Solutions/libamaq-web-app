import apiClient from "../apiClient";

// Obtener todas las marcas con sus categorías activas
export const getAllBrandsWithCategories = async () => {
  try {
    const { data } = await apiClient.get("/l/brands/categories");
    console.log('Respuesta completa de marcas con categorías:', data);
    return data;
  } catch (error) {
    console.error('Error fetching brands with categories:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener todas las marcas activas
export const getAllActiveBrands = async () => {
  try {
    const { data } = await apiClient.get("/l/brands/active");
    console.log('Respuesta completa de marcas activas:', data);
    return data;
  } catch (error) {
    console.error('Error fetching active brands:', error);
    throw error.response?.data || error.message;
  }
};