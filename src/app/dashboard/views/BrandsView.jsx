import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  useAllBrands,
  useActiveBrands,
  useCreateBrand,
  useUpdateBrand,
  useChangeBrandStatus
} from "@/hooks/useBrands";
import { getAllCategories, createCategory } from "@/services/admin/categoryService";
import { deleteBrand } from "@/services/admin/brandService";
import CategoryManager from "@/components/admin/CategoryManager";
import CategoryBadge from '@/components/admin/CategoryBadge';
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
import { motion } from "framer-motion";
import { Edit, Trash2, Plus, Check, X, RefreshCcw, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { uploadLandingFile } from "@/services/admin/landingService";
import { useRef } from "react";
import { useUploadToCloudflare } from '@/hooks/useCloudflare';

function isLightColor(hexColor) {
  const hex = hexColor?.replace("#", "") || "ffffff";
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186;
}

export function BrandsView() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    color: "#000000",
    description: "",
    status: "ACTIVE",
    categories: [] // IDs de categorías seleccionadas
  });
  const [categories, setCategories] = useState([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    url: '',
    status: 'ACTIVE'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  // Las variables de estado para la gestión de categorías ahora están en el componente CategoryManager

  // Estado para imagen de marca
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef(null);

  // Handler para cambio de archivo
  const handleBrandImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Previsualización temporal
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, url: objectUrl }));
    }
  };

  // Handler para subir archivo
  const handleBrandImageUpload = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    toast.success('Imagen subida correctamente');
    try {
      const uploadResponse = await uploadLandingFile(imageFile);
      const fileUrl = uploadResponse.url;
      if (fileUrl) {
        setFormData(prev => ({ ...prev, url: fileUrl }));
        return fileUrl;
      }
    } catch (err) {
      toast.error("Error al subir la imagen: " + (err.message || err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Obtener marcas usando Tanstack Query
  const { data: allBrandsData, isLoading: isLoadingAllBrands } = useAllBrands();
  const { data: activeBrandsData, isLoading: isLoadingActiveBrands } = useActiveBrands();

  // Mutaciones para crear, actualizar y cambiar estado
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const changeBrandStatusMutation = useChangeBrandStatus();
  const uploadToCloudflareMutation = useUploadToCloudflare();

  // Cliente de consulta para invalidar consultas y forzar recargas
  const queryClient = useQueryClient();

  // Obtener todas las categorías (no solo activas)
  const fetchCategories = async () => {
    try {
      console.log('Obteniendo todas las categorías...');
      const response = await getAllCategories();
      console.log('Respuesta de categorías:', response);

      // Extraer los datos de la respuesta según su estructura
      const cats = Array.isArray(response)
        ? response
        : (response.data || response.result || []);

      console.log('Categorías procesadas:', cats);
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error("Error al cargar categorías");
    }
  };

  // Procesar datos de marcas cuando se cargan
  useEffect(() => {
    if (allBrandsData) {
      const brandsData = Array.isArray(allBrandsData)
        ? allBrandsData
        : (allBrandsData.data || []);

      const processedBrands = brandsData.map(brand => ({
        id: brand.id,
        name: brand.name,
        description: brand.description || "",
        url: brand.url || "",
        color: brand.color || "#000000",
        status: brand.status || "ACTIVE",
        categories: brand.brandCategories
          ? brand.brandCategories.map(bc => Number(bc.categoryId))
          : [],
        brandCategories: brand.brandCategories || []
      }));

      setBrands(processedBrands);
      setFilteredBrands(processedBrands); // Mostrar todas las marcas por defecto
    }
  }, [allBrandsData]);

  // Filtrar marcas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!brands) return;
    if (searchTerm.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  // Configurar el estado de carga
  useEffect(() => {
    setIsLoading(isLoadingAllBrands || isLoadingActiveBrands);
  }, [isLoadingAllBrands, isLoadingActiveBrands]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Preparar formulario para crear nueva marca
  const handleNewBrand = () => {
    setFormData({
      name: "",
      url: "",
      color: "#000000",
      description: "",
      status: "ACTIVE",
      categories: []
    });
    setIsEditing(false);
    setCurrentBrand(null);
    fetchCategories();
  };

  // Preparar formulario para editar marca existente
  const handleEditBrand = async (brand) => {
    setCurrentBrand(brand);
    setIsEditing(true);

    // Obtener IDs de categorías asignadas a la marca
    const assignedCategoryIds = Array.isArray(brand.brandCategories)
      ? brand.brandCategories.map(bc => Number(bc.categoryId))
      : [];

    // Cargar categorías activas primero
    await fetchCategories();

    // Después de cargar las categorías, actualizar el formData
    setFormData(prev => ({
      ...prev,
      id: brand.id,
      name: brand.name,
      description: brand.description || "",
      url: brand.url || "",
      color: brand.color || "#000000",
      status: brand.status || "ACTIVE",
      categories: assignedCategoryIds,
      brandCategories: brand.brandCategories || []
    }));
  };

  // Guardar marca (crear o actualizar) - lógica central
  const saveBrandCore = async (onSuccess) => {
    try {
      const payload = {
        ...formData,
        categoryIds: Array.isArray(formData.categories)
          ? formData.categories.map(id => Number(id))
          : []
      };

      if (isEditing && currentBrand) {
        await updateBrandMutation.mutateAsync({
          ...payload,
          updatedBy: "1"
        });
      } else {
        await createBrandMutation.mutateAsync({
          ...payload,
          createdBy: "1"
        });
      }

      // Usar el callback onSuccess solo si es una función
      if (typeof onSuccess === 'function') {
        onSuccess();
      }

      setFormData({
        name: "",
        url: "",
        color: "#000000",
        description: "",
        status: "ACTIVE",
        categories: []
      });
      setCurrentBrand(null);
      setIsEditing(false);

      toast.success(`Marca ${isEditing ? 'actualizada' : 'creada'} correctamente`);
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    } catch (error) {
      console.error('Error al guardar la marca:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la marca: ${error.message}`);
    }
  };

  // Guardar marca (crear o actualizar) con flujo de imagen
  const handleSaveBrand = async (onSuccess) => {
    // Si hay archivo, subirlo primero
    if (imageFile && formData.url && formData.url.startsWith("blob:")) {
      const uploadedUrl = await handleBrandImageUpload();
      if (!uploadedUrl) return;
    }
    await saveBrandCore(onSuccess);
    setImageFile(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  // Cambiar estado de una marca (activar/desactivar)
  const handleChangeBrandStatus = async (brandId, currentStatus) => {
    try {
      // Determinar el nuevo estado (inverso al actual)
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      console.log(`Cambiando estado de marca ${brandId} de ${currentStatus} a ${newStatus}`);

      // Usar la mutación de Tanstack Query para cambiar el estado
      await changeBrandStatusMutation.mutateAsync({ id: brandId, newStatus });

      // La actualización de la interfaz se maneja automáticamente por la invalidación de consultas
    } catch (error) {
      console.error('Error al cambiar estado de la marca:', error);
      toast.error(`Error al cambiar estado: ${error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error desconocido')}`);
    }
  };

  // Función para manejar la actualización de una categoría
  const handleCategoryUpdate = (updatedCategory) => {
    setCategories(prevCategories =>
      prevCategories.map(cat =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
  };

  // Función para manejar la eliminación de una categoría
  const handleCategoryDelete = (deletedCategoryId) => {
    setCategories(prevCategories =>
      prevCategories.filter(cat => cat.id !== deletedCategoryId)
    );

    // Si la categoría eliminada estaba asignada a la marca actual, la quitamos
    if (formData.categories?.includes(Number(deletedCategoryId))) {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(id => id !== Number(deletedCategoryId))
      }));
    }
  };

  // Función para manejar la creación de una nueva categoría
  const handleCreateCategory = async () => {
    try {
      const newCategory = await createCategory({
        ...newCategoryForm,
        createdBy: '1'
      });

      // Añadir la nueva categoría a la lista local
      setCategories(prev => [...prev, newCategory.data]);

      // Limpiar el formulario
      setNewCategoryForm({
        name: '',
        description: '',
        url: '',
        status: 'ACTIVE'
      });

      // Cerrar el diálogo
      setIsCreatingCategory(false);

      toast.success(`Categoría ${newCategoryForm.name} creada correctamente`);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error(error.message || 'No se pudo crear la categoría');
    }
  };

  // Manejar cambios en el formulario de nueva categoría
  const handleNewCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Eliminar una marca
  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    try {
      await deleteBrand(brandToDelete);
      toast.success("Marca eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    } catch (error) {
      toast.error("Error al eliminar la marca: " + (error?.message || error));
    } finally {
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  // Renderizar tarjeta de marca
  const renderBrandCard = (brand) => {
    const bg = brand.color || "#f3f4f6";
    const isLight = isLightColor(bg);
    const isActive = brand.status === "ACTIVE";

    return (
      <motion.div
        key={brand.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`overflow-hidden ${!isActive ? 'opacity-60' : ''} h-full flex flex-col`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{brand.name}</h3>
              <div className="flex items-center gap-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-900'}`}
                >
                  {isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md mt-2">
                {brand.url ? (
                  <img
                    src={brand.url}
                    alt={brand.name}
                    className="max-h-28 max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-logo.png";
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="text-gray-400">Sin logo</div>
                )}
              </div>
              {brand.description && (
                <p className="text-sm text-gray-600 text-center line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          </CardHeader>
          <div className="mt-auto border-t px-4 py-2 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: bg }}
                />
                <span className="text-xs text-gray-500">
                  {brand.brandCategories?.length || 0} categorías
                </span>
              </div>
              <div className="flex gap-1">
                <Dialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 hover:bg-gray-200"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                        <p>Editar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
                    <DialogHeader className="sticky top-0 z-10 pb-2 border-b">
                      <DialogTitle>Editar Marca</DialogTitle>
                      <DialogDescription>
                        Actualiza los detalles de la marca. Haz clic en guardar cuando termines.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 overflow-y-auto pr-2">
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
                        <Label htmlFor="brand-image-file" className="text-right">
                          Logo de la marca
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <p className="text-xs text-gray-500 mt-1">O ingresa una URL directamente:</p>
                          <Input
                            id="brand-image-url"
                            name="url"
                            placeholder="https://ejemplo.com/logo.png"
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
                            onClick={() => window._brandCloudflareInput && window._brandCloudflareInput.click()}
                          >
                            Subir archivo
                          </Button>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            ref={el => (window._brandCloudflareInput = el)}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              try {
                                const res = await uploadToCloudflareMutation.mutateAsync(file);
                                const url = res?.data?.[0]?.url;
                                if (url) {
                                  if (file.type.startsWith('image/')) {
                                    setFormData(prev => ({ ...prev, url }));
                                    toast.success('Imagen subida a Cloudflare');
                                  } else if (file.type === 'application/pdf') {
                                    toast.success('Archivo PDF subido a Cloudflare');
                                  }
                                } else {
                                  toast.error('Error al subir el archivo');
                                }
                              } catch (err) {
                                toast.error('Error al subir el archivo: ' + (err.message || err));
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
                          {imageFile && formData.url.startsWith("blob:") && (
                            <Button
                              type="button"
                              onClick={handleBrandImageUpload}
                              disabled={uploadingImage}
                              className="mt-2"
                            >
                              {uploadingImage ? "Subiendo..." : "Subir imagen"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">
                          Color
                        </Label>
                        <div className="col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Input
                                id="color"
                                name="color"
                                type="color"
                                value={formData.color}
                                onChange={handleInputChange}
                                className="w-12 h-12 p-1 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-8 h-8 rounded-full border shadow-sm"
                                  style={{ backgroundColor: formData.color }}
                                />
                                <Input
                                  type="text"
                                  value={formData.color}
                                  onChange={handleInputChange}
                                  name="color"
                                  className="font-mono uppercase"
                                />
                              </div>
                              <div
                                className="w-full h-6 rounded-md"
                                style={{
                                  background: `linear-gradient(to right, #fff, ${formData.color})`,
                                  border: '1px solid #e2e8f0'
                                }}
                              />
                            </div>
                          </div>
                        </div>
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

                      {/* Sección de Categorías */}
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                          Categorías
                        </Label>
                        <div className="col-span-3">
                          <div className="space-y-4">
                            {/* Categorías asignadas */}
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-start flex-col gap-1">
                                  <h4 className="text-sm font-medium">Categorías asignadas:</h4>
                                  <span className="text-xs text-gray-500">
                                    Da clic en la categoría para quiatarla de {brand.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md min-h-10">
                                {formData.categories?.length > 0 ? (
                                  categories
                                    .filter(cat => formData.categories.some(id => Number(id) === Number(cat.id)))
                                    .map((category, index) => (
                                      <CategoryBadge
                                        key={index}
                                        category={category}
                                        brandColor={formData.color}
                                        isAssigned={true}
                                        onEdit={handleCategoryUpdate}
                                        onDelete={handleCategoryDelete}
                                        onClick={() => {
                                          // Remover categoría de las asignadas
                                          const newCategories = formData.categories.filter(
                                            id => Number(id) !== Number(category.id)
                                          );
                                          setFormData(prev => ({
                                            ...prev,
                                            categories: newCategories
                                          }));
                                        }}
                                        showActions={true}
                                      />
                                    ))
                                ) : (
                                  <span className="text-sm text-gray-400">No hay categorías asignadas</span>
                                )}
                              </div>
                            </div>

                            {/* Categorías disponibles */}
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-start flex-col gap-1">
                                  <h4 className="text-sm font-medium">Categorías disponibles:</h4>
                                  <span className="text-xs text-gray-500">
                                    Da clic en la categoría para asignarla a la marca
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer h-8 px-2 text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200"
                                    onClick={() => setIsCreatingCategory(true)}
                                  >
                                    <Plus className="h-3 w-3" />
                                    Nueva categoría
                                  </Button>
                                </div>

                              </div>

                              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                                {categories
                                  .filter(cat => !formData.categories?.some(id => Number(id) === Number(cat.id)))
                                  .map((category, index) => {
                                    const assignedBrand = getBrandForCategory(category.id);
                                    return (
                                      <CategoryBadge
                                        key={index}
                                        category={category}
                                        brandColor={formData.color}
                                        isAssigned={false}
                                        onEdit={handleCategoryUpdate}
                                        onDelete={handleCategoryDelete}
                                        onClick={() => {
                                          // Agregar categoría a las asignadas
                                          const newCategories = [...new Set([
                                            ...formData.categories,
                                            category.id
                                          ])];
                                          setFormData(prev => ({
                                            ...prev,
                                            categories: newCategories
                                          }));
                                        }}
                                        showActions={true}
                                        assignedBrand={assignedBrand}
                                      />
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="sticky bottom-0 bg-white z-10 pt-2 border-t mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary" className="cursor-pointer">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="submit" className="cursor-pointer" onClick={handleSaveBrand}>
                          Guardar cambios
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

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
                          ¿Desactivar marca?
                        </SheetTitle>
                        <SheetDescription>
                          Esta acción desactivará la marca. Los productos asociados seguirán existiendo pero la marca no aparecerá en listados públicos.
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
                                handleChangeBrandStatus(brand.id, brand.status);
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
                            onClick={() => handleChangeBrandStatus(brand.id, brand.status)}
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
                            onClick={() => { setBrandToDelete(brand.id); setDeleteDialogOpen(true); }}
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

  // Función para obtener la marca a la que está asignada una categoría
  const getBrandForCategory = (categoryId) => {
    if (!brands || !categoryId) return null;

    // Buscar en todas las marcas (excepto la actual) si tienen asignada esta categoría
    const brandWithCategory = brands.find(brand =>
      brand.id !== currentBrand?.id &&
      brand.brandCategories?.some(bc => Number(bc.categoryId) === Number(categoryId))
    );

    return brandWithCategory || null;
  };

  return (
    <div className="space-y-4 mt-3">
      {/* Título */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Marcas</h2>
      </div>

      {/* Cabecera con controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar marcas..."
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={() => {
              // Invalidar todas las consultas relacionadas con marcas para forzar una recarga
              queryClient.invalidateQueries({ queryKey: ['brands'] });
              toast.success('Recargando marcas...');
            }}
            title="Recargar marcas"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              onClick={handleNewBrand}
            >
              + Nueva marca
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader className="pb-4 border-b sticky top-0 bg-white z-10">
              <DialogTitle className="text-xl font-bold text-blue-800">
                {isEditing ? "Editar Marca" : "Nueva Marca"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {isEditing
                  ? "Actualiza los detalles de la marca. Haz clic en guardar cuando termines."
                  : "Completa el formulario para crear una nueva marca."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-6 overflow-y-auto pr-2">
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Información básica</h3>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="font-medium">
                      Nombre de la marca *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ej: Makita, Bosch, DeWalt"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="brand-image-file" className="font-medium">
                      Logo de la marca
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <p className="text-xs text-gray-500 mt-1">Ingresa la URL del logo de la marca:</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <Input
                          id="brand-image-url"
                          name="url"
                          placeholder="https://ejemplo.com/logo.png"
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
                          onClick={() => window._brandCloudflareInputCreate && window._brandCloudflareInputCreate.click()}
                        >
                          Subir archivo
                        </Button>
                        {formData.url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData(prev => ({ ...prev, url: "" }))}
                            title="Limpiar logo"
                          >
                            <span aria-label="Limpiar">✕</span>
                          </Button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        ref={el => (window._brandCloudflareInputCreate = el)}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            const res = await uploadToCloudflareMutation.mutateAsync(file);
                            const url = res?.data?.[0]?.url;
                            if (url) {
                              if (file.type.startsWith('image/')) {
                                setFormData(prev => ({ ...prev, url }));
                                toast.success('Imagen subida a Cloudflare');
                              } else if (file.type === 'application/pdf') {
                                toast.success('Archivo PDF subido a Cloudflare');
                              }
                            } else {
                              toast.error('Error al subir el archivo');
                            }
                          } catch (err) {
                            toast.error('Error al subir el archivo: ' + (err.message || err));
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
                      {imageFile && formData.url.startsWith("blob:") && (
                        <Button
                          type="button"
                          onClick={handleBrandImageUpload}
                          disabled={uploadingImage}
                          className="mt-2"
                        >
                          {uploadingImage ? "Subiendo..." : "Subir imagen"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="color" className="font-medium">
                      Color de la marca
                    </Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Input
                            id="color"
                            name="color"
                            type="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="w-14 h-14 p-1 cursor-pointer overflow-hidden rounded-md opacity-0 absolute inset-0 z-10"
                          />
                          <div
                            className="w-14 h-14 rounded-md border border-gray-300 shadow-sm flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: formData.color }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10" />
                          </div>
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Color seleccionado:</span>
                            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{formData.color}</span>
                          </div>

                          <div className="flex gap-2">
                            {['#01758D', '#1C398E', '#f7e25f', '#184cd5', '#c51f2c', '#a3c0d5', '#16ae42'].map(color => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded-full border transition-transform ${formData.color === color ? 'scale-125 shadow-md border-white' : 'hover:scale-110'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setFormData({ ...formData, color })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description" className="font-medium">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe brevemente esta marca..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Sección de categorías */}
              <div className="col-span-4 mt-6 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Categorías para esta marca</h3>
                </div>

                {/* El componente CategoryManager ahora maneja la creación y gestión de categorías */}

                {/* Componente CategoryManager para gestionar categorías */}
                <CategoryManager
                  categories={categories}
                  selectedCategories={formData.categories}
                  onCategoriesChange={(newSelectedCategories) => {
                    setFormData(f => ({
                      ...f,
                      categories: newSelectedCategories
                    }));
                  }}
                  onCategoriesListChange={(updatedCategories) => {
                    setCategories(updatedCategories);
                  }}
                />
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-4 flex gap-2 sticky bottom-0 bg-white z-10">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="gap-1">
                  <X className="h-4 w-4" /> Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  onClick={(e) => handleSaveBrand(() => { })}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  {isEditing ? (
                    <>
                      <Check className="h-4 w-4" /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Crear marca
                    </>
                  )}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para crear nueva categoría */}
        <Dialog open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newCategoryName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="newCategoryName"
                  name="name"
                  value={newCategoryForm.name}
                  onChange={handleNewCategoryInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newCategoryDescription" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="newCategoryDescription"
                  name="description"
                  value={newCategoryForm.description}
                  onChange={handleNewCategoryInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newCategoryUrl" className="text-right">
                  URL de la imagen
                </Label>
                <Input
                  id="newCategoryUrl"
                  name="url"
                  value={newCategoryForm.url}
                  onChange={handleNewCategoryInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingCategory(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryForm.name.trim()}
                >
                  Crear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No se encontraron marcas</p>
          <Button
            variant="outline"
            onClick={() => setSearchTerm("")}
            className="mx-auto"
          >
            Limpiar búsqueda
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBrands.map(renderBrandCard)}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la marca de forma permanente. ¿Estás seguro de que deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBrandToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBrand} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Estilos por defecto para todos los toasts
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Estilos específicos para toasts de éxito
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          // Estilos específicos para toasts de error
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
