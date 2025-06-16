import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  getProductPreviews,
  getProductById as getProductByIdService,
  getAllProducts as getAllProductsService
} from '../../../../../services/admin/productService';
import productWorkflow from '../workflows/productWorkflow';

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
    status: 'ACTIVE',
    brand: '',
    category: ''
  });

  // Consulta para obtener la lista de productos
  const { 
    data: products = [], 
    isLoading,
    error,
    refetch: refetchProducts 
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await getProductPreviews(filters);
      // Asegurarse de manejar tanto el formato antiguo como el nuevo de la respuesta
      return Array.isArray(response) ? response : (response?.data || []);
    },
    initialData: []
  });
  
  // Forzar un refetch cuando los filtros cambien
  useEffect(() => {
    refetchProducts();
  }, [filters, refetchProducts]);

  // Consulta para obtener todos los productos (sin paginación)
  const { data: allProducts = [] } = useQuery({
    queryKey: ['allProducts'],
    queryFn: async () => {
      const response = await getAllProductsService();
      return response.data || [];
    },
    initialData: []
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
      return await productWorkflow.updateProduct(
        { ...productData, id },
        newFiles,
        mediaToDelete
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['allProducts']);
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error al actualizar el producto:', error);
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
    
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesBrand = !filters.brand || product.brandId === filters.brand;
    const matchesCategory = !filters.category || product.categoryId === filters.category;

    return matchesSearch && matchesStatus && matchesBrand && matchesCategory;
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
    try {
      await updateProductMutation.mutateAsync({ 
        id, 
        productData, 
        newFiles, 
        mediaToDelete 
      });
    } catch (error) {
      console.error('Error en handleUpdate:', error);
    }
  };

  const handleDelete = async (id, mediaIds = []) => {
    try {
      await deleteProductMutation.mutateAsync({ id, mediaIds });
    } catch (error) {
      console.error('Error en handleDelete:', error);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
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
    
    // Acciones
    createProduct: handleCreate,
    updateProduct: handleUpdate,
    deleteProduct: handleDelete,
    openCreateDialog: () => setIsCreateDialogOpen(true),
    closeCreateDialog: () => setIsCreateDialogOpen(false),
    openEditDialog: handleEditClick,
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
