import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useProducts } from './hooks/useProducts';
import { Button } from '@/components/ui/button';
import { ProductDialog } from './components/molecules/ProductDialog';
import CreateProductForm from './components/forms/CreateProductForm';
import EditProductForm from './components/forms/EditProductForm';
import ProductList from './components/molecules/ProductList';

export default function ProductsView() {
  const navigate = useNavigate();
  const {
    products,
    filteredProducts,
    isLoading,
    searchTerm,
    setSearchTerm,
    brands,
    categories,
    createNewProduct,
    updateExistingProduct,
    deleteProduct,
    refreshProducts,
    isCreating,
    isUpdating,
    isDeleting
  } = useProducts();

  // Estados para los diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Manejadores de eventos
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleView = (product) => {
    // Navegar a la página de detalle del producto
    navigate(`/dashboard/products/${product.id}`);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        toast.error(error.message || 'Error al eliminar el producto');
      }
    }
  };

  const handleCreateSubmit = async (productData, files) => {
    try {
      await createNewProduct({
        ...productData,
        createdBy: '1', // TODO: Reemplazar con el ID del usuario autenticado
        status: 'ACTIVE'
      }, files);
      
      setIsCreateDialogOpen(false);
      toast.success('Producto creado correctamente');
    } catch (error) {
      console.error('Error al crear el producto:', error);
      throw error; // El formulario manejará el error
    }
  };

  const handleUpdateSubmit = async (productData, files) => {
    try {
      await updateExistingProduct({
        ...productData,
        id: currentProduct.id,
        updatedBy: '1' // TODO: Reemplazar con el ID del usuario autenticado
      }, files);
      
      setIsEditDialogOpen(false);
      setCurrentProduct(null);
      toast.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error; // El formulario manejará el error
    }
  };

  // Renderizado
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Productos</h1>
          <Button onClick={handleCreate}>
            Nuevo Producto
          </Button>
        </div>

        {/* Lista de productos */}
        <ProductList
          products={filteredProducts}
          loading={isLoading}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onAdd={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* Diálogo de creación */}
        <ProductDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Nuevo Producto"
          description="Completa la información para agregar un nuevo producto"
        >
          <CreateProductForm
            brands={brands}
            categories={categories}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSaving={isCreating}
          />
        </ProductDialog>

        {/* Diálogo de edición */}
        <ProductDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditDialogOpen(false);
              setCurrentProduct(null);
            }
          }}
          title="Editar Producto"
          description="Actualiza la información del producto"
        >
          {currentProduct && (
            <EditProductForm
              product={currentProduct}
              brands={brands}
              categories={categories}
              onSubmit={handleUpdateSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setCurrentProduct(null);
              }}
              isSaving={isUpdating}
            />
          )}
        </ProductDialog>
      </div>
    </div>
  );
}
