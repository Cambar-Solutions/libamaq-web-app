import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SparePartForm } from './SparePartForm';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { getSparePartById } from '@/services/admin/sparePartService';

export const SparePartDialog = ({
  isOpen,
  onClose,
  products = [],
  onSaveSuccess,
  onDeleteSuccess,
  isSaving = false,
  onSave: onSaveProp, // Renombrar para evitar conflicto
  selectedSparePart = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sparePartDetails, setSparePartDetails] = useState(null);

  useEffect(() => {
    const fetchSparePartDetails = async () => {
      if (!selectedSparePart?.id) {
        console.log('No hay ID de repuesto seleccionado, estableciendo detalles en null');
        setSparePartDetails(null);
        return;
      }

      setIsLoading(true);
      console.log('Obteniendo detalles del repuesto con ID:', selectedSparePart.id);
      
      try {
        const response = await getSparePartById(selectedSparePart.id);
        console.log('Respuesta de getSparePartById:', response);
        
        if (response?.result) {
          // Formatear los datos del repuesto según lo esperado por el formulario
          const sparePartData = response.result;
          
          // Asegurarse de que los campos numéricos sean números
          const formattedData = {
            id: sparePartData.id,
            externalId: sparePartData.externalId || '',
            name: sparePartData.name || '',
            code: sparePartData.code || '',
            description: sparePartData.description || '',
            material: sparePartData.material || '',
            price: typeof sparePartData.price === 'number' ? sparePartData.price : parseFloat(sparePartData.price) || 0,
            stock: typeof sparePartData.stock === 'number' ? sparePartData.stock : parseInt(sparePartData.stock, 10) || 0,
            variant: typeof sparePartData.variant === 'number' ? sparePartData.variant : parseInt(sparePartData.variant, 10) || 0,
            status: sparePartData.status || 'ACTIVE',
            media: sparePartData.media || [],
            rentable: sparePartData.rentable || false
          };
          
          console.log('Datos formateados para el formulario:', formattedData);
          setSparePartDetails(formattedData);
        } else {
          console.warn('No se encontraron datos para el repuesto');
          toast.error(response?.message || 'No se pudieron cargar los detalles del repuesto');
          onClose();
        }
      } catch (error) {
        console.error('Error al cargar los detalles del repuesto:', error);
        toast.error(`Error al cargar los detalles: ${error.message || 'Error desconocido'}`);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      if (selectedSparePart?.id) {
        fetchSparePartDetails();
      } else {
        console.log('Creando nuevo repuesto, estableciendo detalles en null');
        setSparePartDetails(null);
      }
    }
  }, [isOpen, selectedSparePart, onClose]);

  const handleSave = async (formData) => {
    console.log('handleSave llamado con:', formData);
    
    if (typeof onSaveProp !== 'function') {
      const errorMsg = 'Error: La función onSave no está definida';
      console.error(errorMsg, { onSave: onSaveProp });
      toast.error('Error: No se pudo guardar el repuesto. Intente nuevamente.');
      return false;
    }

    try {
      // Preparar los datos para enviar
      const saveData = {
        ...formData,
        id: selectedSparePart?.id || 0
      };
      console.log('Datos a guardar:', saveData);

      // Llamar a la función onSave proporcionada por el componente padre
      console.log('Llamando a onSaveProp con datos:', saveData);
      const result = await onSaveProp(saveData);
      console.log('Resultado de onSave:', result);
      
      // Si onSave devuelve un valor de verdadero, consideramos que fue exitoso
      const success = Boolean(result);
      
      if (success) {
        console.log('Guardado exitoso, cerrando diálogo...');
        if (typeof onSaveSuccess === 'function') {
          onSaveSuccess();
        }
        onClose();
      } else {
        console.warn('onSave no devolvió un valor de éxito verdadero');
      }
      
      return success;
    } catch (error) {
      console.error('Error al guardar el repuesto:', error);
      // Relanzar el error para que el formulario pueda manejarlo
      throw error;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="dialog-description"
      >
        <p id="dialog-description" className="sr-only">
          Formulario para crear un nuevo repuesto
        </p>
        <DialogHeader>
          <DialogTitle>
            {selectedSparePart ? 'Editar repuesto' : 'Nuevo repuesto'}
          </DialogTitle>
          <DialogDescription>
            {selectedSparePart 
              ? 'Modifique los campos que desee actualizar' 
              : 'Complete el formulario para agregar un nuevo repuesto al catálogo'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <SparePartForm
              initialData={{
                id: sparePartDetails?.id || 0,
                externalId: sparePartDetails?.externalId || '',
                name: sparePartDetails?.name || '',
                code: sparePartDetails?.code || '',
                description: sparePartDetails?.description || '',
                price: sparePartDetails?.price || 0,
                stock: sparePartDetails?.stock || 0,
                material: sparePartDetails?.material || '',
                variant: sparePartDetails?.variant || 0,
                status: sparePartDetails?.status || 'ACTIVE',
                productId: sparePartDetails?.productId || '',
                compatibilityNotes: sparePartDetails?.compatibilityNotes || '',
                media: sparePartDetails?.media || []
              }}
              products={products}
              onSave={handleSave}
              onCancel={onClose}
              isSaving={isSaving}
              isEditing={!!selectedSparePart}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
