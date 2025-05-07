import apiClient from "../apiClient";

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const { data } = await apiClient.get("/admin/product/all");
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener vista previa de productos
export const getProductPreviews = async () => {
  try {
    const { data } = await apiClient.get("/admin/product/preview/all");
    return data.result || [];
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
    const { data } = await apiClient.get(`/admin/product/${id}?_t=${timestamp}`);
    
    console.log(`Datos del producto recibidos del servidor:`, data);
    
    // Verificar si los datos recibidos son válidos
    if (data && data.result) {
      // Asegurarse de que los campos dinámicos sean objetos
      if (typeof data.result.technicalData === 'string') {
        try {
          data.result.technicalData = JSON.parse(data.result.technicalData);
        } catch (e) {
          data.result.technicalData = {};
        }
      }
      
      if (typeof data.result.functionalities === 'string') {
        try {
          data.result.functionalities = JSON.parse(data.result.functionalities);
        } catch (e) {
          data.result.functionalities = {};
        }
      }
      
      if (typeof data.result.downloads === 'string') {
        try {
          data.result.downloads = JSON.parse(data.result.downloads);
        } catch (e) {
          data.result.downloads = {};
        }
      }
      
      if (typeof data.result.description === 'string') {
        try {
          data.result.description = JSON.parse(data.result.description);
        } catch (e) {
          data.result.description = {};
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Subir imagen
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/admin/multimedia/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error.response?.data || error.message;
  }
};

// Actualizar producto
export const updateProduct = async (productData) => {
  try {
    console.log('Datos recibidos para actualización:', productData);
    
    // Procesar campos JSON
    const processJsonField = (field) => {
      if (!field) return {};
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          console.warn('Error al parsear campo JSON:', e);
          return {};
        }
      }
      return field;
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
      brandId: Number(productData.brandId || productData.brand_id || 0),
      categoryId: Number(productData.categoryId || productData.category_id || 0),
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
    
    // Realizar una petición directa a la API sin usar el cliente API para evitar cualquier middleware
    // que pueda estar modificando los datos
    const token = localStorage.getItem('token');
    const response = await fetch('https://libamaq.com/api/admin/product/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productDto)
    });
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Respuesta de la API (fetch directo):', data);
    
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

    const { data } = await apiClient.post("/admin/product/create", productDto);
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error.response?.data || error.message;
  }
};
