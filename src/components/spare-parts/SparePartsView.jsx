import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useSpareParts, useSparePartDetail } from './hooks/useSpareParts';
import { useSparePartForm } from './hooks/useSparePartForm';
import { SparePartsList } from './SparePartsList';
import { SparePartForm } from './SparePartForm';
import { createSparePart, updateSparePart, deleteSparePart } from '@/services/admin/sparePartService';

export const SparePartsView = () => {
  // Estados para el diálogo de edición/creación
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSparePartId, setEditingSparePartId] = useState(null);

  // Obtener la lista de repuestos
  const {
    spareParts,
    isLoading,
    filters,
    setFilters,
    handleDelete: handleDeleteSparePart,
    refetch: refetchSpareParts
  } = useSpareParts();

  // Obtener detalles del repuesto que se está editando
  const { sparePart: sparePartDetail, isLoading: isDetailLoading } = useSparePartDetail(editingSparePartId);

  // Configurar el formulario
  const {
    formData,
    setFormData,
    isLoading: isFormSubmitting,
    isUploading,
    uploadedImages,
    handleInputChange,
    handleNumberInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit: handleFormSubmit,
    setUploadedImages
  } = useSparePartForm(
    {
      id: 0,
      externalId: "",
      name: "",
      code: "",
      description: "",
      price: 0,
      stock: 0,
      material: "",
      variant: 0,
      status: "ACTIVE"
    },
    handleSaveSparePart
  );

  // Manejar la creación/actualización de un repuesto
  async function handleSaveSparePart(data) {
    try {
      if (editingSparePartId) {
        // Actualizar repuesto existente
        await updateSparePart(editingSparePartId, {
          ...data,
          media: uploadedImages
        });
        toast.success('Repuesto actualizado correctamente');
      } else {
        // Crear nuevo repuesto
        await createSparePart({
          ...data,
          media: uploadedImages
        });
        toast.success('Repuesto creado correctamente');
      }
      
      // Cerrar el diálogo y actualizar la lista
      handleCloseDialog();
      refetchSpareParts();
    } catch (error) {
      console.error('Error al guardar el repuesto:', error);
      toast.error('Error al guardar el repuesto');
    }
  }

  // Manejar la apertura del diálogo para editar un repuesto
  const handleEditSparePart = useCallback((sparePart) => {
    setEditingSparePartId(sparePart.id);
    setFormData({
      id: sparePart.id,
      externalId: sparePart.externalId || "",
      name: sparePart.name || "",
      code: sparePart.code || "",
      description: sparePart.description || "",
      price: sparePart.price || 0,
      stock: sparePart.stock || 0,
      material: sparePart.material || "",
      variant: sparePart.variant || 0,
      status: sparePart.status || "ACTIVE"
    });
    
    // Cargar imágenes existentes si las hay
    if (sparePart.media?.length > 0) {
      setUploadedImages(sparePart.media);
    } else {
      setUploadedImages([]);
    }
    
    setIsDialogOpen(true);
  }, [setFormData, setUploadedImages]);

  // Manejar la eliminación de un repuesto
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este repuesto?')) {
      try {
        await deleteSparePart(id);
        toast.success('Repuesto eliminado correctamente');
        refetchSpareParts();
      } catch (error) {
        console.error('Error al eliminar el repuesto:', error);
        toast.error('Error al eliminar el repuesto');
      }
    }
  }, [refetchSpareParts]);

  // Manejar la apertura del diálogo para crear un nuevo repuesto
  const handleAddNew = useCallback(() => {
    setEditingSparePartId(null);
    setFormData({
      id: 0,
      externalId: "",
      name: "",
      code: "",
      description: "",
      price: 0,
      stock: 0,
      material: "",
      variant: 0,
      status: "ACTIVE"
    });
    setUploadedImages([]);
    setIsDialogOpen(true);
  }, [setFormData, setUploadedImages]);

  // Manejar el cierre del diálogo
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSparePartId(null);
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Resetear a la primera página al cambiar filtros
    }));
  }, [setFilters]);

  // Manejar cambios de página
  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, [setFilters]);

  return (
    <div className="container mx-auto py-6 px-4">
      <SparePartsList
        spareParts={spareParts}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEditSparePart}
        onDelete={handleDelete}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
      />

      {/* Diálogo para crear/editar repuesto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSparePartId ? 'Editar Repuesto' : 'Nuevo Repuesto'}
            </DialogTitle>
          </DialogHeader>
          
          {isDetailLoading && editingSparePartId ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <SparePartForm
              formData={formData}
              isLoading={isFormSubmitting}
              isUploading={isUploading}
              uploadedImages={uploadedImages}
              onInputChange={handleInputChange}
              onNumberInputChange={handleNumberInputChange}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              onSubmit={(e) => handleFormSubmit(e, formData)}
              onCancel={handleCloseDialog}
              isEditing={!!editingSparePartId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SparePartsView;
