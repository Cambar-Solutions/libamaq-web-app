import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  const [isSaving, setIsSaving] = useState(propIsSaving);
  // Estado inicial del formulario con los campos requeridos por la API
  const [formData, setFormData] = useState({
    externalId: '',        // ID externo del repuesto
    code: '',              // Código interno
    name: '',              // Nombre del repuesto
    description: '',        // Descripción detallada
    material: '',           // Material del repuesto
    price: 0,              // Precio unitario
    stock: 0,              // Cantidad en inventario
    rentable: false,       // Si está disponible para renta
    status: 'ACTIVE',      // Estado por defecto
    media: []              // Array para medios (imágenes)
  });

  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar tipos de archivo (solo imágenes)
    const validFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (validFiles.length !== files.length) {
      alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF)');
      return;
    }

    // Generar URLs de vista previa
    const newPreviewUrls = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.externalId || !formData.code || !formData.name) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    
    // Validar que al menos haya una imagen si es requerido
    if (selectedFiles.length === 0) {
      toast.error('Por favor agregue al menos una imagen del repuesto');
      return;
    }

    try {
      setIsSaving(true);
      
      // 1. Primero subir las imágenes
      const { uploadMedia } = await import('@/services/admin/mediaService');
      
      console.log('Subiendo archivos...');
      const uploadResponse = await uploadMedia(selectedFiles.map(file => file.file));
      console.log('Respuesta de subida de archivos:', uploadResponse);
      
      if (!uploadResponse || !uploadResponse.data || uploadResponse.data.length === 0) {
        throw new Error('No se pudieron subir las imágenes');
      }
      
      const uploadedFiles = Array.isArray(uploadResponse.data) ? uploadResponse.data : [uploadResponse.data];
      
      // 2. Preparar el payload del repuesto con las URLs de las imágenes subidas
      const payload = {
        createdBy: '1', // TODO: Obtener del contexto de autenticación
        createdAt: new Date().toISOString(),
        externalId: formData.externalId.trim(),
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        material: formData.material.trim(),
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        rentable: Boolean(formData.rentable),
        status: formData.status,
        // Incluir las imágenes ya subidas con sus URLs de Cloudflare
        media: uploadedFiles.map((file, index) => ({
          id: file.id,
          url: file.url, // URL de Cloudflare
          fileType: 'IMAGE',
          entityId: 0, // Se actualizará con el ID del repuesto
          entityType: 'SPARE_PART',
          displayOrder: index,
          status: 'ACTIVE'
        }))
      };

      console.log('Enviando datos del repuesto al servidor:', {
        ...payload,
        media: `Array(${payload.media.length} imágenes)`
      });
      
      // 3. Llamar a la función onSave con los datos del formulario
      const result = await onSave(payload);
      
      return result;
    } catch (error) {
      console.error('Error al guardar el repuesto:', error);
      toast.error(`Error al guardar el repuesto: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Sincronizar el estado de carga con la prop
  useEffect(() => {
    setIsSaving(propIsSaving);
  }, [propIsSaving]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Externo */}
        <div className="space-y-2">
          <Label htmlFor="externalId">ID Externo</Label>
          <Input
            id="externalId"
            name="externalId"
            value={formData.externalId}
            onChange={handleInputChange}
            placeholder="Ej: SP-12345"
            required
          />
        </div>

        {/* Código */}
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="Ej: RP-ABC-123"
            required
          />
        </div>

        {/* Nombre */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Pantalla OLED Galaxy S21"
            required
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Descripción detallada del repuesto..."
          />
        </div>

        {/* Material */}
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            name="material"
            value={formData.material}
            onChange={handleInputChange}
            placeholder="Ej: Vidrio, plástico y componentes electrónicos"
          />
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleNumberInputChange}
            placeholder="0.00"
            required
          />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleNumberInputChange}
            placeholder="0"
            required
          />
        </div>

        {/* Rentable */}
        <div className="space-y-2 flex items-center gap-4">
          <Label htmlFor="rentable" className="flex items-center gap-2">
            <Switch
              id="rentable"
              checked={formData.rentable}
              onCheckedChange={(checked) => handleSwitchChange('rentable', checked)}
            />
            <span>¿Es rentable?</span>
          </Label>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? 'Creando...' : 'Crear repuesto'}
        </Button>
      </div>
    </form>
  );
};

export default CreateSparePartForm;
