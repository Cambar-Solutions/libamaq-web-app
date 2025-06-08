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
    deleteSparePart: deleteSparePartService,
    refreshSpareParts
  } = useSpareParts();

  // Estados para los diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSparePart, setCurrentSparePart] = useState(null);
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

  // Cerrar diálogo de creación
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  // Abrir diálogo para editar un repuesto existente
  const handleEdit = (sparePart) => {
    setCurrentSparePart(sparePart);
    setIsEditDialogOpen(true);
  };

  // Manejar éxito al guardar
  const handleSaveSuccess = () => {
    refreshSpareParts();
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setCurrentSparePart(null);
    toast.success('Repuesto guardado exitosamente');
  };

  // Manejar guardar repuesto (crear o actualizar)
  const handleSaveSparePart = async (formData) => {
    try {
      setIsSaving(true);
      
      // Extraer archivos del formData
      const { files, ...sparePartData } = formData;
      
      console.log('Datos del formulario recibidos en handleSaveSparePart:', {
        ...sparePartData,
        files: files ? `Array(${files.length} archivos)` : 'Ningún archivo'
      });

      // Llamar a la función correspondiente según si es creación o actualización
      let response;
      if (sparePartData.id) {
        console.log('Actualizando repuesto existente con ID:', sparePartData.id);
        response = await updateExistingSparePart({
          ...sparePartData,
          updatedBy: '1',
          updatedAt: new Date().toISOString()
        }, files);
      } else {
        console.log('Creando nuevo repuesto');
        response = await createNewSparePart({
          ...sparePartData,
          createdBy: '1',
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          rentable: Boolean(sparePartData.rentable),
          price: parseFloat(sparePartData.price) || 0,
          stock: parseInt(sparePartData.stock, 10) || 0
        }, files);
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
  const handleDelete = (sparePart) => {
    setSparePartToDelete(sparePart);
    setIsDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!sparePartToDelete) return;
    
    try {
      await deleteSparePartService(sparePartToDelete.id);
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

      {/* Diálogo para crear un nuevo repuesto */}
      <SparePartDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        title="Nuevo Repuesto"
        description="Complete el formulario para agregar un nuevo repuesto al inventario"
      >
        <CreateSparePartForm
          onSave={handleSaveSparePart}
          onCancel={handleCloseCreateDialog}
          isSaving={isSaving}
        />
      </SparePartDialog>

      {/* Diálogo para editar un repuesto existente */}
      <SparePartDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Editar Repuesto"
        description="Modifique los campos que desee actualizar"
      >
        {currentSparePart && (
          <EditSparePartForm
            sparePart={currentSparePart}
            onSave={handleSaveSparePart}
            onCancel={() => setIsEditDialogOpen(false)}
            isSaving={isSaving}
          />
        )}
      </SparePartDialog>

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
