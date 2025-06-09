import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Loader2, Tag, Box, DollarSign, Hash, Info, AlertCircle, Type,
  PackageCheck, PackageSearch, PackagePlus, FileText, Image as ImageIcon
} from 'lucide-react';
import ImageUploader from '../molecules/ImageUploader';

const statusStyles = {
  ACTIVE: 'text-green-600',
  INACTIVE: 'text-red-600',
};

const statusIcons = {
  ACTIVE: (
    <span className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
      <span className="text-foreground">Activo</span>
    </span>
  ),
  INACTIVE: (
    <span className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
      <span className="text-foreground">Inactivo</span>
    </span>
  ),
};

const FormField = ({ label, name, icon: Icon, error, children, tooltip }) => (
  <div className="space-y-1.5">
    <Label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="h-4 w-4 text-blue-600" />
      {label}
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600 transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-800 text-white text-xs">
              <p className="max-w-[200px]">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Label>
    {children}
    {error && (
      <p className="flex items-center text-xs text-red-600 mt-1">
        <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
        {error}
      </p>
    )}
  </div>
);

export const EditSparePartForm = ({ sparePart, onSave, onCancel, isSaving }) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      ...sparePart,
      rentable: sparePart?.rentable || false,
      price: sparePart?.price?.toString() || '0',
      stock: sparePart?.stock?.toString() || '0',
      externalId: sparePart?.externalId || '',
      material: sparePart?.material || '',
      status: sparePart?.status || 'ACTIVE',
    }
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  useEffect(() => {
    if (sparePart) {
      reset({
        ...sparePart,
        rentable: sparePart.rentable === true || sparePart.rentable === 'true',
        price: sparePart.price?.toString() || '0',
        stock: sparePart.stock?.toString() || '0',
        externalId: sparePart.externalId || '',
        material: sparePart.material || '',
        status: sparePart.status || 'ACTIVE',
      });
      setSelectedFiles([]);
      setMediaToDelete([]);
    }
  }, [sparePart, reset]);

  const onSubmit = (data) => {
    if (!sparePart?.id) return;
    const formData = {
      ...data,
      price: parseFloat(data.price) || 0,
      stock: parseInt(data.stock, 10) || 0,
      rentable: Boolean(data.rentable),
      media: (sparePart.media || []).map(media => ({
        id: Number(media.id),
        url: media.url,
        fileType: media.fileType || 'IMAGE',
        entityType: 'SPARE_PART',
        displayOrder: Number(media.displayOrder) || 0
      }))
    };
    onSave(formData, selectedFiles, mediaToDelete);
  };

  const existingImages = (sparePart?.media || []).filter(
    img => !mediaToDelete.includes(img.id)
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Información del Repuesto
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Edita la información del repuesto. Los campos con * son obligatorios.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="ID Externo" name="externalId" icon={Tag} error={errors.externalId?.message} tooltip="Identificador externo del repuesto">
            <Input 
              id="externalId" 
              {...register('externalId')} 
              placeholder="Ej: SP-12345" 
              disabled={isSaving} 
              className="h-10 text-sm max-w-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </FormField>

          <FormField label="Código *" name="code" icon={Hash} error={errors.code?.message}>
            <Input 
              id="code" 
              {...register('code', { required: 'El código es requerido' })} 
              placeholder="Ej: RP-001" 
              disabled={isSaving} 
              className="h-10 text-sm max-w-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </FormField>

          <FormField label="Nombre *" name="name" icon={Type} error={errors.name?.message}>
            <Input 
              id="name" 
              {...register('name', { required: 'El nombre es requerido' })} 
              placeholder="Ej: Pantalla OLED" 
              disabled={isSaving} 
              className="h-10 text-sm max-w-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </FormField>

          <FormField label="Material" name="material" icon={Box} error={errors.material?.message} tooltip="Material principal del repuesto">
            <Input 
              id="material" 
              {...register('material')} 
              placeholder="Ej: Acero, Plástico" 
              disabled={isSaving} 
              className="h-10 text-sm max-w-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </FormField>

          <FormField label="Precio (MXN) *" name="price" icon={DollarSign} error={errors.price?.message}>
            <div className="relative max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                min="0" 
                {...register('price', { required: 'El precio es requerido' })} 
                placeholder="0.00" 
                disabled={isSaving} 
                className="h-10 pl-7 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
              />
            </div>
          </FormField>

          <FormField label="Stock *" name="stock" icon={PackageCheck} error={errors.stock?.message}>
            <Input 
              id="stock" 
              type="number" 
              min="0" 
              {...register('stock', { required: 'El stock es requerido' })} 
              placeholder="0" 
              disabled={isSaving} 
              className="h-10 text-sm max-w-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </FormField>

          <FormField label="Estado" name="status" icon={PackageSearch} error={errors.status?.message}>
            <Select onValueChange={(value) => setValue('status', value, { shouldValidate: true })} value={watch('status')} disabled={isSaving}>
              <SelectTrigger className="h-10 px-3 text-sm border-gray-300 bg-white max-w-md hover:border-blue-500 transition-colors">
                <SelectValue>
                  {statusIcons[watch('status')]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-gray-200">
                <SelectItem value="ACTIVE" className="focus:bg-blue-50">
                  {statusIcons.ACTIVE}
                </SelectItem>
                <SelectItem value="INACTIVE" className="focus:bg-blue-50">
                  {statusIcons.INACTIVE}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Descripción" name="description" icon={FileText} error={errors.description?.message}>
          <Textarea 
            id="description" 
            {...register('description')} 
            placeholder="Descripción del repuesto..." 
            rows={3} 
            disabled={isSaving} 
            className="text-sm max-w-2xl border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
          />
        </FormField>

        <div className="pt-1">
          <FormField label="¿Disponible para renta?" name="rentable" icon={PackagePlus}>
            <div className="flex items-center gap-3">
              <Switch 
                id="rentable" 
                checked={watch('rentable')} 
                onCheckedChange={(checked) => setValue('rentable', checked)} 
                disabled={isSaving} 
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm text-gray-700">
                {watch('rentable') ? 'Sí, disponible para renta' : 'No disponible para renta'}
              </span>
            </div>
          </FormField>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ImageIcon className="h-5 w-5 text-blue-600" /> Imágenes del Producto
          </Label>
          <p className="text-xs text-gray-500">Sube hasta 5 imágenes del repuesto</p>
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <ImageUploader
              existingImages={existingImages}
              onImagesChange={setSelectedFiles}
              onImageDelete={(id) => setMediaToDelete(prev => [...prev, id])}
              maxFiles={5}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isSaving}
            className="h-10 px-6 text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSparePartForm;