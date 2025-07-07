import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { updateCategory, deleteCategory } from '@/services/admin/categoryService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Función auxiliar para determinar si un color es claro
const isLightColor = (color) => {
  // Eliminar el # si está presente
  const hex = color.replace('#', '');
  // Convertir a RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calcular luminosidad
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

export const CategoryBadge = ({
  category,
  brandColor,
  isAssigned = false,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  assignedBrand = null
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    url: category.url || '',
    status: category.status || 'ACTIVE'
  });

  // Determinar color de fondo
  let bgColor;
  if (isAssigned) {
    // Si está asignada a la marca actual, usa el color de la marca actual
    bgColor = brandColor || '#f3f4f6';
  } else if (assignedBrand && assignedBrand.color) {
    // Si está asignada a otra marca, usa el color de esa marca
    bgColor = assignedBrand.color;
  } else {
    // Si no está asignada a ninguna marca, usa gris
    bgColor = '#e5e7eb';
  }
  const textColor = isLightColor(bgColor) ? '#000000' : bgColor;
  const borderColor = isAssigned || assignedBrand ? `${bgColor}40` : '#e5e7eb';
  const opacity = isAssigned ? 'opacity-100' : 'opacity-100';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await updateCategory({
        id: category.id,
        ...formData,
        updatedBy: '1' // ID del usuario actual
      });

      toast.success(`La categoría ${formData.name} ha sido actualizada correctamente.`);

      if (onEdit) {
        onEdit({ ...category, ...formData });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      toast.error(error.message || "No se pudo actualizar la categoría");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    

    setIsLoading(true);
    try {
      await deleteCategory(category.id);

      toast.success(`La categoría ${category.name} ha sido eliminada correctamente.`);

      if (onDelete) {
        onDelete(category.id);
      }
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      toast.error(error.message || "No se pudo eliminar la categoría");
    } finally {
      setIsLoading(false);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${opacity} ${
        isAssigned ? 'hover:opacity-100' : ''
      }`}
      style={{
        backgroundColor: `${bgColor}20`,
        color: textColor,
        border: `1px solid ${borderColor}`,
        maxWidth: 'none',
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'unset',
        wordBreak: 'break-word',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <span style={{flex: 1, minWidth: 0}} onClick={onClick}>
        {category.name}
        {assignedBrand && (
          <span className="ml-1 text-xs">({assignedBrand.name})</span>
        )}
      </span>
      {showActions && (
        <div className="flex space-x-1 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0.5 rounded-full bg-white shadow-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-3 w-3 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                Editar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Categoría</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL de la imagen
                  </Label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !formData.name.trim()}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0.5 rounded-full bg-white shadow-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleting(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                Eliminar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>¿Estás seguro de que deseas eliminar la categoría <strong>{category.name}</strong>?</p>
                <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleting(false);
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CategoryBadge;
