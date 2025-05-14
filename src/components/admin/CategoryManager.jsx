import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, X, Check, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory, changeCategoryStatus } from "@/services/admin/categoryService";

/**
 * Componente para gestionar categorías (crear, editar, eliminar)
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.categories - Lista de categorías disponibles
 * @param {Array} props.selectedCategories - IDs de categorías seleccionadas
 * @param {Function} props.onCategoriesChange - Función para actualizar las categorías seleccionadas
 * @param {Function} props.onCategoriesListChange - Función para actualizar la lista completa de categorías
 */
const CategoryManager = ({ 
  categories = [], 
  selectedCategories = [], 
  onCategoriesChange, 
  onCategoriesListChange 
}) => {
  // Estado para el formulario de categoría
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', url: '', description: '', status: 'ACTIVE' });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Resetear formulario
  const resetCategoryForm = () => {
    setCategoryForm({ id: null, name: '', url: '', description: '', status: 'ACTIVE' });
  };

  // Manejar creación de categoría
  const handleCreateCategory = async () => {
    try {
      if (!categoryForm.name) {
        toast.error('El nombre de la categoría es obligatorio');
        return;
      }
      
      setIsSubmitting(true);
      
      // Solo enviar name, url y description para la categoría
      const { name, url, description } = categoryForm;
      const data = await createCategory({ name, url, description });
      
      if (data && data.result && data.result.id) {
        // Actualizar lista de categorías
        const newCategory = data.result;
        const updatedCategories = [...categories, newCategory];
        onCategoriesListChange(updatedCategories);
        
        // Añadir a seleccionadas si estamos creando desde el panel de asignación
        if (isCreatingCategory) {
          onCategoriesChange([...selectedCategories, newCategory.id]);
        }
        
        resetCategoryForm();
        setIsCreatingCategory(false);
        toast.success('Categoría creada correctamente');
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error('Error al crear la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar edición de categoría
  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setCategoryForm({
      id: category.id,
      name: category.name || '',
      url: category.url || '',
      description: category.description || '',
      status: category.status || 'ACTIVE'
    });
    setEditDialogOpen(true);
  };

  // Guardar cambios de categoría
  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name) {
        toast.error('El nombre de la categoría es obligatorio');
        return;
      }
      
      setIsSubmitting(true);
      
      const data = await updateCategory(categoryForm);
      
      if (data && (data.type === 'SUCCESS' || data.result)) {
        // Actualizar la categoría en la lista
        const updatedCategories = categories.map(cat => 
          cat.id === categoryForm.id ? { ...cat, ...categoryForm } : cat
        );
        
        onCategoriesListChange(updatedCategories);
        setEditDialogOpen(false);
        resetCategoryForm();
        toast.success('Categoría actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado de categoría (soft delete)
  const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      setIsSubmitting(true);
      
      // Encontrar la categoría completa en la lista
      const categoryToUpdate = categories.find(cat => cat.id === categoryId);
      
      if (!categoryToUpdate) {
        toast.error('No se encontró la categoría');
        return;
      }
      
      // Crear una copia con el nuevo estado
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const updatedCategory = {
        ...categoryToUpdate,
        status: newStatus
      };
      
      // Usar updateCategory en lugar de changeCategoryStatus para enviar todos los datos
      const data = await updateCategory(updatedCategory);
      
      if (data && (data.type === 'SUCCESS' || data.result)) {
        // Actualizar estado en la lista de categorías
        const updatedCategories = categories.map(cat => 
          cat.id === categoryId ? { ...cat, status: newStatus } : cat
        );
        
        // Si la categoría se desactivó y estaba seleccionada, quitarla de seleccionadas
        if (newStatus === 'INACTIVE' && selectedCategories.includes(categoryId)) {
          onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
        }
        
        onCategoriesListChange(updatedCategories);
        toast.success(`Categoría ${newStatus === 'ACTIVE' ? 'activada' : 'desactivada'} correctamente`);
      }
    } catch (error) {
      console.error('Error al cambiar estado de categoría:', error);
      toast.error('Error al cambiar el estado de la categoría: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón para crear nueva categoría */}
      {!isCreatingCategory ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            resetCategoryForm();
            setIsCreatingCategory(true);
          }}
          className="w-full justify-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" /> Nueva categoría
        </Button>
      ) : (
        <div className="border p-3 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Nueva categoría</h4>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 cursor-pointer"
              onClick={() => {
                resetCategoryForm();
                setIsCreatingCategory(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cat-name" className="mb-1 block text-sm">Nombre *</Label>
              <Input
                id="cat-name"
                name="name"
                placeholder="Nombre de la categoría"
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cat-url" className="mb-1 block text-sm">URL de imagen</Label>
              <Input
                id="cat-url"
                name="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={categoryForm.url}
                onChange={e => setCategoryForm({ ...categoryForm, url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cat-description" className="mb-1 block text-sm">Descripción</Label>
              <Input
                id="cat-description"
                name="description"
                placeholder="Breve descripción..."
                value={categoryForm.description}
                onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={handleCreateCategory}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Crear categoría
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de categorías asignadas */}
      <div>
        <Label className="mb-2 block text-sm">Categorías asignadas:</Label>
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px] bg-gray-50">
          {categories
            .filter(cat => selectedCategories.includes(cat.id))
            .map(cat => (
              <div key={cat.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md select-none">
                <span>{cat.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full hover:bg-blue-200 cursor-pointer"
                  onClick={() => onCategoriesChange(selectedCategories.filter(id => id !== cat.id))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
          ))}
          {selectedCategories.length === 0 && (
            <div className="flex items-center justify-center w-full h-12 text-gray-400">
              No hay categorías asignadas
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de categorías disponibles */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm">Categorías disponibles:</Label>
        </div>
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px] bg-gray-50">
          {categories
            .filter(cat => !selectedCategories.includes(cat.id) && cat.status === 'ACTIVE')
            .map(cat => (
              <div 
                key={cat.id} 
                className={`group flex items-center gap-1 px-2 py-1 rounded-md border transition-all duration-200 ${
                  cat.status === 'ACTIVE' 
                    ? 'bg-white hover:bg-gray-100' 
                    : 'bg-gray-100 text-gray-500 opacity-60'
                }`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (cat.status === 'ACTIVE') {
                      onCategoriesChange([...selectedCategories, cat.id]);
                    } else {
                      toast.error('No se pueden asignar categorías inactivas');
                    }
                  }}
                  className={`p-0 h-auto text-sm font-normal hover:bg-transparent ${
                    cat.status === 'ACTIVE' 
                      ? 'cursor-pointer' 
                      : 'cursor-not-allowed'
                  }`}
                  disabled={cat.status !== 'ACTIVE'}
                >
                  {cat.name}
                </Button>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleEditCategory(cat)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-5 w-5 rounded-full cursor-pointer ${
                      cat.status === 'ACTIVE' 
                        ? 'hover:bg-red-100 hover:text-red-600' 
                        : 'hover:bg-green-100 hover:text-green-600'
                    }`}
                    onClick={() => handleToggleCategoryStatus(cat.id, cat.status)}
                  >
                    {cat.status === 'ACTIVE' ? (
                      <Trash2 className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          {categories.filter(cat => !selectedCategories.includes(cat.id)).length === 0 && (
            <div className="flex items-center justify-center w-full h-12 text-gray-400">
              No hay más categorías disponibles
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo para editar categoría */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Actualiza los detalles de la categoría. Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">Nombre *</Label>
              <Input
                id="edit-cat-name"
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Nombre de la categoría"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cat-url">URL de imagen</Label>
              <Input
                id="edit-cat-url"
                value={categoryForm.url}
                onChange={e => setCategoryForm({ ...categoryForm, url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cat-description">Descripción</Label>
              <Input
                id="edit-cat-description"
                value={categoryForm.description}
                onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Breve descripción..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cat-status">Estado</Label>
              <Select
                value={categoryForm.status}
                onValueChange={value => setCategoryForm({ ...categoryForm, status: value })}
              >
                <SelectTrigger id="edit-cat-status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activa</SelectItem>
                  <SelectItem value="INACTIVE">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
