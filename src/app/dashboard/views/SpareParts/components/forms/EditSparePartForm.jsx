import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Trash2 } from 'lucide-react';

export const EditSparePartForm = ({
  initialData,
  onSave,
  onCancel,
  isSaving = false
}) => {
  const [formData, setFormData] = useState({
    id: 0,
    externalId: '',
    code: '',
    name: '',
    description: '',
    material: '',
    price: 0,
    stock: 0,
    rentable: false,
    status: 'ACTIVE',
    media: []
  });

  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToRemove, setMediaToRemove] = useState([]);

  // Inicializar el formulario con los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || 0,
        externalId: initialData.externalId || '',
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        material: initialData.material || '',
        price: initialData.price || 0,
        stock: initialData.stock || 0,
        rentable: initialData.rentable || false,
        status: initialData.status || 'ACTIVE',
        media: initialData.media || []
      });

      // Configurar las imágenes existentes
      if (initialData.media && initialData.media.length > 0) {
        setExistingMedia(initialData.media);
      }
    }
  }, [initialData]);

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
      preview: URL.createObjectURL(file),
      isNew: true
    }));

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index, isNew, mediaId) => {
    if (isNew) {
      // Eliminar de las imágenes nuevas
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    } else if (mediaId) {
      // Marcar para eliminar del servidor
      setMediaToRemove(prev => [...prev, mediaId]);
      setExistingMedia(prev => prev.filter(item => item.id !== mediaId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar el payload con los datos del formulario
    const payload = {
      ...formData,
      updatedBy: '1', // Esto debería venir del contexto de autenticación
      updatedAt: new Date().toISOString(),
      // Mantener medios existentes que no se van a eliminar
      media: [
        ...existingMedia.filter(item => !mediaToRemove.includes(item.id)),
        // Agregar nuevos medios
        ...previewUrls.filter(item => item.isNew).map((item, index) => ({
          id: 0,
          url: item.preview,
          fileType: 'IMAGE',
          entityType: 'SPARE_PART',
          displayOrder: index
        }))
      ]
    };

    onSave(payload, selectedFiles, mediaToRemove);
  };

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
            {/* Mostrar imágenes existentes */}
            {existingMedia.map((media, index) => (
              <div key={`existing-${media.id}`} className="relative group">
                <img
                  src={media.url}
                  alt={`Imagen ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, false, media.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar imagen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Mostrar vistas previas de nuevas imágenes */}
            {previewUrls.map((item, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={item.preview}
                  alt={`Nueva imagen ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md border border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, true)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar imagen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Input para agregar más imágenes */}
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
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
};

export default EditSparePartForm;
