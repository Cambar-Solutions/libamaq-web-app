import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  changeCategoryStatus,
  deleteCategory
} from "@/services/admin/categoryService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Edit, Trash2, Plus, Check, X, RefreshCcw, Tag, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUploadToCloudflare } from '@/hooks/useCloudflare';
import React from "react";

export function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    status: "ACTIVE"
  });

  const uploadToCloudflareMutation = useUploadToCloudflare();

  // Cargar categorías al inicio
  useEffect(() => {
    fetchCategories();
  }, []);

  // Función para cargar categorías
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCategories();
      console.log('Respuesta de categorías:', response);
      
      // Extraer los datos de la respuesta
      const categoriesData = response?.data || [];
      
      // Asegurar que sean arrays válidos
      const validCategories = Array.isArray(categoriesData) 
        ? categoriesData.filter(cat => cat && cat.id) 
        : [];
      
      setCategories(validCategories);
      setFilteredCategories(validCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar categorías cuando cambia el término de búsqueda
  useEffect(() => {
    if (!categories) return;
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => {
        const name = category.name || category.description || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
      });
      setFilteredCategories(filtered);
    }
  }, [categories, searchTerm]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Preparar formulario para crear nueva categoría
  const handleNewCategory = () => {
    setFormData({
      name: "",
      description: "",
      url: "",
      status: "ACTIVE"
    });
    setIsEditing(false);
    setCurrentCategory(null);
  };

  // Preparar formulario para editar categoría existente
  const handleEditCategory = (category) => {
    console.log('Editando categoría:', category);
    const displayName = category.name || category.description || "";
    setFormData({
      id: category.id,
      name: displayName,
      description: category.description || "",
      url: category.url || "",
      status: category.status || "ACTIVE"
    });
    setIsEditing(true);
    setCurrentCategory(category);
  };

  // Guardar categoría (crear o actualizar)
  const handleSaveCategory = async () => {
    try {
      // Validar campos requeridos
      if (!formData.name) {
        toast.error("El nombre de la categoría es obligatorio");
        return;
      }

      setIsSubmitting(true);

      if (isEditing) {
        // Actualizar categoría existente
        await updateCategory(formData);
        toast.success("Categoría actualizada correctamente");
      } else {
        // Crear nueva categoría
        await createCategory(formData);
        toast.success("Categoría creada correctamente");
      }

      // Recargar categorías
      await fetchCategories();
      
      // Resetear formulario
      setFormData({
        name: "",
        description: "",
        url: "",
        status: "ACTIVE"
      });
      setCurrentCategory(null);
      setIsEditing(false);
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      toast.error(`Error al guardar categoría: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado de categoría (activar/desactivar)
  const handleChangeCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await changeCategoryStatus(categoryId, currentStatus);
      toast.success(`Categoría ${currentStatus === "ACTIVE" ? "desactivada" : "activada"} correctamente`);
      await fetchCategories();
    } catch (error) {
      console.error("Error al cambiar estado de categoría:", error);
      toast.error(`Error al cambiar estado: ${error.message || 'Error desconocido'}`);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteCategory(categoryToDelete.id);
      toast.success("Categoría eliminada correctamente");
      await fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast.error("Error al eliminar la categoría: " + (error?.message || error));
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Renderizar tarjeta de categoría
  const renderCategoryCard = (category) => {
    const isActive = category.status === "ACTIVE";
    const displayName = category.name || category.description || "Sin nombre";

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`overflow-hidden ${!isActive ? 'opacity-60' : ''} h-full flex flex-col`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold truncate">{displayName}</h3>
              <div className="flex items-center gap-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-900'
                  }`}
                >
                  {isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md mt-2">
                {category.url ? (
                  <img
                    src={category.url}
                    alt={displayName}
                    className="max-h-28 max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-logo.png";
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center gap-2">
                    <Tag className="h-8 w-8" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 text-center line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </CardHeader>
          <div className="mt-auto border-t px-4 py-2 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  ID: {category.id}
                </span>
              </div>
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:bg-gray-200"
                        onClick={() => {
                          handleEditCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                      <p>Editar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {isActive ? (
                  <Sheet>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-600 hover:bg-gray-200"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                          <p>Desactivar</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>
                          ¿Desactivar categoría?
                        </SheetTitle>
                        <SheetDescription>
                          Esta acción desactivará la categoría. Los productos asociados seguirán existiendo pero la categoría no aparecerá en listados públicos.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-8">
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button variant="outline">Cancelar</Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button
                              onClick={() => {
                                handleChangeCategoryStatus(category.id, category.status);
                              }}
                            >
                              Desactivar
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-gray-200 bg-transparent border-none"
                            onClick={() => handleChangeCategoryStatus(category.id, category.status)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                          Activar
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2 h-8 w-8 flex items-center gap-1 text-white bg-red-600 hover:bg-red-800 px-3 py-1"
                            onClick={() => { 
                              setCategoryToDelete(category); 
                              setDeleteDialogOpen(true); 
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                          Eliminar definitivamente
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 mt-3">
      {/* Título */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Categorías</h2>
      </div>

      {/* Cabecera con controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={fetchCategories}
            title="Recargar categorías"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              onClick={handleNewCategory}
            >
              + Nueva categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader className="pb-4 border-b sticky top-0 bg-white z-10">
              <DialogTitle className="text-xl font-bold text-blue-800">
                {isEditing ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {isEditing
                  ? "Actualiza los detalles de la categoría. Haz clic en guardar cuando termines."
                  : "Completa el formulario para crear una nueva categoría."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-6 py-6 overflow-y-auto pr-2">
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Información básica</h3>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="font-medium">
                      Nombre de la categoría *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ej: Taladros, Amoladoras, Sierras"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="category-image-url" className="font-medium">
                      Imagen de la categoría
                    </Label>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Ingresa la URL de la imagen de la categoría:</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <Input
                          id="category-image-url"
                          name="url"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          value={formData.url}
                          onChange={handleInputChange}
                          onFocus={e => e.currentTarget.select()}
                          className="inline-block w-[calc(100%-120px)] mr-2"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="inline-block align-middle"
                          onClick={() => window._categoryCloudflareInput && window._categoryCloudflareInput.click()}
                        >
                          Subir archivo
                        </Button>
                        {formData.url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData(prev => ({ ...prev, url: "" }))}
                            title="Limpiar imagen"
                          >
                            <span aria-label="Limpiar">✕</span>
                          </Button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={el => (window._categoryCloudflareInput = el)}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            const res = await uploadToCloudflareMutation.mutateAsync(file);
                            const url = res?.data?.[0]?.url;
                            if (url) {
                              setFormData(prev => ({ ...prev, url }));
                              toast.success('Imagen subida correctamente');
                            } else {
                              toast.error('Error al subir la imagen');
                            }
                          } catch (err) {
                            toast.error('Error al subir la imagen: ' + (err.message || err));
                          }
                        }}
                      />
                      {formData.url && (
                        <div className="mt-2 p-2 border rounded flex justify-center bg-gray-50">
                          <img
                            src={formData.url}
                            alt="Vista previa"
                            className="max-h-20 object-contain"
                            onError={e => {
                              e.target.src = "/placeholder-logo.png";
                              e.target.onerror = null;
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description" className="font-medium">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe brevemente esta categoría..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="border-t pt-4 mt-4 flex gap-2 sticky bottom-0 bg-white z-10">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="gap-1">
                  <X className="h-4 w-4" /> Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={handleSaveCategory}
                disabled={isSubmitting}
                className="gap-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : isEditing ? (
                  <>
                    <Check className="h-4 w-4" /> Guardar cambios
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Crear categoría
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Tag className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay categorías</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mt-2">
            {searchTerm
              ? "No se encontraron categorías con los filtros aplicados."
              : "No hay categorías creadas aún. Crea una nueva categoría para comenzar."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map(renderCategoryCard)}
        </div>
      )}

      {/* Alert Dialog para eliminar categoría */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría "{categoryToDelete?.name || categoryToDelete?.description}" de forma permanente. ¿Estás seguro de que deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}