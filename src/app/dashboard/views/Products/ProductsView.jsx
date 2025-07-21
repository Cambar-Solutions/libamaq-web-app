'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Search, X, Drill } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import toast from 'react-hot-toast';
import { useProducts } from './hooks/useProducts';
import ProductCard from './components/atoms/ProductCard';
import { getAllBrands } from '../../../../../src/services/admin/brandService';
import { getActiveCategories } from '../../../../../src/services/admin/categoryService';
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
import CreateProductFormDialog from './components/atoms/CreateProductFormDialog';
import EditProductFormDialog from './components/atoms/EditProductFormDialog';
import ViewProductDetailsDialog from './components/atoms/ViewProductDetailsDialog';
import { getProductById } from '@/services/admin/productService';

// Esquema de validación con Zod (funciona igual en JS)
const productSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  externalId: z.string().optional(),
  brandId: z.string().min(1, { message: "El ID de la marca es requerido" }),
  categoryId: z.string().min(1, { message: "El ID de la categoría es requerido" }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "El precio debe ser un número positivo" })
  ),
  cost: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "El costo debe ser un número positivo" }).optional()
  ),
  stock: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0, { message: "El stock no puede ser negativo" })
  ),
  color: z.string().optional(),
  rentable: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  technicalData: z.array(z.object({
    key: z.string().min(1, { message: "La clave es requerida" }),
    value: z.string().min(1, { message: "El valor es requerido" }),
  })).optional(),
});


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

  // Configuración de react-hook-form (sin tipos)
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      externalId: '',
      brandId: '',
      categoryId: '',
      price: 0,
      cost: 0,
      stock: 0,
      color: '',
      status: 'ACTIVE',
      rentable: false,
      technicalData: [],
    }
  });


  const { fields, append, remove } = useFieldArray({
    control,
    name: "technicalData",
  });

  // Handler para el submit del formulario (acepta data y files)
  const handleCreateSubmit = async (data, files) => {
    await createProduct(data, files);
    reset(); // Limpia el formulario después de crear
  };

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

  // Estados locales (sin tipos)
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true); // Nuevo estado para la carga inicial de datos
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [productToView, setProductToView] = useState(null);


  // Fetch active brands and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          getAllBrands(),
          getActiveCategories()
        ]);

        if (brandsResponse && Array.isArray(brandsResponse.data)) {
          setBrands(brandsResponse.data);
        } else {
          toast.error('Formato de respuesta inesperado al cargar las marcas.');
        }

        if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          toast.error('Formato de respuesta inesperado al cargar las categorías.');
        }
      } catch (error) {
        console.error("Error al cargar marcas o categorías:", error);
        toast.error('Error al cargar las marcas o categorías.');
      } finally {
        setDataLoading(false); // Marca la carga como completa
      }
    };

    fetchData();
  }, []);

  // Handle brand filter change
  const handleBrandFilterChange = (value) => {
    setSelectedBrand(value);
    setFilters(prev => ({
      ...prev,
      brandId: value === 'ALL' ? '' : value
    }));
  };

  // Handle category filter change
  const handleCategoryFilterChange = (value) => {
    setFilters(prev => ({
      ...prev,
      categoryId: value === 'ALL' ? '' : value
    }));
  };

  // Función para ver detalles de producto
  const handleViewProductDetails = async (productId) => {
    try {
      setIsViewModalOpen(false);
      setProductToView(null);
      const response = await getProductById(productId);
      const product = response?.data || response;
      setProductToView(product);
      setIsViewModalOpen(true);
    } catch (error) {
      setProductToView(null);
      setIsViewModalOpen(false);
      toast.error('No se pudieron cargar los detalles del producto.');
    }
  };

  // Handle error state - mostrar error pero no romper la aplicación
  if (error) {
    console.error('Error en ProductsView:', error);
    // En lugar de lanzar error, mostrar un mensaje de error en la UI
    return (
      <ErrorBoundary>
        <div className="container mx-auto px-2 sm:px-4 py-4 space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center bg-background/50 rounded-lg border border-dashed">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">
              Error al cargar los productos
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6 px-4">
              {error.message || 'Ha ocurrido un error al cargar los productos. Por favor, intenta de nuevo.'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
              className="px-6 cursor-pointer"
            >
              Recargar página
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
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

          {/* Diálogo de creación integrado */}
          <CreateProductFormDialog
            brands={brands}
            categories={categories}
            isCreating={isCreating}
            isCreateDialogOpen={isCreateDialogOpen}
            openCreateDialog={openCreateDialog}
            closeCreateDialog={closeCreateDialog}
            handleCreateSubmit={handleCreateSubmit}
            handleSubmit={handleSubmit}
            fields={fields}
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            getValues={getValues}
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 ">
          <div className="flex-1 max-w-xl">
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
              <SelectTrigger className="w-full bg-white rounded-full">
                <SelectValue placeholder="Filtrar por marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={filters.categoryId || 'ALL'}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-full bg-white rounded-full">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products List (sin cambios) */}
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
                  onViewDetails={handleViewProductDetails}
                  brands={brands}
                  categories={categories}
                  isCreating={isCreating}
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
                {searchTerm || filters.brandId
                  ? 'Intenta con otros términos de búsqueda o filtros.'
                  : 'Aún no hay productos registrados en tu catálogo.'}
              </p>
              <Button
                onClick={openCreateDialog}
                variant="default"
                size="sm"
                className="px-6 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog (sin cambios) */}
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
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <AlertDialogCancel
                disabled={isDeleting}
                className="w-full sm:w-auto mt-0"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90"
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

        <EditProductFormDialog
          open={isEditDialogOpen}
          onOpenChange={closeEditDialog}
          product={selectedProduct}
          brands={brands}
          onSave={updateProduct}
          onClose={closeEditDialog}
          isUpdating={isUpdating}
        />

        {/* Modal de detalles de producto */}
        <ViewProductDetailsDialog
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          productData={productToView}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ProductsView;