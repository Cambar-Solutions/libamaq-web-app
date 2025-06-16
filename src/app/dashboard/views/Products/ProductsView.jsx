'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Search, X } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import toast from 'react-hot-toast';
import { useProducts } from './hooks/useProducts';
import ProductCard from './components/atoms/ProductCard';
import { getAllActiveBrands } from '../../../../../src/services/admin/brandService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ProductsView = () => {
  const {
    // Estado
    products,
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
    createProduct,
    updateProduct,
    deleteProduct,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    
    // Estados de carga
    isCreating,
    isUpdating,
    isDeleting,
    
    // Constantes
    constants
  } = useProducts();
  
  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prevFilters => ({
        ...prevFilters,
        search: searchTerm
      }));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Ocurrió un error al cargar los productos');
    }
  }, [error]);

  // Extraer marcas y categorías únicas para los filtros
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const categories = [...new Set(products?.flatMap(p => p.categories || []).filter(Boolean) || [])];

  // Fetch active brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log('Fetching brands...');
        const response = await getAllActiveBrands();
        console.log('Brands response:', response);
        if (response && Array.isArray(response.data)) {
          setBrands(response.data);
        } else {
          console.error('Unexpected brands response format:', response);
          toast.error('Formato de respuesta inesperado al cargar las marcas');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error('Error al cargar las marcas');
      }
    };

    fetchBrands();
  }, []);

  // Handle brand filter change
  const handleBrandFilterChange = (value) => {
    setSelectedBrand(value);
    setFilters(prev => ({
      ...prev,
      brand: value === 'ALL' ? null : value
    }));
  };

  // Handle error state
  if (error) {
    throw new Error(error.message || 'Error al cargar los productos');
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-2 sm:px-4 py-4 space-y-4 sm:space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Productos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona los productos de tu catálogo
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-2xl">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={selectedBrand}
            onValueChange={handleBrandFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/50 animate-pulse">
                <div className="aspect-square bg-muted/30" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted/30 rounded w-4/5" />
                  <div className="h-4 bg-muted/20 rounded w-1/2" />
                  <div className="h-6 bg-muted/20 rounded w-3/4 mt-2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 bg-muted/20 rounded w-16" />
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-muted/20 rounded" />
                      <div className="h-8 w-8 bg-muted/20 rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onView={(product) => {
                  // Implementar vista detallada
                  console.log('Ver producto:', product);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center bg-background/50 rounded-lg border border-dashed">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">
              No se encontraron productos
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6 px-4">
              {searchTerm || filters.brand || filters.category
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Aún no hay productos registrados en tu catálogo.'}
            </p>
            <Button 
              onClick={openCreateDialog}
              variant="default"
              size="sm"
              className="px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente de tu catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="w-full sm:w-auto mt-0"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : 'Eliminar producto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        {/* Aquí irían los diálogos para crear/editar productos */}
        {/* <ProductFormDialog ... /> */}
      </div>
    </ErrorBoundary>
  );
};

export default ProductsView;