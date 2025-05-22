import apiClient from "../apiClient";
import axios from "axios";

// Obtener todos los productos (incluye estado)
export const getAllProducts = async () => {
  try {
    console.log('Obteniendo todos los productos con información de estado...');
    const response = await apiClient.get("/l/products");
    console.log('Respuesta completa de todos los productos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener todos los productos activos
export const getActiveProducts = async () => {
  try {
    const response = await apiClient.get("/l/products/active");
    console.log('Respuesta completa de productos activos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching active products:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener vista previa de productos
export const getProductPreviews = async () => {
  try {
    const response = await apiClient.get("/l/products/preview");
    console.log('Respuesta completa de productos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product previews:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener producto por ID
export const getProductById = async (id) => {
  try {
    console.log(`Obteniendo producto con ID ${id} del servidor...`);
    
    // Añadir un parámetro de consulta con timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/l/products/${id}?_t=${timestamp}`);
    
    console.log(`Datos del producto recibidos del servidor:`, response.data);
    
    // Verificar si los datos recibidos son válidos
    const productData = response.data;
    if (productData) {
      // Asegurarse de que los campos dinámicos sean objetos
      if (typeof productData.technicalData === 'string') {
        try {
          productData.technicalData = JSON.parse(productData.technicalData);
        } catch (e) {
          productData.technicalData = {};
        }
      }
      
      if (typeof productData.functionalities === 'string') {
        try {
          productData.functionalities = JSON.parse(productData.functionalities);
        } catch (e) {
          productData.functionalities = {};
        }
      }
      
      if (typeof productData.downloads === 'string') {
        try {
          productData.downloads = JSON.parse(productData.downloads);
        } catch (e) {
          productData.downloads = {};
        }
      }
      
      if (typeof productData.description === 'string') {
        try {
          productData.description = JSON.parse(productData.description);
        } catch (e) {
          productData.description = {};
        }
      }
    }
    
    return productData;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener producto activo por ID
export const getActiveProductById = async (id) => {
  try {
    const response = await apiClient.get(`/l/products/active/${id}`);
    console.log(`Respuesta de producto activo por ID ${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching active product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Subir imagen
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/l/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error.response?.data || error.message;
  }
};

// Actualizar producto
export const updateProduct = async (productData) => {
  try {
    console.log('Datos del producto a actualizar:', productData);
    
    // Verificar que el producto tenga un ID
    if (!productData.id) {
      throw new Error('El producto debe tener un ID para actualizarlo');
    }
    
    // Actualizar el producto base
    const response = await apiClient.put('/l/products', productData);
    console.log('Respuesta de actualización de producto:', response.data);
    
    if (!response.data) {
      throw new Error('No se recibió una respuesta válida del servidor');
    };

    // Asegurarse de que los campos dinámicos estén presentes y sean objetos
    const technicalData = processJsonField(productData.technicalData);
    const functionalities = processJsonField(productData.functionalities);
    const downloads = processJsonField(productData.downloads);
    const description = processJsonField(productData.description);
    
    console.log('Campos dinámicos procesados:', {
      technicalData,
      functionalities,
      downloads,
      description
    });

    const productDto = {
      id: Number(productData.id),
      externalId: productData.externalId,
      name: productData.name,
      color: productData.color || '#000000',
      shortDescription: productData.shortDescription,
      description: description,
      type: productData.type,
      productUsage: productData.productUsage,
      cost: Number(productData.cost || 0),
      price: Number(productData.price || 0),
      discount: Number(productData.discount || 0),
      stock: Number(productData.stock || 0),
      garanty: Number(productData.garanty || 0),
      technicalData: technicalData,
      functionalities: functionalities,
      downloads: downloads,
      status: productData.status || 'ACTIVE',
      brandId: Number(productData.brandId),
      categoryId: Number(productData.categoryId),
      productMultimediaDto: Array.isArray(productData.multimedia)
        ? productData.multimedia.map((m, index) => ({
            id: m.id ? Number(m.id) : 0,
            displayOrder: Number(index + 1),
            productId: Number(productData.id),
            multimediaId: m.id ? Number(m.id) : 0
          }))
        : []
    };

    console.log('Datos enviados a la API:', productDto);
    
    // Usar axios directamente con la URL completa y correcta, igual que en brandService
    const { data } = await axios({
      method: 'put',
      url: "https://libamaq.com/l/products",
      data: productDto,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    
    console.log('Respuesta de la API (axios directo):', data);
    
    // Esperar un momento para asegurar que los cambios se hayan aplicado en el servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Si la actualización fue exitosa, obtener el producto actualizado
    if (data.type === 'SUCCESS') {
      try {
        // Usar un fetch directo para obtener el producto actualizado
        const productResponse = await getProductById(productDto.id);
        return productResponse;
      } catch (fetchError) {
        console.error('Error al obtener el producto actualizado:', fetchError);
        return data;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error.response?.data || error.message;
  }
};

// Crear producto
export const createProduct = async (productData) => {
  try {
    // Procesar imágenes primero si existen
    let multimedia = [];
    if (productData.images && productData.images.length > 0) {
      const uploadPromises = productData.images.map(file => uploadImage(file));
      const uploadResults = await Promise.all(uploadPromises);
      
      multimedia = uploadResults
        .filter(result => result.type === 'SUCCESS')
        .map((result, index) => ({
          multimediaId: result.result.id,
          displayOrder: index + 1
        }));
    }

    // Preparar datos del producto
    const productDto = {
      ...productData,
      productMultimediaDto: multimedia,
      // Asegurar que los campos requeridos estén presentes
      status: 'ACTIVE',
      brandId: Number(productData.brandId),
      categoryId: Number(productData.categoryId),
      cost: Number(productData.cost),
      price: Number(productData.price),
      discount: Number(productData.discount || 0),
      stock: Number(productData.stock || 0),
      garanty: Number(productData.garanty || 0)
    };

    const { data } = await apiClient.post("/l/products", productDto);
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
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

// Obtener productos por marca
export const getProductsByBrand = async (brandId) => {
  try {
    const response = await apiClient.get(`/l/products/brand/${brandId}`);
    console.log(`Respuesta de productos por marca ${brandId}:`, response.data);
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
    console.log(`Respuesta de productos por categoría ${categoryId} y marca ${brandId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId} and brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};
