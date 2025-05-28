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
    
    // Verificar el formato de la respuesta
    // Puede ser { data: {...}, status: 200, message: 'success' } (nuevo formato)
    // o directamente el objeto producto (formato anterior)
    let productData;
    
    if (response.data && response.data.data) {
      // Nuevo formato de API
      console.log('Detectado nuevo formato de API en getProductById');
      productData = response.data;
    } else {
      // Formato anterior o respuesta directa
      console.log('Detectado formato anterior o respuesta directa en getProductById');
      productData = response.data;
    }
    
    // Verificar si los datos recibidos son válidos
    if (productData) {
      // En el nuevo formato, el producto real está en productData.data
      const product = productData.data || productData;
      
      // Asegurarse de que los campos dinámicos sean objetos si son JSON válido
      if (typeof product.technicalData === 'string' && product.technicalData.trim().startsWith('{')) {
        try {
          product.technicalData = JSON.parse(product.technicalData);
        } catch (e) {
          console.error('Error al parsear technicalData:', e);
          // Mantener como string si no es JSON válido
        }
      }
      
      if (typeof product.functionalities === 'string' && product.functionalities.trim().startsWith('{')) {
        try {
          product.functionalities = JSON.parse(product.functionalities);
        } catch (e) {
          console.error('Error al parsear functionalities:', e);
          // Mantener como string si no es JSON válido
        }
      }
      
      if (typeof product.downloads === 'string' && product.downloads.trim().startsWith('{')) {
        try {
          product.downloads = JSON.parse(product.downloads);
        } catch (e) {
          console.error('Error al parsear downloads:', e);
          // Mantener como string si no es JSON válido
        }
      }
      
      if (typeof product.description === 'string' && product.description.trim().startsWith('{')) {
        try {
          product.description = JSON.parse(product.description);
        } catch (e) {
          console.error('Error al parsear description:', e);
          // Mantener como string si no es JSON válido
        }
      }
      
      // Si estamos en el nuevo formato, devolver el objeto completo
      // Si no, devolver solo el producto
      return productData;
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
    console.log('Datos del producto a crear:', productData);
    
    // Preparar datos del producto según el formato esperado por la API NestJS
    const productDto = {
      ...productData,
      // Asegurar que los campos numéricos sean números
      brandId: productData.brandId ? Number(productData.brandId) : null,
      categoryId: productData.categoryId ? Number(productData.categoryId) : null,
      price: productData.price ? Number(productData.price) : 0,
      cost: productData.cost ? Number(productData.cost) : 0,
      discount: productData.discount ? Number(productData.discount) : 0,
      stock: productData.stock ? Number(productData.stock) : 0,
      garanty: productData.garanty ? Number(productData.garanty) : 0,
      // Asegurar que el estado sea válido
      status: productData.status || 'ACTIVE',
      // Fecha de creación si no está presente
      createdAt: productData.createdAt || new Date().toISOString(),
      // Asegurar que media sea un array
      media: Array.isArray(productData.media) ? productData.media : []
    };

    console.log('DTO del producto a enviar:', productDto);
    const response = await apiClient.post("/l/products", productDto);
    console.log('Respuesta de creación de producto:', response.data);
    return response.data;
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

/**
 * Crea un producto con imágenes en un solo proceso
 * @param {Object} productData - Datos básicos del producto
 * @param {File[]} imageFiles - Archivos de imagen a subir
 * @param {Function} onProgress - Función para reportar el progreso de la carga
 * @returns {Promise<Object>} - Producto creado con todas sus relaciones
 */
export const createProductWithImages = async (productData, imageFiles = [], onProgress = null) => {
  try {
    console.log('Iniciando creación de producto con imágenes');
    console.log('Datos del producto:', productData);
    console.log('Archivos de imágenes:', imageFiles);
    
    // Paso 1: Crear el producto primero sin imágenes
    const initialProductData = {
      ...productData,
      // Asegurar que los campos numéricos sean números
      brandId: productData.brandId ? Number(productData.brandId) : null,
      categoryId: productData.categoryId ? Number(productData.categoryId) : null,
      price: productData.price ? Number(productData.price) : 0,
      cost: productData.cost ? Number(productData.cost) : 0,
      discount: productData.discount ? Number(productData.discount) : 0,
      stock: productData.stock ? Number(productData.stock) : 0,
      garanty: productData.garanty ? Number(productData.garanty) : 0,
      // Asegurar que el estado sea válido
      status: productData.status || 'ACTIVE',
      // Fecha de creación si no está presente
      createdAt: productData.createdAt || new Date().toISOString(),
      // Inicialmente sin imágenes
      media: []
    };
    
    console.log('Creando producto inicial sin imágenes...');
    const createResponse = await apiClient.post('/l/products', initialProductData);
    console.log('Producto creado inicialmente:', createResponse.data);
    
    // Verificar que el producto se haya creado correctamente
    if (!createResponse.data || !createResponse.data.data || !createResponse.data.data.id) {
      throw new Error('No se pudo crear el producto correctamente');
    }
    
    const createdProductId = createResponse.data.data.id;
    console.log(`Producto creado con ID: ${createdProductId}`);
    
    // Si no hay imágenes para subir, retornar el producto ya creado
    if (!imageFiles || imageFiles.length === 0) {
      return createResponse.data;
    }
    
    // Paso 2: Subir las imágenes
    console.log(`Subiendo ${imageFiles.length} imágenes para el producto ${createdProductId}...`);
    
    // Importar el servicio de media dinámicamente para evitar dependencias circulares
    const { uploadMedia } = await import('./mediaService');
    const { updateMediaForEntity } = await import('./mediaService');
    
    // Subir todas las imágenes
    const uploadResponse = await uploadMedia(imageFiles);
    console.log('Respuesta de subida de imágenes:', uploadResponse);
    
    if (uploadResponse && uploadResponse.data) {
      const uploadedFiles = Array.isArray(uploadResponse.data) 
        ? uploadResponse.data 
        : [uploadResponse.data];
      
      // Paso 3: Asociar cada imagen al producto
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const mediaData = {
          id: file.id,
          url: file.url,
          fileType: 'IMAGE',
          entityId: createdProductId,
          entityType: 'PRODUCT',
          displayOrder: i + 1
        };
        
        console.log(`Asociando imagen ${i + 1} al producto ${createdProductId}:`, mediaData);
        await updateMediaForEntity(mediaData);
      }
      
      // Paso 4: Obtener el producto actualizado con sus imágenes
      const updatedProduct = await getProductById(createdProductId);
      console.log('Producto actualizado con imágenes:', updatedProduct);
      
      return updatedProduct;
    }
    
    // Si no se pudieron subir imágenes, retornar el producto sin imágenes
    return createResponse.data;
  } catch (error) {
    console.error('Error al crear producto con imágenes:', error);
    throw error.response?.data || error.message;
  }
};
