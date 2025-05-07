import apiClient from "../apiClient";

export const getAllCategories = async () => {
  try {
    console.log('Obteniendo todas las categorías...');
    const { data } = await apiClient.get("/admin/category/all");
    console.log('Respuesta de categorías:', data);
    return data; // Devolver el objeto completo con type y result
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error.response?.data || error.message;
  }
}; 