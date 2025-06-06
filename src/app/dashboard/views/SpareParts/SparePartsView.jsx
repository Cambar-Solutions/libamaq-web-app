import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSpareParts } from './hooks/useSpareParts';
import { SparePartsList } from './components/molecules/SparePartsList';
import { SparePartDialog } from './components/molecules/SparePartDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
    refreshSpareParts
  } = useSpareParts();

  // Estados para los diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSparePartId, setCurrentSparePartId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el diálogo de confirmación de eliminación
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

  // Abrir diálogo para editar un repuesto existente
  const handleEdit = (sparePart) => {
    setCurrentSparePartId(sparePart.id);
    setIsEditDialogOpen(true);
  };

  // Manejar éxito al guardar
  const handleSaveSuccess = () => {
    refreshSpareParts();
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    toast.success('Repuesto guardado exitosamente');
  };

  // Manejar éxito al eliminar
  const handleDeleteSuccess = () => {
    refreshSpareParts();
    setIsDeleteDialogOpen(false);
    setSparePartToDelete(null);
    toast.success('Repuesto eliminado exitosamente');
  };

  // Manejar guardar repuesto (crear o actualizar)
  const handleSaveSparePart = async (formData) => {
    try {
      setIsSaving(true);
      console.log('Datos del formulario recibidos en handleSaveSparePart:', formData);
      
      // Preparar los datos del formulario
      const sparePartData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        variant: parseInt(formData.variant, 10) || 0,
        status: formData.status || 'ACTIVE',
        rentable: Boolean(formData.rentable)
      };

      // Si hay archivos, agregarlos a los datos
      if (formData.files && formData.files.length > 0) {
        sparePartData.files = formData.files;
      }

      console.log('Datos preparados para enviar al servicio:', sparePartData);

      let response;
      if (formData.id) {
        console.log('Actualizando repuesto existente con ID:', formData.id);
        response = await updateExistingSparePart(sparePartData);
      } else {
        console.log('Creando nuevo repuesto');
        response = await createNewSparePart(sparePartData);
      }

      console.log('Respuesta del servicio:', response);

      if (response) {
        console.log('Guardado exitoso, llamando a handleSaveSuccess');
        handleSaveSuccess();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al guardar el repuesto:', error);
      toast.error(`Error al guardar el repuesto: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar la eliminación de un repuesto
  const handleDelete = async (sparePart) => {
    setSparePartToDelete(sparePart);
    setIsDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!sparePartToDelete) return;
    
    try {
      await deleteSparePart(sparePartToDelete.id);
      toast.success('Repuesto eliminado correctamente');
      refreshSpareParts();
    } catch (error) {
      console.error('Error al eliminar el repuesto:', error);
      toast.error(`Error al eliminar el repuesto: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setSparePartToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Repuestos</h1>
          <p className="mt-2 text-sm text-gray-500">
            Administra los repuestos disponibles en el inventario
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          <span>Agregar Repuesto</span>
        </button>
      </div>

      {/* Lista de repuestos */}
      <SparePartsList
        spareParts={filteredSpareParts}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyStateMessage={
          searchTerm
            ? 'No se encontraron repuestos que coincidan con la búsqueda'
            : 'Aún no hay repuestos registrados. Comienza agregando uno nuevo.'
        }
      />

      {/* Diálogo para crear/editar repuesto */}
      <SparePartDialog
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setCurrentSparePartId(null);
        }}
        onSave={handleSaveSparePart}
        onSaveSuccess={handleSaveSuccess}
        onDeleteSuccess={handleDeleteSuccess}
        selectedSparePart={currentSparePartId ? { id: currentSparePartId } : null}
        products={products}
        isSaving={isSaving}
        // Asegurarnos de que onSave se pase correctamente
        onSaveProp={handleSaveSparePart}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el repuesto "{sparePartToDelete?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
