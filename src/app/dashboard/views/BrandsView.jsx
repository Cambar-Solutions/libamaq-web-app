import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAllBrands,
  useActiveBrands,
  useCreateBrand,
  useUpdateBrand,
  useChangeBrandStatus
} from "@/hooks/useBrands";
import { getAllCategories } from "@/services/admin/categoryService";
import CategoryManager from "@/components/admin/CategoryManager";
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
import { Edit, Trash2, Plus, Check, X, RefreshCcw } from "lucide-react";

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
  // Las variables de estado para la gestión de categorías ahora están en el componente CategoryManager

  // Obtener marcas usando Tanstack Query
  const { data: allBrandsData, isLoading: isLoadingAllBrands } = useAllBrands();
  const { data: activeBrandsData, isLoading: isLoadingActiveBrands } = useActiveBrands();
  
  // Mutaciones para crear, actualizar y cambiar estado
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const changeBrandStatusMutation = useChangeBrandStatus();
  
  // Cliente de consulta para invalidar consultas y forzar recargas
  const queryClient = useQueryClient();

  // Procesar datos de marcas cuando se cargan
  useEffect(() => {
    if (allBrandsData) {
      const brandsData = Array.isArray(allBrandsData)
        ? allBrandsData
        : (allBrandsData.data || []);

      // Asegurarse de que cada marca tenga los campos necesarios
      const processedBrands = brandsData.map(brand => ({
        id: brand.id,
        name: brand.name,
        description: brand.description || "",
        url: brand.url || "",
        color: brand.color || "#000000",
        status: brand.status || "ACTIVE",
        categories: brand.categories || brand.brandCategories || []
      }));
      
      setBrands(processedBrands);
    }
  }, [allBrandsData]);
  
  // Procesar datos de marcas activas cuando se cargan
  useEffect(() => {
    if (activeBrandsData) {
      const brandsData = Array.isArray(activeBrandsData)
        ? activeBrandsData
        : (activeBrandsData.data || []);

      // Asegurarse de que cada marca tenga los campos necesarios
      const processedBrands = brandsData.map(brand => ({
        id: brand.id,
        name: brand.name,
        description: brand.description || "",
        url: brand.url || "",
        color: brand.color || "#000000",
        status: "ACTIVE", // Todas las marcas de este endpoint son activas
        categories: brand.categories || brand.brandCategories || []
      }));
      
      setFilteredBrands(processedBrands);
    }
  }, [activeBrandsData]);
  
  // Filtrar marcas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!activeBrandsData) return;
    
    const brandsData = Array.isArray(activeBrandsData)
      ? activeBrandsData
      : (activeBrandsData.data || []);
    
    const processedBrands = brandsData.map(brand => ({
      id: brand.id,
      name: brand.name,
      description: brand.description || "",
      url: brand.url || "",
      color: brand.color || "#000000",
      status: "ACTIVE",
      categories: brand.categories || brand.brandCategories || []
    }));
    
    if (searchTerm.trim() === "") {
      setFilteredBrands(processedBrands);
    } else {
      const filtered = processedBrands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [activeBrandsData, searchTerm]);

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
  const handleEditBrand = (brand) => {
    // Cargar las categorías antes de abrir el modal
    fetchCategories();
    
    setFormData({
      id: brand.id,
      name: brand.name || "",
      url: brand.url || "",
      color: brand.color || "#000000",
      description: brand.description || "",
      status: brand.status || "ACTIVE",
      categories: (brand.categories || []).map(cat => cat.id)
    });
    setIsEditing(true);
    setCurrentBrand(brand);
    fetchCategories();
  };

  // Guardar marca (crear o actualizar)
  const handleSaveBrand = async (closeDialog) => {
    try {
      // Validar campos requeridos
      if (!formData.name || !formData.url) {
        toast.error("Nombre y URL del logo son obligatorios");
        return;
      }

      // Validar formato de color hexadecimal
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(formData.color)) {
        toast.error("El color debe estar en formato hexadecimal (ej: #FF0000)");
        return;
      }

      // 1. Separar ids de categorías existentes y objetos de categorías nuevas
      const selectedCategories = formData.categories;
      const existingCategoryIds = categories.filter(cat => selectedCategories.includes(cat.id)).map(cat => cat.id);
      const newCategories = selectedCategories.filter(catIdOrObj => {
        // Si es un objeto o no existe en categories, es nueva
        return !categories.some(cat => cat.id === catIdOrObj);
      });

      // 2. Crear las categorías nuevas y obtener sus IDs
      let newCategoryIds = [];
      for (const cat of newCategories) {
        // cat puede ser un id (si ya existe) o un objeto (si es nueva)
        if (typeof cat === 'object' && cat.name) {
          try {
            // Solo enviar name, url y description para la categoría
            const { name, url, description } = cat;
            const data = await createCategory({ name, url, description });
            if (data && data.result && data.result.id) {
              newCategoryIds.push(data.result.id);
              setCategories(prev => [...prev, data.result]);
            }
          } catch (e) {
            toast.error('Error al crear categoría: ' + (cat.name || '')); 
            return;
          }
        } else if (typeof cat === 'string' || typeof cat === 'number') {
          // Si por alguna razón llegó un id, lo agregamos
          newCategoryIds.push(cat);
        }
      }

      // 3. Preparar payload final
      const allCategoryIds = [...existingCategoryIds, ...newCategoryIds];
      
      // Preparar el payload según si es edición o creación
      let brandData;
      
      if (isEditing) {
        // Para actualización, usar EXACTAMENTE la estructura que espera la API
        brandData = {
          id: Number(formData.id),
          updatedBy: "1",
          updatedAt: new Date().toISOString(),
          name: formData.name,
          url: formData.url,
          color: formData.color,
          description: formData.description || "",
          status: formData.status || "ACTIVE",
          categoryIds: allCategoryIds.map(id => Number(id))
        };
      } else {
        // Para creación, usar la estructura original
        brandData = {
          ...formData,
          brandCategoryDto: allCategoryIds.map(categoryId => ({
            categoryId: categoryId
          }))
        };
      }

      console.log('Enviando datos de marca:', brandData);
      
      if (isEditing) {
        // Usar la mutación de Tanstack Query para actualizar
        await updateBrandMutation.mutateAsync(brandData);
      } else {
        // Usar la mutación de Tanstack Query para crear
        await createBrandMutation.mutateAsync(brandData);
      }

      // Cerrar diálogo
      closeDialog();
    } catch (error) {
      console.error("Error al guardar marca:", error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la marca: ${error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error desconocido')}`);
    }
  };

  // Obtener todas las categorías
  const fetchCategories = async () => {
    try {
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
        <Card className={`overflow-hidden ${!isActive ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
              {brand.url ? (
                <img
                  src={brand.url}
                  alt={brand.name}
                  className="max-h-36 max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = "/placeholder-logo.png";
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="text-gray-400">Sin logo</div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-gray-600 line-clamp-2 px-4 py-2">
              {brand.description || "Sin descripción"}
            </p>
          </CardContent>
          <div
            className="w-full px-4 py-3 text-white rounded-b-xl"
            style={{ backgroundColor: bg }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-semibold truncate ${isLight ? "text-black/60" : "text-white/80"}`}>{brand.name}</h3>
                <p className={`text-sm ${isLight ? "text-black/60" : "text-white/80"}`}>

                  {isActive ? "Activa" : "Inactiva"}
                </p>
              </div>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 bg-white/20 hover:bg-white/30 text-white cursor-pointer ${isLight ? "text-black/60 hover:text-white hover:bg-black/30" : "text-white/80"}`}
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
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
                        <Label htmlFor="url" className="text-right">
                          URL del Logo
                        </Label>
                        <Input
                          id="url"
                          name="url"
                          value={formData.url}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
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
                    </div>
                    <DialogFooter className="sticky bottom-0 bg-white z-10 pt-2 border-t mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary" className="cursor-pointer">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="submit" className="cursor-pointer" onClick={(e) => handleSaveBrand(() => { })}>
                          Guardar cambios
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 bg-white/20 hover:bg-white/30 text-white cursor-pointer ${isLight ? "text-black/60 hover:text-white hover:bg-black/30" : "text-white/80"}`}
                    >
                      {isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        {isActive ? "¿Desactivar marca?" : "¿Activar marca?"}
                      </SheetTitle>
                      <SheetDescription>
                        {isActive
                          ? "Esta acción desactivará la marca. Los productos asociados seguirán existiendo pero la marca no aparecerá en listados públicos."
                          : "Esta acción activará la marca y estará visible en listados públicos."}
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
                            {isActive ? "Desactivar" : "Activar"}
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      {/* Cabecera con controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
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
                    <Label htmlFor="url" className="font-medium">
                      URL del Logo *
                    </Label>
                    <Input
                      id="url"
                      name="url"
                      placeholder="https://ejemplo.com/logo.png"
                      value={formData.url}
                      onChange={handleInputChange}
                    />
                    {formData.url && (
                      <div className="mt-2 p-2 border rounded flex justify-center bg-gray-50">
                        <img 
                          src={formData.url} 
                          alt="Vista previa" 
                          className="max-h-20 object-contain" 
                          onError={(e) => {
                            e.target.src = "/placeholder-logo.png";
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    )}
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
                                onClick={() => setFormData({...formData, color})}
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
    </>
  );
}
