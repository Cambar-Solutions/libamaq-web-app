'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from './hooks/useProducts';
import ProductCard from './components/atoms/ProductCard';
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
    refetchProducts,
    
    // Estados de carga
    isCreating,
    isUpdating,
    isDeleting,
    
    // Constantes
    constants
  } = useProducts();

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Ocurrió un error al cargar los productos');
    }
  }, [error]);

  // Extraer marcas y categorías únicas para los filtros
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const categories = [...new Set(products.flatMap(p => p.categories || []).filter(Boolean))];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Encabezado y acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona los productos de tu catálogo
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.brand}
                onValueChange={(value) => setFilters({ ...filters, brand: value })}
                disabled={brands.length === 0}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder={brands.length === 0 ? 'Sin marcas' : 'Marca'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
                disabled={categories.length === 0}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder={categories.length === 0 ? 'Sin categorías' : 'Categoría'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={refetchProducts}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Lista de productos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted/50" />
              <CardHeader>
                <div className="h-6 bg-muted/50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/30 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted/30 rounded w-full mb-2" />
                <div className="h-4 bg-muted/30 rounded w-2/3" />
              </CardContent>
              <div className="p-4 pt-0 flex gap-2">
                <div className="h-9 bg-muted/30 rounded flex-1" />
                <div className="h-9 w-9 bg-muted/30 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No se encontraron productos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || filters.brand || filters.category
              ? 'Intenta con otros términos de búsqueda o filtros'
              : 'Aún no hay productos registrados'}
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aquí irían los diálogos para crear/editar productos */}
      {/* <ProductFormDialog ... /> */}
    </div>
  );
};

export default ProductsView;