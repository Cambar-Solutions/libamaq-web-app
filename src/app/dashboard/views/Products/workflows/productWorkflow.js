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
      let media = [];
      if (files && files.length > 0) {
        const uploadResponse = await mediaService.uploadImages(files);
        if (uploadResponse && uploadResponse.data) {
          media = Array.isArray(uploadResponse.data) ? uploadResponse.data : [uploadResponse.data];
        }
      }

      // 2. Crear el producto con las referencias a las imágenes
      const productWithMedia = {
        ...productData,
        media: media.map((img, index) => ({
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
      // Validar datos básicos
      if (!productData || !productData.id) {
        throw new Error('Datos del producto no válidos');
      }

      // 1. Subir nuevas imágenes si hay archivos
      let newMedia = [];
      if (newFiles && newFiles.length > 0) {
        try {
          const uploadResponse = await mediaService.uploadImages(newFiles);
          if (uploadResponse && uploadResponse.data) {
            newMedia = Array.isArray(uploadResponse.data) 
              ? uploadResponse.data 
              : [uploadResponse.data];
          }
        } catch (error) {
          console.error('Error al subir nuevas imágenes:', error);
          throw new Error('Error al subir las imágenes');
        }
      }

      // 2. Eliminar imágenes marcadas para borrar
      if (mediaToDelete && mediaToDelete.length > 0) {
        try {
          await mediaService.deleteImages(mediaToDelete);
        } catch (error) {
          console.error('Error al eliminar imágenes antiguas:', error);
          // Continuar aunque falle la eliminación
        }
      }

      // 3. Filtrar las imágenes existentes que no se hayan marcado para eliminar
      const existingMedia = (productData.media || []).filter(
        img => img && img.id && !mediaToDelete.includes(img.id)
      );

      // 4. Crear el objeto final con solo los campos necesarios
      const { id, ...restData } = productData;
      const updatedProduct = {
        ...restData,
        media: [
          ...existingMedia.map(img => ({
            ...img,
            id: Number(img.id),
            entityId: Number(id),
            entityType: 'PRODUCT'
          })),
          ...newMedia.map((img, index) => ({
            id: 0, // 0 para nuevas imágenes, el backend asignará un ID
            url: img.url,
            fileType: 'IMAGE',
            entityId: Number(id),
            entityType: 'PRODUCT',
            displayOrder: existingMedia.length + index
          }))
        ]
      };

      // 5. Actualizar el producto
      const response = await updateProductService(id, updatedProduct);
      toast.success('Producto actualizado exitosamente');
      return response;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el producto');
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
