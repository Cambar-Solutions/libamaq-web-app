import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, Trash2 } from 'lucide-react';

export const SparePartForm = ({
  formData,
  isLoading,
  isUploading,
  uploadedImages,
  onInputChange,
  onNumberInputChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={onInputChange}
            placeholder="Ej: Pantalla OLED Galaxy S21"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            name="code"
            value={formData.code || ''}
            onChange={onInputChange}
            placeholder="Ej: RP-OLED-S21"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalId">ID Externo</Label>
          <Input
            id="externalId"
            name="externalId"
            value={formData.externalId || ''}
            onChange={onInputChange}
            placeholder="ID del proveedor o referencia"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price || ''}
            onChange={onNumberInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock || ''}
            onChange={onNumberInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            name="material"
            value={formData.material || ''}
            onChange={onInputChange}
            placeholder="Ej: Plástico, metal, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <Select
            value={formData.status || 'ACTIVE'}
            onValueChange={(value) =>
              onInputChange({ target: { name: 'status', value } })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="INACTIVE">Inactivo</SelectItem>
              <SelectItem value="DISCONTINUED">Descontinuado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant">Variante</Label>
          <Input
            id="variant"
            name="variant"
            type="number"
            min="0"
            value={formData.variant || 0}
            onChange={onNumberInputChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={onInputChange}
            rows={4}
            placeholder="Descripción detallada del repuesto..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Imágenes</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Imágenes existentes */}
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={`Imagen ${image.id}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Botón para subir nueva imagen */}
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent transition-colors ${isUploading ? 'opacity-50' : ''}`}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 mb-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Agregar imagen</span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2">Guardando...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </>
          ) : isEditing ? (
            'Actualizar repuesto'
          ) : (
            'Crear repuesto'
          )}
        </Button>
      </div>
    </form>
  );
};
