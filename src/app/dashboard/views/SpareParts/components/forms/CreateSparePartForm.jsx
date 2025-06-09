import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Trash2, FileText } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Título de la sección */}
      <div className="border-b pb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Repuesto</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Completa la información del repuesto. Los campos marcados con * son obligatorios.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID Externo */}
          <div className="space-y-2">
            <Label htmlFor="externalId" className="text-sm font-medium text-gray-700">ID Externo</Label>
            <Input
              id="externalId"
              {...register('externalId')}
              placeholder="Ej: SP-12345"
              disabled={isSaving}
              className="h-10 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-700">Código *</Label>
            <Input
              id="code"
              {...register('code', { required: 'El código es requerido' })}
              placeholder="Ej: RP-001"
              disabled={isSaving}
              className="h-10 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre *</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Ej: Pantalla OLED Galaxy S21"
              disabled={isSaving}
              className="h-10 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del repuesto..."
              rows={3}
              disabled={isSaving}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Material */}
          <div className="space-y-2">
            <Label htmlFor="material" className="text-sm font-medium text-gray-700">Material</Label>
            <Input
              id="material"
              {...register('material')}
              placeholder="Ej: Plástico, metal, etc."
              disabled={isSaving}
              className="h-10 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">Precio (MXN) *</Label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
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
                className="h-10 pl-7 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              {...register('stock', { 
                required: 'El stock es requerido',
                min: { value: 0, message: 'El stock debe ser mayor o igual a 0' },
                valueAsNumber: true
              })}
              placeholder="0"
              disabled={isSaving}
              className="h-10 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>

          {/* Rentable */}
          <div className="flex items-center space-x-3 pt-2">
            <Switch 
              id="rentable" 
              checked={rentable}
              onCheckedChange={(checked) => setValue('rentable', checked)}
              disabled={isSaving}
              className={`${rentable ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
            <div className="flex flex-col">
              <Label htmlFor="rentable" className="text-sm font-medium text-gray-700">
                ¿Disponible para renta?
              </Label>
              <span className="text-xs text-gray-500">
                {rentable ? 'El repuesto estará disponible para renta' : 'El repuesto no estará disponible para renta'}
              </span>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
            <Select
              value={watch('status') || 'ACTIVE'}
              onValueChange={(value) => setValue('status', value)}
              disabled={isSaving}
            >
              <SelectTrigger className="h-10 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    <span>Activo</span>
                  </div>
                </SelectItem>
                <SelectItem value="INACTIVE">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    <span>Inactivo</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Imágenes */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700">Imágenes del repuesto</Label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <ImageUploader
                onImagesChange={handleImagesChange}
                maxFiles={5}
                disabled={isSaving}
                className="w-full"
              />
              <p className="mt-2 text-xs text-gray-500">
                Sube hasta 5 imágenes del repuesto. Formatos soportados: JPG, PNG, WEBP.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSaving ? 'Guardando...' : 'Guardar Repuesto'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSparePartForm;
