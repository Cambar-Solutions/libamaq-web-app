import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SparePartsList } from './components/molecules/SparePartsList';
import { SparePartDialog } from './components/molecules/SparePartDialog';
import { CreateSparePartForm } from './components/forms/CreateSparePartForm';
import { EditSparePartForm } from './components/forms/EditSparePartForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import useSpareParts from './hooks/useSpareParts';

export default function SparePartsView() {
  // Usar el hook personalizado para la lógica de negocio
  const {
    spareParts,
    filteredSpareParts,
    isLoading,
    searchTerm,
    setSearchTerm,
    products,
    createNewSparePart,
    updateExistingSparePart,
    deleteSparePart,
    refreshSpareParts,
    SparePartStatus
  } = useSpareParts();

  // Estados para los diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSparePart, setCurrentSparePart] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sparePartToDelete, setSparePartToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Manejador para la búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target ? e.target.value : e);
  };

  // Abrir diálogo para crear un nuevo repuesto
  const handleAddNew = () => {
    setIsCreateDialogOpen(true);
  };

  // Cerrar diálogo de creación
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  // Abrir diálogo de edición
  const handleEdit = (sparePart) => {
    setCurrentSparePart(sparePart);
    setIsEditDialogOpen(true);
  };

  // Cerrar diálogo de edición
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentSparePart(null);
  };

  // Manejar guardado exitoso
  const handleSaveSuccess = () => {
    toast.success('Repuesto guardado correctamente');
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setCurrentSparePart(null);
    refreshSpareParts();
  };

  // Manejar el guardado de un repuesto (creación o actualización)
  const handleSaveSparePart = async (sparePartData, files = []) => {
    try {
      setIsSaving(true);
      let response;

      if (sparePartData.id) {
        // Actualizar repuesto existente
        response = await updateExistingSparePart({
          ...sparePartData,
          rentable: Boolean(sparePartData.rentable),
          price: parseFloat(sparePartData.price) || 0,
          stock: parseInt(sparePartData.stock, 10) || 0
        }, files);
      } else {
        // Crear nuevo repuesto
        response = await createNewSparePart(
          {
            ...sparePartData,
            createdBy: '1',
            createdAt: new Date().toISOString(),
            status: SparePartStatus.ACTIVE,
            rentable: Boolean(sparePartData.rentable),
            price: parseFloat(sparePartData.price) || 0,
            stock: parseInt(sparePartData.stock, 10) || 0
          },
          files
        );
      }

      handleSaveSuccess();
      return response;
    } catch (error) {
      console.error('Error al guardar el repuesto:', error);
      toast.error(error.message || 'Error al guardar el repuesto');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar eliminación de repuesto
  const handleDeleteClick = (sparePart) => {
    setSparePartToDelete(sparePart);
    setIsDeleteDialogOpen(true);
  };

  // Confirmar eliminación de repuesto
  const handleConfirmDelete = async () => {
    if (!sparePartToDelete) return;
    
    try {
      setIsSaving(true);
      const mediaIds = sparePartToDelete.media?.map(m => m.id) || [];
      await deleteSparePart(sparePartToDelete.id, mediaIds);
      toast.success('Repuesto eliminado correctamente');
      setIsDeleteDialogOpen(false);
      setSparePartToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el repuesto:', error);
      toast.error(error.message || 'Error al eliminar el repuesto');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}

      {/* Lista de repuestos */}
      <SparePartsList
        spareParts={filteredSpareParts}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Diálogo para crear nuevo repuesto */}
      <SparePartDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        title="Nuevo Repuesto"
      >
        <CreateSparePartForm
          onSubmit={handleSaveSparePart}
          onCancel={handleCloseCreateDialog}
          isSaving={isSaving}
          products={products}
        />
      </SparePartDialog>

      {/* Diálogo para editar repuesto existente */}
      {currentSparePart && (
        <SparePartDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          title="Editar Repuesto"
        >
          <EditSparePartForm
            sparePart={currentSparePart}
            onSave={handleSaveSparePart}
            onCancel={handleCloseEditDialog}
            isSaving={isSaving}
          />
        </SparePartDialog>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Deseas eliminar permanentemente este repuesto?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
