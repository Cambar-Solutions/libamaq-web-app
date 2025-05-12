import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getAllBrands,
  getAllActiveBrands,
  createBrand,
  updateBrand,
  changeBrandStatus
} from "@/services/admin/brandService";
import { getAllCategories, createCategory } from "@/services/admin/categoryService";
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
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    url: "",
    description: ""
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Cargar marcas al iniciar
  useEffect(() => {
    fetchBrands();
  }, []);

  // Filtrar marcas cuando cambia el término de búsqueda
  useEffect(() => {
    // Primero filtrar solo las marcas activas
    const activeBrands = brands.filter(brand => brand.status === "ACTIVE");
    
    // Luego aplicar el filtro de búsqueda si existe
    if (searchTerm.trim() === "") {
      setFilteredBrands(activeBrands);
    } else {
      const filtered = activeBrands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  // Obtener todas las marcas y filtrar las activas
  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBrands();
      console.log("Respuesta de marcas:", response);

      // Extraer los datos de la respuesta
      const brandsData = Array.isArray(response)
        ? response
        : (response.result || []);

      // Asegurarse de que cada marca tenga los campos necesarios
      const processedBrands = brandsData.map(brand => ({
        id: brand.id,
        name: brand.name,
        description: brand.description || "",
        url: brand.url || "",
        color: brand.color || "#000000",
        status: brand.status || "ACTIVE",
        categories: brand.categories || []
      }));
      
      // Filtrar solo las marcas activas
      const activeBrands = processedBrands.filter(brand => brand.status === "ACTIVE");

      setBrands(processedBrands); // Mantener todas las marcas en el estado
      setFilteredBrands(activeBrands); // Mostrar solo las activas
    } catch (error) {
      console.error("Error al obtener marcas:", error);
      toast.error("Error al cargar las marcas");
    } finally {
      setIsLoading(false);
    }
  };

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
          id: formData.id,
          name: formData.name,
          url: formData.url,
          color: formData.color,
          description: formData.description || "",
          status: formData.status || "ACTIVE",
          categories: allCategoryIds.map(categoryId => ({
            id: parseInt(categoryId)
          }))
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
      
      const response = isEditing
        ? await updateBrand(brandData)
        : await createBrand(brandData);

      if (response && (response.type === 'SUCCESS' || response.result)) {
        toast.success(`Marca ${isEditing ? 'actualizada' : 'creada'} correctamente`);
      } else {
        throw new Error(response?.text || 'No se recibió una respuesta válida del servidor');
      }

      // Recargar lista de marcas
      await fetchBrands();

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
      const cats = Array.isArray(response)
        ? response
        : (response.result || []);
      setCategories(cats);
    } catch (error) {
      toast.error("Error al cargar categorías");
    }
  };

  // Cambiar estado de marca (activar/desactivar)
  const handleChangeBrandStatus = async (brandId, newStatus) => {
    try {
      // Encontrar la marca completa en el estado
      const brandToUpdate = brands.find(brand => brand.id === brandId);
      
      if (!brandToUpdate) {
        throw new Error('Marca no encontrada');
      }
      
      // Crear una copia con el nuevo estado
      const updatedBrand = {
        ...brandToUpdate,
        status: newStatus
      };
      
      // Usar updateBrand en lugar de changeBrandStatus para enviar todos los datos
      const response = await updateBrand(updatedBrand);
      
      if (response && (response.type === 'SUCCESS' || response.result)) {
        toast.success(`Estado de la marca cambiado a ${newStatus === 'ACTIVE' ? 'activo' : 'inactivo'}`);
        
        // Si se desactivó una marca, eliminarla del estado local inmediatamente
        if (newStatus === 'INACTIVE') {
          setBrands(prevBrands => prevBrands.map(brand => 
            brand.id === brandId ? {...brand, status: 'INACTIVE'} : brand
          ));
          setFilteredBrands(prevFiltered => prevFiltered.filter(brand => brand.id !== brandId));
        } else {
          fetchBrands(); // Recargar todas las marcas si se activó
        }
      } else {
        throw new Error(response?.text || 'No se recibió una respuesta válida del servidor');
      }
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
                      className={`h-8 w-8 bg-white/20 hover:bg-white/30 text-white ${isLight ? "text-black/60 hover:text-white hover:bg-black/30" : "text-white/80"}`}
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2 border-b">
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
                        <div className="col-span-3 flex gap-2">
                          <Input
                            id="color"
                            name="color"
                            type="text"
                            value={formData.color}
                            onChange={handleInputChange}
                          />
                          <div
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: formData.color }}
                          />
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
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium">Categorías para esta marca</h3>
                            <Button 
                              size="sm" 
                              variant={isCreatingCategory ? "destructive" : "default"} 
                              onClick={() => setIsCreatingCategory(v => !v)}
                              className="gap-1"
                            >
                              {isCreatingCategory ? (
                                <>
                                  <X className="h-4 w-4" /> Cancelar
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" /> Nueva Categoría
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {/* Crear nueva categoría */}
                          {isCreatingCategory && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4 shadow-sm">
                              <h4 className="font-medium text-blue-800 mb-3">Nueva categoría</h4>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <Label htmlFor="cat-name" className="mb-1 block text-sm">Nombre *</Label>
                                  <Input
                                    id="cat-name"
                                    name="name"
                                    placeholder="Ej: Herramientas Eléctricas"
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
                              </div>
                              <div className="flex justify-end mt-3">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      if (!categoryForm.name) return toast.error('El nombre de la categoría es obligatorio');
                                      // Solo enviar name, url y description para la categoría
                                      const { name, url, description } = categoryForm;
                                      const data = await createCategory({ name, url, description });
                                      if (data && data.result && data.result.id) {
                                        setCategories(prev => [...prev, data.result]);
                                        setFormData(f => ({ ...f, categories: [...f.categories, data.result.id] }));
                                        setCategoryForm({ name: '', url: '', description: '' });
                                        setIsCreatingCategory(false);
                                        toast.success('Categoría creada correctamente');
                                      }
                                    } catch (e) {
                                      toast.error('Error al crear la categoría');
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Crear categoría
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Lista de categorías asignadas */}
                          <div className="mt-2">
                            <Label className="mb-2 block text-sm">Categorías asignadas:</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px] bg-gray-50">
                              {categories
                                .filter(cat => formData.categories.includes(cat.id))
                                .map(cat => (
                                  <div key={cat.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                    <span>{cat.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 rounded-full hover:bg-blue-200"
                                      onClick={() => setFormData(f => ({
                                        ...f,
                                        categories: f.categories.filter(id => id !== cat.id)
                                      }))}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                              ))}
                              {formData.categories.length === 0 && (
                                <div className="flex items-center justify-center w-full h-12 text-gray-400">
                                  No hay categorías asignadas
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Lista de categorías disponibles */}
                          <div className="mt-4">
                            <Label className="mb-2 block text-sm">Categorías disponibles:</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px] bg-gray-50">
                              {categories
                                .filter(cat => !formData.categories.includes(cat.id))
                                .map(cat => (
                                  <Button
                                    key={cat.id}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setFormData(f => ({
                                      ...f,
                                      categories: [...f.categories, cat.id]
                                    }))}
                                    className="transition-all duration-200 hover:scale-105"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {cat.name}
                                  </Button>
                              ))}
                              {categories.filter(cat => !formData.categories.includes(cat.id)).length === 0 && (
                                <div className="flex items-center justify-center w-full h-12 text-gray-400">
                                  No hay más categorías disponibles
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="sticky bottom-0 bg-white z-10 pt-2 border-t mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="submit" onClick={(e) => handleSaveBrand(() => { })}>
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
                      className={`h-8 w-8 bg-white/20 hover:bg-white/30 text-white ${isLight ? "text-black/60 hover:text-white hover:bg-black/30" : "text-white/80"}`}
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
                              const newStatus = isActive ? "INACTIVE" : "ACTIVE";
                              handleChangeBrandStatus(brand.id, newStatus);
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
            <Input
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchBrands}
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
                  <Button 
                    size="sm" 
                    variant={isCreatingCategory ? "destructive" : "default"} 
                    onClick={() => setIsCreatingCategory(v => !v)}
                    className="gap-1"
                  >
                    {isCreatingCategory ? (
                      <>
                        <X className="h-4 w-4" /> Cancelar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Nueva Categoría
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Crear nueva categoría */}
                {isCreatingCategory && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4 shadow-sm">
                    <h4 className="font-medium text-blue-800 mb-3">Nueva categoría</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="cat-name" className="mb-1 block text-sm">Nombre *</Label>
                        <Input
                          id="cat-name"
                          name="name"
                          placeholder="Ej: Herramientas Eléctricas"
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
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            if (!categoryForm.name) return toast.error('El nombre de la categoría es obligatorio');
                            // Solo enviar name, url y description para la categoría
                            const { name, url, description } = categoryForm;
                            const data = await createCategory({ name, url, description });
                            if (data && data.result && data.result.id) {
                              setCategories(prev => [...prev, data.result]);
                              setFormData(f => ({ ...f, categories: [...f.categories, data.result.id] }));
                              setCategoryForm({ name: '', url: '', description: '' });
                              setIsCreatingCategory(false);
                              toast.success('Categoría creada correctamente');
                            }
                          } catch (e) {
                            toast.error('Error al crear la categoría');
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Crear categoría
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Lista de categorías seleccionables */}
                <div className="mt-2">
                  <Label className="mb-2 block text-sm">Selecciona las categorías para esta marca:</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px] bg-gray-50">
                    {categories.map(cat => (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant={formData.categories.includes(cat.id) ? "default" : "outline"}
                        style={{
                          backgroundColor: formData.categories.includes(cat.id) ? '#3b82f6' : undefined,
                          borderColor: formData.categories.includes(cat.id) ? '#3b82f6' : undefined,
                          color: formData.categories.includes(cat.id) ? '#fff' : undefined
                        }}
                        onClick={() => setFormData(f => ({
                          ...f,
                          categories: f.categories.includes(cat.id)
                            ? f.categories.filter(id => id !== cat.id)
                            : [...f.categories, cat.id]
                        }))}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        {formData.categories.includes(cat.id) && <Check className="h-3 w-3 mr-1" />}
                        {cat.name}
                      </Button>
                    ))}
                    {categories.length === 0 && (
                      <div className="flex items-center justify-center w-full h-12 text-gray-400">
                        No hay categorías disponibles
                      </div>
                    )}
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
              <DialogClose asChild>
                <Button 
                  type="submit" 
                  onClick={(e) => handleSaveBrand(() => { })}
                  className="gap-1 bg-blue-600 hover:bg-blue-700"
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
