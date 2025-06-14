import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { X, Plus, Upload, Trash2 } from 'lucide-react';

// Componentes reutilizables
import { KeyValueField } from './KeyValueField';
import { ImageUploader } from './ImageUploader';

/**
 * Formulario de edición de producto
 */
const EditProductForm = ({ 
  product, 
  brands = [], 
  categories = [], 
  onSubmit, 
  onCancel, 
  isSaving = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    externalId: '',
    brandId: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    price: '0',
    cost: '0',
    discount: '0',
    stock: '0',
    garanty: '0',
    rentable: false,
    functionalities: [],
    technicalData: [],
    downloads: [],
    media: []
  });
  const [files, setFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);

  // Efecto para cargar los datos del producto cuando se monta o cambia
  useEffect(() => {
    if (product) {
      // Formatear los datos del producto para el formulario
      setFormData({
        name: product.name || '',
        externalId: product.externalId || '',
        brandId: product.brandId ? product.brandId.toString() : '',
        categoryId: product.categoryId ? product.categoryId.toString() : '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price?.toString() || '0',
        cost: product.cost?.toString() || '0',
        discount: product.discount?.toString() || '0',
        stock: product.stock?.toString() || '0',
        garanty: product.garanty?.toString() || '0',
        rentable: Boolean(product.rentable),
        functionalities: Array.isArray(product.functionalities) 
          ? [...product.functionalities] 
          : [],
        technicalData: Array.isArray(product.technicalData) 
          ? product.technicalData.map(item => ({
              key: item.key || '',
              value: item.value || ''
            }))
          : [],
        downloads: Array.isArray(product.downloads) 
          ? product.downloads.map(item => ({
              key: item.key || '',
              value: item.value || ''
            }))
          : []
      });

      // Separar medios existentes de nuevos archivos
      setExistingMedia(Array.isArray(product.media) ? [...product.media] : []);
      setRemovedMediaIds([]);
      setFiles([]);
    }
  }, [product]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar cambios en los campos de tipo número
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Solo permitir números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar cambios en los campos de par clave-valor
  const handleKeyValueChange = (field, index, key, value) => {
    const newItems = [...formData[field]];
    newItems[index] = { ...newItems[index], [key]: value };
    setFormData(prev => ({
      ...prev,
      [field]: newItems
    }));
  };

  // Agregar un nuevo elemento a un campo de par clave-valor
  const handleAddKeyValue = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], item]
    }));
  };

  // Eliminar un elemento de un campo de par clave-valor
  const handleRemoveKeyValue = (field, index) => {
    const newItems = [...formData[field]];
    newItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [field]: newItems
    }));
  };

  // Manejar eliminación de imágenes existentes
  const handleRemoveExistingMedia = (index) => {
    const mediaToRemove = existingMedia[index];
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
    
    // Si el medio tiene ID, agregarlo a la lista de IDs a eliminar
    if (mediaToRemove?.id) {
      setRemovedMediaIds(prev => [...prev, mediaToRemove.id]);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    
    if (!formData.brandId) {
      toast.error('Debes seleccionar una marca');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('Debes seleccionar una categoría');
      return;
    }
    
    try {
      // Preparar los datos para enviar
      const productData = {
        ...formData,
        brandId: Number(formData.brandId),
        categoryId: Number(formData.categoryId),
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        garanty: parseInt(formData.garanty, 10) || 0,
        rentable: Boolean(formData.rentable),
        // Filtrar elementos vacíos de arrays
        functionalities: formData.functionalities.filter(f => f.trim() !== ''),
        technicalData: formData.technicalData.filter(item => item.key.trim() !== '' && item.value.trim() !== ''),
        downloads: formData.downloads.filter(item => item.key.trim() !== '' && item.value.trim() !== ''),
        // IDs de medios existentes que no se eliminaron
        existingMediaIds: existingMedia.map(m => m.id).filter(Boolean),
        removedMediaIds
      };

      // Llamar a la función onSubmit del padre
      await onSubmit(productData, files);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      // El error ya se muestra en el hook useProducts
    }
  };

  // Si no hay producto, mostrar mensaje de carga
  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando datos del producto...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre y ID externo */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del producto *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Bomba hidráulica XYZ-2000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalId">ID Externo</Label>
          <Input
            id="externalId"
            name="externalId"
            value={formData.externalId}
            onChange={handleChange}
            placeholder="Ej: PROD-001"
          />
        </div>

        {/* Marca y Categoría */}
        <div className="space-y-2">
          <Label htmlFor="brandId">Marca *</Label>
          <Select 
            value={formData.brandId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría *</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Precio, Costo y Descuento */}
        <div className="space-y-2">
          <Label htmlFor="price">Precio de venta *</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="decimal"
              value={formData.price}
              onChange={handleNumberChange}
              className="pl-8"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Costo</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
            <Input
              id="cost"
              name="cost"
              type="text"
              inputMode="decimal"
              value={formData.cost}
              onChange={handleNumberChange}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Descuento (%)</Label>
          <Input
            id="discount"
            name="discount"
            type="text"
            inputMode="decimal"
            value={formData.discount}
            onChange={handleNumberChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock disponible</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="garanty">Garantía (meses)</Label>
          <Input
            id="garanty"
            name="garanty"
            type="number"
            min="0"
            value={formData.garanty}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="rentable" 
            checked={formData.rentable} 
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rentable: checked }))}
          />
          <Label htmlFor="rentable">Disponible para alquiler</Label>
        </div>
      </div>

      {/* Descripciones */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Descripción corta</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Una breve descripción que se mostrará en listados y tarjetas"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción detallada</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el producto con todo detalle, características principales, usos, etc."
            rows={4}
          />
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="space-y-4">
        <Label>Funcionalidades</Label>
        <div className="space-y-2">
          {formData.functionalities.map((func, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                value={func} 
                onChange={(e) => {
                  const newFuncs = [...formData.functionalities];
                  newFuncs[index] = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    functionalities: newFuncs
                  }));
                }} 
                placeholder="Nueva funcionalidad"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  const newFuncs = formData.functionalities.filter((_, i) => i !== index);
                  setFormData(prev => ({
                    ...prev,
                    functionalities: newFuncs
                  }));
                }}
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                functionalities: [...prev.functionalities, '']
              }));
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar funcionalidad
          </Button>
        </div>
      </div>

      {/* Datos técnicos */}
      <KeyValueField
        label="Datos Técnicos"
        keyName="Especificación"
        valueName="Valor"
        items={formData.technicalData}
        onChange={(index, key, value) => handleKeyValueChange('technicalData', index, key, value)}
        onAdd={(item) => handleAddKeyValue('technicalData', item)}
        onRemove={(index) => handleRemoveKeyValue('technicalData', index)}
      />

      {/* Descargas */}
      <KeyValueField
        label="Descargas"
        keyName="Título"
        valueName="URL"
        items={formData.downloads}
        onChange={(index, key, value) => handleKeyValueChange('downloads', index, key, value)}
        onAdd={(item) => handleAddKeyValue('downloads', item)}
        onRemove={(index) => handleRemoveKeyValue('downloads', index)}
      />

      {/* Cargador de imágenes */}
      <div className="space-y-4">
        <Label>Imágenes del producto</Label>
        
        {/* Imágenes existentes */}
        {existingMedia.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Imágenes existentes</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingMedia.map((media, index) => (
                <div key={`existing-${media.id || index}`} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden border">
                    <img 
                      src={media.url} 
                      alt={media.name || `Imagen ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveExistingMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nuevas imágenes */}
        <ImageUploader 
          files={files}
          onAdd={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
          onRemove={(index) => setFiles(prev => prev.filter((_, i) => i !== index))}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
        >
          {isSaving ? 'Guardando...' : 'Actualizar producto'}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
