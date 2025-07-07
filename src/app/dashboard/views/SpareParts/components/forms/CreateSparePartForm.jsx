import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Trash2, FileText, Wand2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUploader from '../molecules/ImageUploader';
import { generateDescriptionIA } from '@/services/admin/AIService';
import mediaService from '@/services/admin/mediaService';

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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  
  // Observar cambios en el valor de rentable
  const rentable = watch('rentable', false);
  const name = watch('name', '');

  // Efecto para manejar la animación de shake
  useEffect(() => {
    if (shouldShake) {
      const timer = setTimeout(() => setShouldShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [shouldShake]);

  // Función para generar descripción con IA
  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      setShowNameError(true);
      setShouldShake(true);
      
      // Hacer scroll al campo de nombre
      const nameInput = document.getElementById('name');
      if (nameInput) {
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInput.focus();
      }
      
      toast.error('¡Ups! Necesitas ingresar un nombre primero', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
          fontWeight: '500',
        },
        icon: '✏️',
        duration: 3000,
      });
      
      return;
    }

    setShowNameError(false);
    setIsGeneratingDescription(true);
    try {
      const description = await generateDescriptionIA(name, 'SPARE_PART');
      setValue('description', description);
      toast.success('¡Descripción generada con éxito!', {
        icon: '✨',
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#065f46',
          background: '#ecfdf5',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error al generar descripción:', error);
      toast.error(error.message || 'Error al generar la descripción', {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
          fontWeight: '500',
        },
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (data) => {
    setIsSaving(true);
    try {
      // 1. Subir imágenes primero
      let media = [];
      if (selectedFiles.length > 0) {
        media = await mediaService.uploadImages(selectedFiles);
      }

      // 2. Crear el repuesto con la media subida
      const formData = {
        ...data,
        price: parseFloat(data.price) || 0,
        stock: parseInt(data.stock, 10) || 0,
        rentable: Boolean(data.rentable),
        media // array de objetos { id, url, fileType }
      };

      await onSave(formData);
    } catch (err) {
      toast.error('Error al crear el repuesto: ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
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
          <div className={`space-y-2 md:col-span-2 transition-all duration-200 ${showNameError ? 'animate-[pulse_0.5s_ease-in-out]' : ''}`}>
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombre *
              </Label>
              {showNameError && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Requerido
                </span>
              )}
            </div>
            <div className={`relative ${shouldShake ? 'animate-[shake_0.6s_ease-in-out]' : ''}`}>
              <Input
                id="name"
                {...register('name', { 
                  required: 'El nombre es requerido',
                  onChange: () => setShowNameError(false)
                })}
                placeholder="Ej: Pantalla OLED Galaxy S21"
                disabled={isSaving}
                className={`h-10 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  showNameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50' : ''
                }`}
              />
              {showNameError && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
            {showNameError && (
              <p className="mt-1 text-sm text-red-600">
                Por favor ingresa un nombre para el repuesto antes de generar una descripción
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription || isSaving}
                className={`text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 transition-all duration-200 ${
                  shouldShake && !name.trim() ? 'animate-[shake_0.6s_ease-in-out]' : ''
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {isGeneratingDescription ? 'Generando...' : 'Generar con IA'}
              </Button>
            </div>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del repuesto..."
              rows={3}
              disabled={isSaving}
              className="focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Escribe manualmente o genera una descripción con IA basada en el nombre del repuesto.
            </p>
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
