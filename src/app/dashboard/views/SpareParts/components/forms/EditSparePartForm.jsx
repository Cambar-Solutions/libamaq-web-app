import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import ImageUploader from '../molecules/ImageUploader';

/**
 * Componente de formulario para editar un repuesto existente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.sparePart - Datos del repuesto a editar
 * @param {Function} props.onSave - Función que se ejecuta al guardar el formulario
 * @param {Function} props.onCancel - Función que se ejecuta al cancelar la edición
 * @param {boolean} props.isSaving - Indica si se está guardando el formulario
 */
export const EditSparePartForm = ({ 
  sparePart, 
  onSave, 
  onCancel, 
  isSaving 
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: {
      ...sparePart,
      rentable: sparePart?.rentable || false,
      price: sparePart?.price?.toString() || '0',
      stock: sparePart?.stock?.toString() || '0',
    }
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  // Actualizar el formulario cuando cambia el repuesto
  useEffect(() => {
    if (sparePart) {
      reset({
        ...sparePart,
        rentable: sparePart.rentable || false,
        price: sparePart.price?.toString() || '0',
        stock: sparePart.stock?.toString() || '0',
      });
      setSelectedFiles([]);
      setMediaToDelete([]);
    }
  }, [sparePart, reset]);

  const onSubmit = (data) => {
    try {
      if (!sparePart?.id) {
        throw new Error('ID de repuesto no válido');
      }

      // Preparar los datos del formulario con el formato exacto
      const formData = {
        ...data,
        // Convertir campos numéricos
        price: parseFloat(data.price) || 0,
        stock: parseInt(data.stock, 10) || 0,
        rentable: Boolean(data.rentable),
        // Mantener los medios existentes
        media: (sparePart.media || []).map(media => ({
          id: Number(media.id),
          url: media.url,
          fileType: media.fileType || 'IMAGE',
          entityType: 'SPARE_PART',
          displayOrder: Number(media.displayOrder) || 0
        }))
      };
      
      console.log('Enviando datos del formulario:', formData);
      onSave(formData, selectedFiles, mediaToDelete);
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      toast.error(error.message || 'Error al procesar el formulario');
    }
  };

  const handleImagesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleImageDelete = (imageId) => {
    setMediaToDelete(prev => [...prev, imageId]);
  };

  const existingImages = (sparePart?.media || []).filter(
    img => !mediaToDelete.includes(img.id)
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Código */}
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            {...register('code', { required: 'El código es requerido' })}
            placeholder="Ej: RP-001"
            disabled={isSaving}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            {...register('name', { required: 'El nombre es requerido' })}
            placeholder="Ej: Pantalla OLED"
            disabled={isSaving}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label htmlFor="price">Precio (MXN) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { 
              required: 'El precio es requerido',
              min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
            })}
            placeholder="0.00"
            disabled={isSaving}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            {...register('stock', { 
              required: 'El stock es requerido',
              min: { value: 0, message: 'El stock debe ser mayor o igual a 0' }
            })}
            placeholder="0"
            disabled={isSaving}
          />
          {errors.stock && (
            <p className="text-sm text-red-500">{errors.stock.message}</p>
          )}
        </div>

        {/* Rentable */}
        <div className="flex items-center space-x-2">
          <Switch 
            id="rentable" 
            {...register('rentable')} 
            disabled={isSaving}
          />
          <Label htmlFor="rentable">¿Disponible para renta?</Label>
        </div>

        {/* Imágenes */}
        <div className="space-y-2 md:col-span-2">
          <Label>Imágenes</Label>
          <ImageUploader
            existingImages={existingImages}
            onImagesChange={handleImagesChange}
            onImageDelete={handleImageDelete}
            maxFiles={5}
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descripción detallada del repuesto..."
            rows={4}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditSparePartForm;
