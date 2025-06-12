import apiClient from "../apiClient";

// Obtener vista previa de productos activos
export const getActiveProductPreviews = async () => {
  try {
    const response = await apiClient.get("/l/products/preview", {
      params: { status: "ACTIVE" },
    });
    console.log("Vista previa de productos activos:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener vista previa de productos activos:", error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por marca
export const getProductsByBrand = async (brandId) => {
  try {
    const response = await apiClient.get(`/l/products/brand/${brandId}`);
    console.log("Productos por marca:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener productos para la marca ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener un producto activo por ID
export const getActiveProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/l/products/active/${productId}`);
    console.log(`Producto activo con ID ${productId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener producto con ID ${productId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos más vendidos
export const getTopSellingProductss = async () => {
  try {
    const response = await apiClient.get("/l/products/stats/top-selling");
    console.log("Productos más vendidos:", response.data);
    return response.data.data; // ⬅️ Extrae solo la lista
  } catch (error) {
    console.error("Error al obtener productos más vendidos:", error);
    throw error.response?.data || error.message;
  }
};
