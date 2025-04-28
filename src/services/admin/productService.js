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
    const { data } = await apiClient.get(`/admin/product/${id}`);
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
    // Procesar campos JSON
    const processJsonField = (field) => {
      if (!field) return {};
      return typeof field === 'string' ? JSON.parse(field) : field;
    };

    const productDto = {
      id: Number(productData.id),
      externalId: productData.externalId,
      name: productData.name,
      color: productData.color || '#000000',
      shortDescription: productData.shortDescription,
      description: processJsonField(productData.description),
      type: productData.type,
      productUsage: productData.productUsage,
      cost: Number(productData.cost),
      price: Number(productData.price),
      discount: Number(productData.discount),
      stock: Number(productData.stock),
      garanty: Number(productData.garanty),
      technicalData: processJsonField(productData.technicalData),
      functionalities: processJsonField(productData.functionalities),
      downloads: processJsonField(productData.downloads),
      status: productData.status || 'ACTIVE',
      brandId: Number(productData.brandId),
      categoryId: Number(productData.categoryId),
      productMultimediaDto: Array.isArray(productData.multimedia)
        ? productData.multimedia.map((m, index) => ({
            id: Number(m.id),
            displayOrder: Number(index + 1),
            productId: Number(productData.id),
            multimediaId: Number(m.id)
          }))
        : []
    };

    const { data } = await apiClient.put('/admin/product/update', productDto);
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
