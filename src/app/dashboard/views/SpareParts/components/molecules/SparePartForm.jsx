import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';

export const SparePartForm = ({
  initialData = {},
  onSave,
  onCancel,
  isSaving = false
}) => {
  const [formData, setFormData] = useState({
    id: initialData.id || 0,
    externalId: initialData.externalId || '',
    name: initialData.name || '',
    code: initialData.code || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    stock: initialData.stock || 0,
    material: initialData.material || '',
    variant: initialData.variant || 0,
    status: initialData.status || 'ACTIVE',
    rentable: initialData.rentable || false
  });

  const [previewUrl, setPreviewUrl] = useState(initialData.imageUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Actualizar el estado cuando cambien los datos iniciales
  useEffect(() => {
    console.log('Datos iniciales recibidos en el formulario:', initialData);
    
    if (initialData) {
      // Formatear los datos numéricos para asegurar que sean números
      const formattedData = {
        id: initialData.id || 0,
        externalId: initialData.externalId || '',
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        material: initialData.material || '',
        price: typeof initialData.price === 'number' ? initialData.price : parseFloat(initialData.price) || 0,
        stock: typeof initialData.stock === 'number' ? initialData.stock : parseInt(initialData.stock, 10) || 0,
        variant: typeof initialData.variant === 'number' ? initialData.variant : parseInt(initialData.variant, 10) || 0,
        status: initialData.status || 'ACTIVE',
        rentable: initialData.rentable || false
      };
      
      console.log('Datos formateados para el estado del formulario:', formattedData);
      setFormData(formattedData);
      
      // Manejar la imagen de vista previa
      if (initialData.media && initialData.media.length > 0 && initialData.media[0].url) {
        console.log('URL de la imagen de vista previa:', initialData.media[0].url);
        setPreviewUrl(initialData.media[0].url);
      } else {
        console.log('No se encontró imagen de vista previa');
        setPreviewUrl(null);
      }

          // No se necesita manejar producto seleccionado ni notas de compatibilidad
    } else {
      console.log('No hay datos iniciales, estableciendo valores por defecto');
      setFormData({
        id: 0,
        externalId: '',
        name: '',
        code: '',
        description: '',
        material: '',
        price: 0,
        stock: 0,
        variant: 0,
        status: 'ACTIVE',
        rentable: false
      });
      setPreviewUrl(null);
      // No se necesita limpiar estados de producto seleccionado
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'variant' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe pesar más de 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Crear URL de vista previa
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (typeof onSave !== 'function') {
      const errorMsg = 'Error: La función onSave no está definida en el formulario';
      console.error(errorMsg, { onSave });
      toast.error('Error: No se pudo procesar el guardado');
      return false;
    }

    // Validaciones
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return false;
    }

    if (formData.stock < 0) {
      toast.error('El stock no puede ser negativo');
      return false;
    }

    try {
      // Preparar datos para guardar
      const dataToSave = {
        ...formData,
        // Asegurarse de que los campos numéricos sean números
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        variant: parseInt(formData.variant, 10) || 0,
        // Preparar archivos si los hay
        files: selectedFile ? [selectedFile] : []
      };

      console.log('Enviando datos al guardar:', dataToSave);
      
      // Llamar a la función onSave proporcionada por el componente padre
      const result = await onSave(dataToSave);
      console.log('Resultado del guardado:', result);
      
      // Si el resultado es exitoso, limpiar el archivo seleccionado
      if (result) {
        setSelectedFile(null);
      }
      
      return result;
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      // Mostrar mensaje de error si no hay uno ya
      if (!toast.isActive('form-error')) {
        toast.error(error.message || 'Error al guardar el repuesto', { id: 'form-error' });
      }
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del repuesto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Código interno"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalId">ID Externo</Label>
            <Input
              id="externalId"
              name="externalId"
              value={formData.externalId}
              onChange={handleChange}
              placeholder="ID externo (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="pl-8"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="Ej: Acero inoxidable, plástico, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant">Variante</Label>
            <Input
              id="variant"
              name="variant"
              type="number"
              min="0"
              value={formData.variant}
              onChange={handleChange}
              placeholder="Número de variante"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sección de imagen */}
      <div className="space-y-2">
        <Label>Imagen del repuesto</Label>
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center p-4">
                Sin imagen
              </div>
            )}
          </div>
          <div className="flex-1">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Sección de descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción detallada del repuesto"
          rows={4}
        />
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
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
};
