import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUploader from '../molecules/ImageUploader';

/**
 * Componente para crear un nuevo repuesto
 * Maneja el formulario y la lógica de envío de datos
 */
export const CreateSparePartForm = ({
  onSave,
  onCancel,
  isSaving: propIsSaving = false
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      externalId: '',
      code: '',
      name: '',
      description: '',
      material: '',
      price: '0',
      stock: '0',
      rentable: false,
      status: 'ACTIVE',
      files: []
    }
  });

  const [isSaving, setIsSaving] = useState(propIsSaving);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Observar cambios en el valor de rentable
  const rentable = watch('rentable', false);

  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      price: parseFloat(data.price) || 0,
      stock: parseInt(data.stock, 10) || 0,
      rentable: Boolean(data.rentable),
      files: selectedFiles
    };
    
    onSave(formData);
  };

  // Manejar cambios en las imágenes seleccionadas
  const handleImagesChange = (files) => {
    setSelectedFiles(files);
  };

  useEffect(() => {
    setIsSaving(propIsSaving);
  }, [propIsSaving]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Externo */}
        <div className="space-y-2">
          <Label htmlFor="externalId">ID Externo</Label>
          <Input
            id="externalId"
            {...register('externalId')}
            placeholder="Ej: SP-12345"
            disabled={isSaving}
          />
        </div>

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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            {...register('name', { required: 'El nombre es requerido' })}
            placeholder="Ej: Pantalla OLED Galaxy S21"
            disabled={isSaving}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
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

        {/* Material */}
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            {...register('material')}
            placeholder="Ej: Plástico, metal, etc."
            disabled={isSaving}
          />
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

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={register('status').value}
            onValueChange={(value) => register('status').onChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="INACTIVE">Inactivo</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Sin stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Imágenes */}
        <div className="space-y-2 md:col-span-2">
          <Label>Imágenes del repuesto</Label>
          <ImageUploader
            onImagesChange={handleImagesChange}
            maxFiles={5}
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
              Creando...
            </>
          ) : (
            'Crear repuesto'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateSparePartForm;
