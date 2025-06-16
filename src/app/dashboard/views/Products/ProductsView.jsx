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
import { getAllActiveBrands } from '../../../../../src/services/admin/brandService';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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

  // Handler para el submit del formulario (sin tipos)
  const handleCreateSubmit = async (data) => {
    const success = await createProduct(data);
    if (success) {
      reset(); // Limpia el formulario si la creación fue exitosa
    }
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


  // Fetch active brands and categories
useEffect(() => {
  const fetchData = async () => {
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        getAllActiveBrands(),
        getActiveCategories() // <-- ¡Asegúrate de tener esta función y servicio!
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
      brandId: value === 'ALL' ? null : value
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

          {/* Diálogo de creación integrado */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => !isOpen && closeCreateDialog()}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center space-x-3">
                  <div className="sm:text-center">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      <div className="flex items-center space-x-3">
                        <Drill className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Nuevo Producto</h2>
                      </div>
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-gray-500">
                      Completa la información del producto. Los campos marcados con * son obligatorios.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="space-y-2 ">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input id="name" {...register('name')} placeholder="Ej: Smartphone Galaxy S21" disabled={isCreating} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  {/* Descripción Corta */}
                  <div className="space-y-2 ">
                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                    <Input id="shortDescription" {...register('shortDescription')} placeholder="Smartphone de última generación" disabled={isCreating} />
                  </div>

                  {/* Descripción Larga */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" {...register('description')} placeholder="El Galaxy S21 cuenta con una pantalla de 6.2 pulgadas..." disabled={isCreating} />
                  </div>

                  {/* ID Externo */}
                  <div className="space-y-2">
                    <Label htmlFor="externalId">ID Externo</Label>
                    <Input id="externalId" {...register('externalId')} placeholder="Ej: PROD-12345" disabled={isCreating} />
                  </div>

                  {/* ID de Marca */}
                  <div className="space-y-2">
                    <Label htmlFor="brandId">Marca *</Label>
                    <Controller
                      name="brandId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una marca" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map(brand => (
                              <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.brandId && <p className="text-sm text-red-600">{errors.brandId.message}</p>}
                  </div>

                  {/* ID de Categoría (Ejemplo) */}
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">ID de Categoría *</Label>
                    <Input id="categoryId" {...register('categoryId')} placeholder="Ej: 1 (Smartphones)" disabled={isCreating} />
                    {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
                  </div>

                  {/* Precio */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (MXN) *</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                      <Input id="price" type="number" step="0.01" {...register('price')} placeholder="0.00" className="pl-7" disabled={isCreating} />
                    </div>
                    {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                  </div>

                  {/* Costo */}
                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo (MXN)</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                      <Input id="cost" type="number" step="0.01" {...register('cost')} placeholder="0.00" className="pl-7" disabled={isCreating} />
                    </div>
                    {errors.cost && <p className="text-sm text-red-600">{errors.cost.message}</p>}
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input id="stock" type="number" {...register('stock')} placeholder="0" disabled={isCreating} />
                    {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" {...register('color')} placeholder="Ej: Negro" disabled={isCreating} />
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">
                              <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>Activo</div>
                            </SelectItem>
                            <SelectItem value="INACTIVE">
                              <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>Inactivo</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Rentable */}
                  <div className="flex items-center space-x-3 pt-5">
                    <Controller
                      name="rentable"
                      control={control}
                      render={({ field }) => (
                        <Switch id="rentable" checked={field.value} onCheckedChange={field.onChange} disabled={isCreating} />
                      )}
                    />
                    <Label htmlFor="rentable" className="text-sm font-medium text-gray-700 cursor-pointer">
                      ¿Disponible para renta?
                    </Label>
                  </div>

                  {/* Datos Técnicos */}
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <Label className="text-base font-semibold">Datos Técnicos</Label>
                      <p className="text-sm text-gray-500">Añade especificaciones técnicas como potencia, voltaje, etc.</p>
                    </div>
                    {fields.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                        <Input {...register(`technicalData.${index}.key`)} placeholder="Clave (Ej: Potencia)" className="flex-1" disabled={isCreating} />
                        <Input {...register(`technicalData.${index}.value`)} placeholder="Valor (Ej: 550w)" className="flex-1" disabled={isCreating} />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isCreating}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {(errors.technicalData) && <p className="text-sm text-red-600">Ambos campos de datos técnicos son requeridos.</p>}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ key: "", value: "" })}
                      className="mt-2"
                      disabled={isCreating}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Dato Técnico
                    </Button>
                  </div>
                </div>

                <DialogFooter className="border-t pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isCreating}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                    {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Producto'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
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
                  onEdit={updateProduct}
                  onDelete={openDeleteDialog}
                  onView={(product) => {
                    console.log('Ver producto:', product);
                  }}
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
                className="px-6"
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
      </div>
    </ErrorBoundary>
  );
};

export default ProductsView;