import apiClient from "../apiClient";
import axios from "axios";

// Obtener todos los productos (incluye estado)
export const getAllProducts = async () => {
  try {
    console.log('Obteniendo todos los productos con información de estado...');
    const response = await apiClient.get("/l/products");
    console.log('Respuesta completa de todos los productos:', response.data);
    
    // Verificar el formato de la respuesta
    if (!response.data) {
      throw new Error('No se recibieron datos de productos');
    }
    
    // La nueva estructura de respuesta es { data: [...], status: 200, message: 'success' }
    // Verificar si estamos recibiendo la nueva estructura o la antigua
    if (response.data.data && response.data.status && response.data.message) {
      console.log('Detectado nuevo formato de API en getAllProducts');
      // Devolver la estructura completa para mantener consistencia
      return response.data;
    } else {
      // Formato anterior donde la respuesta es directamente el array de productos
      console.log('Detectado formato anterior en getAllProducts');
      // Devolver la respuesta tal cual para mantener compatibilidad
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching products:', error);

    // Si viene de axios y trae response.data.message:
    const serverMsg = error.response?.data?.message;
    if (serverMsg) {
      throw new Error(serverMsg);
    }
    // Si solo hay status o text:
    throw new Error(error.message || `HTTP ${error.response?.status}`);
  }
};


// Obtener todos los productos activos
export const getActiveProducts = async (page = 1, size = 50) => {
  try {
    console.log(`Obteniendo productos activos (página ${page}, tamaño ${size})...`);
    // Llamamos a /l/products con parámetros de paginación y status=ACTIVE
    const response = await apiClient.get("/l/products", {
      params: {
        page: page - 1, // si tu API usa base-0
        size,
        status: "ACTIVE" // si tu backend admite filtrar por status
      }
    });
    
    console.log('Respuesta de productos activos:', response.data);
    
    // Verificar el formato de la respuesta
    if (!response.data) {
      throw new Error('No se recibieron datos de productos activos');
    }
    
    // La nueva estructura de respuesta es { data: [...], status: 200, message: 'success' }
    // Verificar si estamos recibiendo la nueva estructura o la antigua
    if (response.data.data && response.data.status && response.data.message) {
      console.log('Detectado nuevo formato de API en getActiveProducts');
      // Devolver la estructura completa para mantener consistencia
      return response.data;
    } else {
      // Formato anterior donde la respuesta es directamente el array de productos
      console.log('Detectado formato anterior en getActiveProducts');
      // Devolver la respuesta tal cual para mantener compatibilidad
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching active products:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Obtener vista previa de productos con filtros opcionales
export const getProductPreviews = async (filters = {}) => {
  try {
    console.log("Llamando a GET /l/products/preview con filtros:", filters);
    
    // Construir los parámetros de consulta
    const params = new URLSearchParams();
    
    // Aplicar filtros si están presentes
    if (filters.status) params.append('status', filters.status);
    if (filters.brandId) params.append('brandId', filters.brandId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    
    const url = `/l/products/preview${params.toString() ? `?${params.toString()}` : ''}`;
    console.log("URL de la petición:", url);
    
    // Agregar timeout para evitar esperas infinitas
    const response = await apiClient.get(url, {
      timeout: 10000 // 10 segundos de timeout
    });
    console.log("→ Respuesta GET /l/products/preview:", response.data);
    
    // Verificar el formato de la respuesta
    if (!response.data) {
      throw new Error('No se recibieron datos de previsualizaciones de productos');
    }
    
    // La nueva estructura de respuesta es { data: [...], status: 200, message: 'success' }
    // Verificar si estamos recibiendo la nueva estructura o la antigua
    if (response.data.data && response.data.status && response.data.message) {
      console.log('Detectado nuevo formato de API en getProductPreviews');
      // Devolver la estructura completa para mantener consistencia
      return response.data;
    } else {
      // Formato anterior donde la respuesta es directamente el array de productos
      console.log('Detectado formato anterior en getProductPreviews');
      // Devolver la respuesta tal cual para mantener compatibilidad
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching product previews:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Si el endpoint de preview falla, intentar con el endpoint principal
    console.log("Intentando con endpoint principal como respaldo...");
    try {
      const fallbackResponse = await getAllProducts();
      console.log("Respuesta de respaldo exitosa:", fallbackResponse);
      return fallbackResponse;
    } catch (fallbackError) {
      console.error("Error en endpoint de respaldo:", fallbackError);
      
      // Manejar diferentes tipos de errores
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: El servidor no respondió en el tiempo esperado');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Endpoint no encontrado: /l/products/preview');
      }
      
      if (error.response?.status === 401) {
        throw new Error('No autorizado: Verifica tu token de autenticación');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Error interno del servidor');
      }
      
      if (!error.response) {
        throw new Error('Error de red: No se pudo conectar con el servidor');
      }
      
      const msg = error.response?.data?.message || error.message || "Error desconocido";
      throw new Error(msg);
    }
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
    
    // La nueva estructura de respuesta es { data: {...}, status: 200, message: 'success' }
    // Verificar el formato y procesar adecuadamente
    if (!response.data) {
      throw new Error(`No se recibieron datos para el producto con ID ${id}`);
    }
    
    // Determinar si estamos recibiendo la nueva estructura o la antigua
    let productData = response.data;
    let productObject;
    
    if (response.data.data && response.data.status && response.data.message) {
      // Nuevo formato con estructura { data, status, message }
      console.log('Detectado nuevo formato de API en getProductById');
      productObject = response.data.data;
    } else {
      // Formato anterior donde la respuesta es directamente el objeto producto
      console.log('Detectado formato anterior en getProductById');
      productObject = response.data;
    }
    
    // Procesar los campos que pueden venir como strings pero deben ser arrays
    const processArrayField = (field) => {
      // Si ya es un array, devolverlo tal cual
      if (Array.isArray(field)) {
        return field;
      }
      
      // Si es string, intentar parsearlo
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Si no se puede parsear y parece una lista separada por comas
          if (field.includes(',')) {
            return field.split(',').map(item => item.trim());
          }
          // Si es un string simple, devolverlo como único elemento de un array
          return [field];
        }
      }
      
      // Si es null o undefined, devolver array vacío
      return [];
    };
    
    // Procesar los campos que pueden ser objetos o arrays de objetos
    if (productObject) {
      // Procesar technicalData - debería ser un array de objetos {key, value}
      if (productObject.technicalData) {
        if (typeof productObject.technicalData === 'string') {
          try {
            productObject.technicalData = JSON.parse(productObject.technicalData);
          } catch (e) {
            console.warn('Error al parsear technicalData, manteniendo como string:', e);
          }
        }
        // Asegurar que sea un array
        if (!Array.isArray(productObject.technicalData)) {
          productObject.technicalData = [];
        }
      } else {
        productObject.technicalData = [];
      }
      
      // Procesar functionalities - debería ser un array de strings
      if (productObject.functionalities) {
        productObject.functionalities = processArrayField(productObject.functionalities);
      } else {
        productObject.functionalities = [];
      }
      
      // Procesar downloads - debería ser un array de objetos {key, value}
      if (productObject.downloads) {
        if (typeof productObject.downloads === 'string') {
          try {
            productObject.downloads = JSON.parse(productObject.downloads);
          } catch (e) {
            console.warn('Error al parsear downloads, manteniendo como string:', e);
          }
        }
        // Asegurar que sea un array
        if (!Array.isArray(productObject.downloads)) {
          productObject.downloads = [];
        }
      } else {
        productObject.downloads = [];
      }
      
      // Asegurar que media sea un array
      if (!productObject.media && productObject.multimedia) {
        productObject.media = productObject.multimedia;
      }
      if (!Array.isArray(productObject.media)) {
        productObject.media = [];
      }
    }
    
    // Devolver la estructura completa para mantener consistencia con la API
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

// Importar el servicio de medios
import mediaService from './mediaService';

// Subir imagen (utilizando mediaService)
export const uploadImage = async (file) => {
  try {
    const result = await mediaService.uploadImages(file);
    console.log('Respuesta de subida de imagen:', result);
    return { data: result, status: 200, message: 'success' };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error.response?.data || error.message;
  }
};

// Eliminar imagen por ID (utilizando mediaService)
export const deleteImage = async (imageId) => {
  try {
    const result = await mediaService.deleteImages(imageId);
    console.log(`Imagen con ID ${imageId} eliminada:`, result);
    return result;
  } catch (error) {
    console.error(`Error eliminando imagen con ID ${imageId}:`, error);
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
    
    // Procesar los campos dinámicos para asegurar el formato correcto
    const ensureArrayFormat = (field) => {
      if (!field) return [];
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(field) ? field : [];
    };

    // Preparar el DTO del producto según la estructura de la API
    const productDto = {
      id: Number(productData.id),
      updatedBy: productData.updatedBy || "1",
      updatedAt: new Date().toISOString(),
      brandId: String(productData.brandId || "1"),
      categoryId: String(productData.categoryId || "1"),
      externalId: productData.externalId || `PROD-${Date.now()}`,
      name: productData.name || '',
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      
      // Asegurar que functionalities sea un array de strings
      functionalities: ensureArrayFormat(productData.functionalities || []).map(String),
      
      // Asegurar que technicalData sea un array de objetos con key y value
      technicalData: ensureArrayFormat(productData.technicalData || []).map(item => ({
        key: String(item.key || ''),
        value: String(item.value || '')
      })),
      
      price: Number(productData.price || 0),
      minimumPrice: Number(productData.minimumPrice || 0),
      ecommercePrice: Number(productData.ecommercePrice || 0),
      cost: Number(productData.cost || 0),
      discount: Number(productData.discount || 0),
      stock: Number(productData.stock || 0),
      garanty: Number(productData.garanty || 0),
      color: productData.color || '',
      
      // Asegurar que downloads sea un array de objetos con key y value
      downloads: ensureArrayFormat(productData.downloads || []).map(item => ({
        key: String(item.key || ''),
        value: String(item.value || '')
      })),
      
      rentable: Boolean(productData.rentable),
      status: productData.status || 'ACTIVE',
      
      // Asegurar que media tenga el formato correcto
      media: ensureArrayFormat(productData.media || []).map(media => ({
        id: Number(media.id) || 0,
        url: String(media.url || ''),
        fileType: media.fileType || 'IMAGE',
        entityId: Number(media.entityId) || 0,
        entityType: media.entityType || 'PRODUCT',
        displayOrder: Number(media.displayOrder) || 0
      })),
      // Agregar ranking si está presente
      ...(productData.ranking !== undefined ? { ranking: productData.ranking } : {})
    };

    console.log('Enviando datos al servidor (PUT):', JSON.stringify(productDto, null, 2));
    
    const response = await apiClient.put("/l/products", productDto);
    console.log('Respuesta de actualización de producto:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error.response?.data || error.message;
  }
};

// Crear producto
export const createProduct = async (productData) => {
  try {
    console.log('Datos del producto a crear:', productData);
    
    // Procesar los campos dinámicos para asegurar el formato correcto
    const ensureArrayFormat = (field) => {
      if (!field) return [];
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(field) ? field : [];
    };
    
    // Preparar datos del producto según la nueva estructura esperada por la API
    const productDto = {
      createdBy: productData.createdBy || "1", // Preferiblemente del usuario autenticado
      createdAt: productData.createdAt || new Date().toISOString(),
      brandId: productData.brandId ? String(productData.brandId) : "1",
      categoryId: productData.categoryId ? String(productData.categoryId) : "1",
      externalId: productData.externalId || `PROD-${Date.now()}`,
      name: productData.name || '',
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      
      // Asegurar que functionalities y technicalData tengan el formato correcto
      functionalities: ensureArrayFormat(productData.functionalities),
      technicalData: ensureArrayFormat(productData.technicalData),
      
      type: productData.type || 'PRODUCT',
      productUsage: productData.productUsage || 'GENERAL',
      price: Number(productData.price || 0),
      minimumPrice: Number(productData.minimumPrice || 0),
      ecommercePrice: Number(productData.ecommercePrice || 0),
      cost: Number(productData.cost || 0),
      discount: Number(productData.discount || 0),
      stock: Number(productData.stock || 0),
      garanty: Number(productData.garanty || 0),
      color: productData.color || '',
      
      // Asegurar que downloads tenga el formato correcto
      downloads: ensureArrayFormat(productData.downloads),
      
      rentable: Boolean(productData.rentable),
      status: productData.status || 'ACTIVE',
      
      // Asegurar que media tenga el formato correcto
      media: Array.isArray(productData.media || productData.multimedia) 
        ? (productData.media || productData.multimedia).map((media, index) => ({
            id: media.id || 0,
            url: media.url,
            fileType: media.fileType || 'IMAGE',
            entityId: media.entityId || 0,
            entityType: media.entityType || 'PRODUCT',
            displayOrder: media.displayOrder || index
          }))
        : [],
      // Agregar ranking si está presente
      ...(productData.ranking !== undefined ? { ranking: productData.ranking } : {})
    };

    console.log('Enviando datos al servidor (POST):', JSON.stringify(productDto, null, 2));
    const response = await apiClient.post("/l/products", productDto);
    console.log('Respuesta de creación de producto:', response.data);
    
    // La nueva estructura de respuesta tiene el formato { data: {...}, status: 200, message: 'success' }
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
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

// Obtener productos por marca
export const getProductsByBrand = async (brandId) => {
  try {
    console.log(`Obteniendo productos por marca ${brandId}...`);
    const response = await apiClient.get(`/l/products/brand/${brandId}`);
    console.log(`Respuesta de productos por marca ${brandId}:`, response.data);
    
    // Verificar el formato de la respuesta
    if (!response.data) {
      throw new Error(`No se recibieron datos de productos para la marca ${brandId}`);
    }
    
    // La nueva estructura de respuesta es { data: [...], status: 200, message: 'success' }
    // Verificar si estamos recibiendo la nueva estructura o la antigua
    if (response.data.data && response.data.status && response.data.message) {
      console.log(`Detectado nuevo formato de API en getProductsByBrand para marca ${brandId}`);
      // Devolver la estructura completa para mantener consistencia
      return response.data;
    } else {
      // Formato anterior donde la respuesta es directamente el array de productos
      console.log(`Detectado formato anterior en getProductsByBrand para marca ${brandId}`);
      // Devolver la respuesta tal cual para mantener compatibilidad
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching products for brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Obtener productos por categoría y marca
export const getProductsByCategoryAndBrand = async (categoryId, brandId) => {
  try {
    console.log(`Obteniendo productos por categoría ${categoryId} y marca ${brandId}...`);
    const response = await apiClient.get(`/l/products/category/${categoryId}/brand/${brandId}`);
    console.log(`Respuesta de productos por categoría ${categoryId} y marca ${brandId}:`, response.data);
    
    // Verificar el formato de la respuesta
    if (!response.data) {
      throw new Error(`No se recibieron datos de productos para la categoría ${categoryId} y marca ${brandId}`);
    }
    
    // La nueva estructura de respuesta es { data: [...], status: 200, message: 'success' }
    // Verificar si estamos recibiendo la nueva estructura o la antigua
    if (response.data.data && response.data.status && response.data.message) {
      console.log(`Detectado nuevo formato de API en getProductsByCategoryAndBrand para categoría ${categoryId} y marca ${brandId}`);
      // Devolver la estructura completa para mantener consistencia
      return response.data;
    } else {
      // Formato anterior donde la respuesta es directamente el array de productos
      console.log(`Detectado formato anterior en getProductsByCategoryAndBrand para categoría ${categoryId} y marca ${brandId}`);
      // Devolver la respuesta tal cual para mantener compatibilidad
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId} and brand ${brandId}:`, error);
    throw error.response?.data || error.message;
  }
};

// Eliminar un producto por ID (marcar como inactivo)
export const deleteProduct = async (productId) => {
  try {
    console.log(`Eliminando producto con ID: ${productId}`);
    const response = await apiClient.delete(`/l/products/delete/${productId}`);
    console.log('Respuesta de eliminación de producto:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
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
