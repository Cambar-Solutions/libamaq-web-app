import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  getProductPreviews,
  getProductById as getProductByIdService,
  getAllProducts as getAllProductsService,
} from '../../../../../services/admin/productService';
import productWorkflow from '../workflows/productWorkflow';
import { getAllActiveBrands } from '../../../../../services/admin/brandService';
import { getCategoriesByBrand, getCategoryById } from '../../../../../services/admin/categoryService';

/**
 * Hook personalizado para manejar la lógica de productos
 */
export const useProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    brandId: '',
    categoryId: ''
  });
  const [brandsForEdit, setBrandsForEdit] = useState([]);
  const [categoriesForEdit, setCategoriesForEdit] = useState([]);

  // Consulta para obtener la lista de productos
  const { 
    data: products = [], 
    isLoading,
    error,
    refetch: refetchProducts 
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      try {
        const response = await getAllProductsService();
        // Asegurarse de manejar tanto el formato antiguo como el nuevo de la respuesta
        const result = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return result;
      } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
      }
    },
    initialData: [],
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
  
  // Forzar un refetch cuando los filtros cambien
  useEffect(() => {
    refetchProducts();
  }, [filters, refetchProducts]);

  // Consulta para obtener todos los productos (sin paginación)
  const { data: allProducts = [] } = useQuery({
    queryKey: ['allProducts'],
    queryFn: async () => {
      try {
        const response = await getAllProductsService();
        return response.data || [];
      } catch (error) {
        console.error('Error al obtener todos los productos:', error);
        return [];
      }
    },
    initialData: [],
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  // Mutación para crear un producto
  const createProductMutation = useMutation({
    mutationFn: async ({ productData, files }) => {
      return await productWorkflow.createProduct(productData, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['allProducts']);
      setIsCreateDialogOpen(false);
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      console.error('Error al crear el producto:', error);
      toast.error(error.message || 'Error al crear el producto');
    }
  });

  // Mutación para actualizar un producto
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData, newFiles = [], mediaToDelete = [] }) => {
      console.log('🔄 updateProductMutation INICIADA:', { id, productData, newFiles, mediaToDelete });
      const result = await productWorkflow.updateProduct(
        { ...productData, id },
        newFiles,
        mediaToDelete
      );
      console.log('✅ updateProductMutation COMPLETADA:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 updateProductMutation SUCCESS');
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['allProducts']);
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('❌ updateProductMutation ERROR:', error);
      toast.error(error.message || 'Error al actualizar el producto');
    }
  });

  // Mutación para eliminar un producto
  const deleteProductMutation = useMutation({
    mutationFn: async ({ id, mediaIds = [] }) => {
      return await productWorkflow.deleteProduct(id, mediaIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['allProducts']);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error al eliminar el producto:', error);
      toast.error(error.message || 'Error al eliminar el producto');
    }
  });

  // Filtrar productos según el término de búsqueda y filtros
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand =
      !filters.brandId ||
      String(product.brandId) === String(filters.brandId) ||
      (product.brand && String(product.brand.id) === String(filters.brandId));
    const matchesCategory = !filters.categoryId || String(product.categoryId) === String(filters.categoryId);

    return matchesSearch && matchesBrand && matchesCategory;
  });

  // Manejadores de eventos
  const handleCreate = async (productData, files) => {
    try {
      await createProductMutation.mutateAsync({ productData, files });
    } catch (error) {
      console.error('Error en handleCreate:', error);
    }
  };

  const handleUpdate = async (id, productData, newFiles = [], mediaToDelete = []) => {
    console.log('🔄 handleUpdate INICIADO:', { id, productData, newFiles, mediaToDelete });
    try {
      await updateProductMutation.mutateAsync({ 
        id, 
        productData, 
        newFiles, 
        mediaToDelete 
      });
      console.log('✅ handleUpdate COMPLETADO');
    } catch (error) {
      console.error('❌ Error en handleUpdate:', error);
    }
  };

  const handleDelete = async (id, mediaIds = []) => {
    try {
      await deleteProductMutation.mutateAsync({ id, mediaIds });
    } catch (error) {
      console.error('Error en handleDelete:', error);
    }
  };

  const openEditDialog = async (productId) => {
    try {
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setBrandsForEdit([]);
      setCategoriesForEdit([]);
      const response = await getProductByIdService(productId);
      const product = response?.data || response;
      // Obtener la categoría por ID y asignarla al producto
      let categoryObj = null;
      if (product.categoryId) {
        try {
          const categoryResp = await getCategoryById(product.categoryId);
          // Clonamos la categoría SIN la propiedad brands
          const originalCategory = categoryResp?.data || categoryResp;
          if (originalCategory && originalCategory.id) {
            // Elimina la propiedad brands si existe
            const { brands, ...categoryWithoutBrands } = originalCategory;
            categoryObj = categoryWithoutBrands;
          }
        } catch (e) {
          console.warn('No se pudo obtener la categoría por ID:', e);
        }
      }
      const productWithCategory = { ...product, category: categoryObj };
      setSelectedProduct(productWithCategory);
      // Paso a) Obtener todas las marcas
      const brandsResp = await getAllActiveBrands();
      const brandsList = brandsResp?.data || [];
      setBrandsForEdit(brandsList);
      // Paso b) Obtener categorías filtradas por brandId del producto
      let categoriesList = [];
      if (product.brandId) {
        const categoriesResp = await getCategoriesByBrand(product.brandId);
        categoriesList = categoriesResp?.data || [];
      }
      setCategoriesForEdit(categoriesList);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast.error('Error al cargar el producto para editar: ' + (error.message || error));
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const mediaIds = productToDelete.media?.map(img => img.id).filter(Boolean) || [];
    handleDelete(productToDelete.id, mediaIds);
  };

  // Valores y funciones que se exponen a los componentes
  return {
    // Estado
    products: filteredProducts,
    allProducts,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedProduct,
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    productToDelete,
    brandsForEdit,
    categoriesForEdit,
    
    // Acciones
    createProduct: handleCreate,
    updateProduct: handleUpdate,
    deleteProduct: handleDelete,
    openCreateDialog: () => setIsCreateDialogOpen(true),
    closeCreateDialog: () => setIsCreateDialogOpen(false),
    openEditDialog,
    closeEditDialog: () => {
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    },
    openDeleteDialog: handleDeleteClick,
    closeDeleteDialog: () => {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    confirmDelete,
    refetchProducts,
    
    // Estados de carga
    isCreating: createProductMutation.isLoading,
    isUpdating: updateProductMutation.isLoading,
    isDeleting: deleteProductMutation.isLoading,
    
    // Constantes
    constants: productWorkflow.constants
  };
};

export default useProducts;