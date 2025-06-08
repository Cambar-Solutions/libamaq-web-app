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

/**
 * Componente para crear un nuevo repuesto
 * Maneja el formulario y la lógica de envío de datos
 */
export const CreateSparePartForm = ({
  onSave,
  onCancel,
  isSaving: propIsSaving = false
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
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
    }
  });

  const [isSaving, setIsSaving] = useState(propIsSaving);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const onSubmit = (data) => {
    // Convertir price y stock a número
    const formData = {
      ...data,
      price: parseFloat(data.price) || 0,
      stock: parseInt(data.stock, 10) || 0,
      rentable: Boolean(data.rentable),
      files: files.length > 0 ? files : undefined
    };
    
    onSave(formData);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );

      if (validFiles.length !== e.target.files.length) {
        alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF)');
        return;
      }

      const newPreviewUrls = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setFiles(validFiles);
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleRemoveImage = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setIsSaving(propIsSaving);
  }, [propIsSaving]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Label>Imágenes</Label>
          <div className="flex flex-wrap gap-4">
            {previewUrls.map((item, index) => (
              <div key={index} className="relative group">
                <img
                  src={item.preview}
                  alt={`Vista previa ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar imagen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <label
              htmlFor="file-upload"
              className="h-24 w-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer transition-colors"
            >
              <ImagePlus size={24} />
              <span className="text-xs mt-1">Agregar</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSaving}
              />
            </label>
          </div>
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
