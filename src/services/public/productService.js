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
    const topSellingProductsData = response.data.data; // Lista de productos sin imágenes

    console.log("Productos más vendidos (sin imágenes):", topSellingProductsData);

    // Obtener los IDs de los productos más vendidos
    const productIds = topSellingProductsData.map(product => product.product_id);

    // Si no hay productos, retorna un array vacío
    if (productIds.length === 0) {
      return [];
    }

    // Ahora, haz una llamada para obtener las previews de estos productos por sus IDs
    // Asumo que tu endpoint /l/products/preview puede aceptar un array de IDs o que puedes filtrar.
    // Si no lo hace, necesitarás llamar a /l/products/preview individualmente o adaptar tu backend.
    // Por simplicidad, y basándome en que getActiveProductPreviews ya existe,
    // haremos una lógica para mapear los datos completos con los top selling.

    const activeProductPreviewsResponse = await getActiveProductPreviews();
    const allActivePreviews = Array.isArray(activeProductPreviewsResponse.data)
      ? activeProductPreviewsResponse.data
      : [];

    // Mapear los productos más vendidos con su información completa (incluyendo media)
    const topSellingProductsWithMedia = topSellingProductsData.map(topProduct => {
      const fullProductData = allActivePreviews.find(preview => preview.id === topProduct.product_id);
      return {
        ...topProduct, // Mantén todas las propiedades originales (product_id, product_name, etc.)
        // Si fullProductData existe, copia su 'media' y 'name'/'description' (si quieres usar los de la preview)
        // Puedes elegir qué propiedades de 'fullProductData' sobrescribir o añadir.
        // Por ahora, solo añadimos 'media'.
        media: fullProductData ? fullProductData.media : [],
        // Puedes también usar:
        // name: fullProductData?.name || topProduct.product_name,
        // description: fullProductData?.description || topProduct.product_description,
        // price: fullProductData?.price || topProduct.product_price,
      };
    });

    console.log("Productos más vendidos (con imágenes):", topSellingProductsWithMedia);
    return topSellingProductsWithMedia;

  } catch (error) {
    console.error("Error al obtener productos más vendidos y sus previews:", error);
    throw error.response?.data || error.message;
  }
};


// Obtener productos por categoría y marca
export const getProductsByCategoryAndBrand = async (categoryId, brandId) => {
  try {
    const response = await apiClient.get(`/l/products/category/${categoryId}/brand/${brandId}`);
    console.log(`Productos para la categoría ${categoryId} y marca ${brandId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener productos para la categoría ${categoryId} y marca ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
  try {
    console.log(`Obteniendo productos por categoría ${categoryId}...`);
    const response = await apiClient.get(`/l/products/category/${categoryId}`);
    console.log(`Respuesta de productos por categoría ${categoryId}:`, response.data);
    
    // Verificar el formato de la respuesta
    if (!response.data) {
      throw new Error(`No se recibieron datos de productos para la categoría ${categoryId}`);
    }
    
    // La nueva estructura de respuesta es { data: [...], status: 200, message: 'success' }
    // Verificar si estamos recibiendo la nueva estructura o la antigua
    if (response.data.data && response.data.status && response.data.message) {
      console.log(`Detectado nuevo formato de API en getProductsByCategory para categoría ${categoryId}`);
      // Devolver la estructura completa para mantener consistencia
      return response.data;
    } else {
      // Formato anterior donde la respuesta es directamente el array de productos
      console.log(`Detectado formato anterior en getProductsByCategory para categoría ${categoryId}`);
      // Devolver la respuesta tal cual para mantener compatibilidad
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error.response?.data || error.message;
  }
};