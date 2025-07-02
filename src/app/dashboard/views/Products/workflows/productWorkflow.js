import { toast } from 'react-hot-toast';
import { 
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  getProductById as getProductByIdService,
  uploadImage,
  deleteImage
} from '../../../../../services/admin/productService';
import mediaService from '../../../../../services/admin/mediaService';

/**
 * Workflow para manejar las operaciones de Productos
 */
const productWorkflow = {
  /**
   * Crea un nuevo producto con sus imágenes
   * @param {Object} productData - Datos del producto
   * @param {File[]} [files=[]] - Archivos de imágenes a subir
   * @returns {Promise<Object>} - Respuesta con el producto creado
   */
  createProduct: async (productData, files = []) => {
    try {
      // 1. Subir imágenes si hay archivos
      let uploadedMedia = [];
      if (files && files.length > 0) {
        const uploadResponse = await mediaService.uploadImages(files);
        // La respuesta del servicio es directamente el array de imágenes
        if (uploadResponse && Array.isArray(uploadResponse)) {
          uploadedMedia = uploadResponse;
        }
      }

      // 2. Crear el producto con las referencias a las imágenes
      const productWithMedia = {
        ...productData,
        // Usar las imágenes recién subidas, ignorando las URLs temporales del formulario
        media: uploadedMedia.map((img, index) => ({
          id: img.id || 0,
          url: img.url,
          fileType: 'IMAGE',
          entityType: 'PRODUCT',
          displayOrder: index
        }))
      };

      // 3. Crear el producto
      const response = await createProductService(productWithMedia);
      toast.success('Producto creado exitosamente');
      return response;
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error(error.response?.data?.message || 'Error al crear el producto');
      throw error;
    }
  },

  /**
   * Actualiza un producto existente
   * @param {Object} productData - Datos actualizados del producto
   * @param {File[]} [newFiles=[]] - Nuevas imágenes a subir
   * @param {Array} [mediaToDelete=[]] - IDs de imágenes a eliminar
   * @returns {Promise<Object>} - Respuesta con el producto actualizado
   */
  updateProduct: async (productData = {}, newFiles = [], mediaToDelete = []) => {
    try {
      console.log('Starting product update with data:', JSON.parse(JSON.stringify(productData)));
      console.log('New files to upload:', newFiles);
      console.log('Media to delete:', mediaToDelete);

      // Validar datos básicos
      if (!productData || !productData.id) {
        throw new Error('Datos del producto no válidos');
      }

      // 1. Subir nuevas imágenes si hay archivos
      let newMedia = [];
      if (newFiles && newFiles.length > 0) {
        try {
          console.log('Uploading new files...');
          const uploadResponse = await mediaService.uploadImages(newFiles);
          console.log('Upload response:', uploadResponse);
          
          // Ajustar según la estructura de respuesta del servicio
          if (uploadResponse && uploadResponse.data) {
            newMedia = Array.isArray(uploadResponse.data) 
              ? uploadResponse.data 
              : [uploadResponse.data];
          } else if (Array.isArray(uploadResponse)) {
            newMedia = uploadResponse;
          }
          console.log('Processed new media:', newMedia);
        } catch (error) {
          console.error('Error al subir nuevas imágenes:', error);
          throw new Error(`Error al subir las imágenes: ${error.message}`);
        }
      }

      // 2. Eliminar imágenes marcadas para borrar
      if (mediaToDelete && mediaToDelete.length > 0) {
        try {
          console.log('Deleting media:', mediaToDelete);
          await mediaService.deleteImages(mediaToDelete);
          console.log('Media deleted successfully');
        } catch (error) {
          console.error('Error al eliminar imágenes antiguas:', error);
          // Continuar aunque falle la eliminación
        }
      }

      // 3. Filtrar las imágenes existentes que no se hayan marcado para eliminar
      const existingMedia = (productData.media || [])
        .filter(img => img && img.id && !mediaToDelete.includes(img.id))
        .map(img => ({
          id: Number(img.id),
          url: String(img.url || ''),
          fileType: String(img.fileType || 'IMAGE'),
          entityId: Number(productData.id),
          entityType: 'PRODUCT',
          displayOrder: Number(img.displayOrder) || 0
        }));

      console.log('Existing media after filtering:', existingMedia);

      // 4. Crear el objeto final con solo los campos necesarios
      const updatedProduct = {
        id: Number(productData.id),
        updatedBy: "1", // TODO: Obtener del usuario autenticado
        brandId: String(productData.brandId || ""),
        categoryId: String(productData.categoryId || ""),
        externalId: productData.externalId || `PROD-${Date.now()}`,
        name: String(productData.name || ''),
        shortDescription: String(productData.shortDescription || ''),
        description: String(productData.description || ''),
        functionalities: Array.isArray(productData.functionalities) 
          ? productData.functionalities.map(String).filter(Boolean)
         : [],
        technicalData: Array.isArray(productData.technicalData)
          ? productData.technicalData
              .filter(item => item && item.key && item.value)
              .map(item => ({
                key: String(item.key).trim(),
                value: String(item.value).trim()
              }))
          : [],
        price: parseFloat(productData.price) || 0,
        cost: productData.cost ? parseFloat(productData.cost) : 0,
        discount: parseFloat(productData.discount) || 0,
        stock: parseInt(productData.stock, 10) || 0,
        garanty: parseInt(productData.garanty, 10) || 0,
        color: String(productData.color || ''),
        downloads: Array.isArray(productData.downloads)
          ? productData.downloads
              .filter(item => item && item.key && item.value)
              .map(item => ({
                key: String(item.key).trim(),
                value: String(item.value).trim()
              }))
          : [],
        rentable: Boolean(productData.rentable),
        status: productData.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        media: [
          ...existingMedia,
          ...newMedia.map((img, index) => ({
            id: 0, // 0 para nuevas imágenes, el backend asignará un ID
            url: String(img.url || img.publicUrl || ''),
            fileType: 'IMAGE',
            entityId: Number(productData.id) || 0,
            entityType: 'PRODUCT',
            displayOrder: existingMedia.length + index
          }))
        ].filter(Boolean)
      };

      console.log('Prepared update payload:', JSON.stringify(updatedProduct, null, 2));

      // 5. Actualizar el producto
      const response = await updateProductService(updatedProduct);
      console.log('Update API response:', response);
      
      if (response && response.data) {
        toast.success('Producto actualizado exitosamente');
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Formato de respuesta inesperado del servidor');
      }
      
      return response;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Error al actualizar el producto';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Elimina un producto y sus imágenes asociadas
   * @param {string|number} productId - ID del producto a eliminar
   * @param {Array} [mediaIds=[]] - IDs de las imágenes asociadas al producto
   * @returns {Promise<Object>} - Respuesta de la operación
   */
  deleteProduct: async (productId, mediaIds = []) => {
    try {
      // 1. Eliminar las imágenes asociadas si existen
      if (mediaIds && mediaIds.length > 0) {
        try {
          await mediaService.deleteImages(mediaIds);
        } catch (error) {
          console.error('Error al eliminar imágenes del producto:', error);
          // Continuar aunque falle la eliminación de imágenes
        }
      }

      // 2. Eliminar el producto
      const response = await deleteProductService(productId);
      toast.success('Producto eliminado exitosamente');
      return response;
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el producto');
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un producto por su ID
   * @param {string|number} productId - ID del producto
   * @returns {Promise<Object>} - Datos del producto
   */
  getProduct: async (productId) => {
    try {
      const response = await getProductByIdService(productId);
      return response.data; // Ajustar según la estructura de tu API
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      toast.error('No se pudo cargar la información del producto');
      throw error;
    }
  },

  // Constantes útiles para los componentes
  constants: {
    ProductStatus: {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE'
    }
  }
};

export default productWorkflow;
