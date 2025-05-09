import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  changeCategoryStatus,
  getCategoriesByBrand
} from "@/services/admin/categoryService";
import { getAllBrands } from "@/services/admin/brandService";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Edit, Trash2, Plus, Check, X, RefreshCcw, Tag } from "lucide-react";

export function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("all-brands");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    brandId: "1",
    status: "ACTIVE"
  });

  // Inicializar estado
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, brandsResponse] = await Promise.all([
          getAllCategories(),
          getAllBrands()
        ]);
        
        console.log('Respuesta de categorías:', categoriesResponse);
        console.log('Respuesta de marcas:', brandsResponse);
        
        // Extraer los datos de la respuesta y asegurar que sean arrays
        const categoriesData = categoriesResponse?.result || [];
        const brandsData = brandsResponse?.result || [];
        
        console.log('Datos de categorías:', categoriesData);
        console.log('Datos de marcas:', brandsData);
        
        // Asegurar que todas las categorías y marcas tengan IDs válidos
        const validCategories = Array.isArray(categoriesData) 
          ? categoriesData.filter(cat => cat && cat.id) 
          : [];
        const validBrands = Array.isArray(brandsData) 
          ? brandsData.filter(brand => brand && brand.id) 
          : [];
        
        console.log('Categorías válidas:', validCategories);
        console.log('Marcas válidas:', validBrands);
        
        if (validBrands.length === 0) {
          // Si no hay marcas válidas, agregar una marca predeterminada para evitar errores
          validBrands.push({ id: 'default-id', name: 'Marca predeterminada' });
        }
        
        setCategories(validCategories);
        setFilteredCategories(validCategories);
        setBrands(validBrands);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar datos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar categorías cuando cambia el término de búsqueda o el filtro de marca
  useEffect(() => {
    let filtered = [...categories];
    
    // Filtrar por marca si hay una seleccionada y no es "all-brands"
    if (selectedBrandFilter && selectedBrandFilter !== "all-brands") {
      filtered = filtered.filter(category => 
        category.brandId === parseInt(selectedBrandFilter)
      );
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredCategories(filtered);
  }, [categories, searchTerm, selectedBrandFilter]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar cambios en los selectores
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Convertir brandId a string para comparación en Select
  const getBrandIdAsString = (brandId) => {
    return brandId ? brandId.toString() : "default-id";
  };

  // Preparar formulario para crear nueva categoría
  const handleNewCategory = () => {
    // Establecer un valor predeterminado para brandId si hay marcas disponibles
    const defaultBrandId = brands.length > 0 ? brands[0].id.toString() : "default-id";
    
    setFormData({
      name: "",
      description: "",
      icon: "",
      brandId: defaultBrandId,
      status: "ACTIVE"
    });
    setIsEditing(false);
    setCurrentCategory(null);
  };

  // Preparar formulario para editar categoría existente
  const handleEditCategory = (category) => {
    console.log('Editando categoría:', category);
    setFormData({
      id: category.id,
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      brandId: category.brandId ? category.brandId.toString() : "default-id",
      status: category.status || "ACTIVE"
    });
    setIsEditing(true);
    setCurrentCategory(category);
  };

  // Guardar categoría (crear o actualizar)
  const handleSaveCategory = async (closeDialog) => {
    try {
      // Validar campos requeridos
      if (!formData.name || !formData.brandId) {
        toast.error("Nombre y marca son obligatorios");
        return;
      }

      // Convertir brandId a número si es posible
      let brandIdValue;
      try {
        brandIdValue = parseInt(formData.brandId);
        if (isNaN(brandIdValue)) {
          throw new Error("brandId no es un número válido");
        }
      } catch (error) {
        console.error("Error al convertir brandId a número:", error);
        toast.error("Error al procesar la marca seleccionada");
        return;
      }

      // Preparar datos para enviar a la API
      const categoryData = {
        ...formData,
        brandId: brandIdValue
      };

      console.log('Datos de categoría a guardar:', categoryData);

      if (isEditing) {
        // Actualizar categoría existente
        const response = await updateCategory(categoryData);
        console.log('Respuesta de actualización:', response);
        toast.success("Categoría actualizada correctamente");
      } else {
        // Crear nueva categoría
        const response = await createCategory(categoryData);
        console.log('Respuesta de creación:', response);
        toast.success("Categoría creada correctamente");
      }

      // Recargar lista de categorías
      await fetchDataFromAPI();

      // Cerrar diálogo
      closeDialog();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      toast.error(`Error al guardar categoría: ${error.message || 'Error desconocido'}`);
    }
  };

  // Cambiar estado de categoría (activar/desactivar)
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await changeCategoryStatus(id, currentStatus);
      toast.success(`Categoría ${currentStatus === "ACTIVE" ? "desactivada" : "activada"} correctamente`);
      await fetchDataFromAPI();
    } catch (error) {
      console.error("Error al cambiar estado de categoría:", error);
      toast.error(`Error al cambiar estado de la categoría: ${error.message || 'Error desconocido'}`);
    }
  };

  // Función para recargar datos desde API
  const fetchDataFromAPI = async () => {
    try {
      setIsLoading(true);
      const [categoriesResponse, brandsResponse] = await Promise.all([
        getAllCategories(),
        getAllBrands()
      ]);
      
      console.log('Respuesta de categorías (recarga):', categoriesResponse);
      console.log('Respuesta de marcas (recarga):', brandsResponse);
      
      // Extraer los datos de la respuesta y asegurar que sean arrays
      const categoriesData = categoriesResponse?.result || [];
      const brandsData = brandsResponse?.result || [];
      
      // Asegurar que todas las categorías y marcas tengan IDs válidos
      const validCategories = Array.isArray(categoriesData) 
        ? categoriesData.filter(cat => cat && cat.id) 
        : [];
      const validBrands = Array.isArray(brandsData) 
        ? brandsData.filter(brand => brand && brand.id) 
        : [];
      
      if (validBrands.length === 0) {
        // Si no hay marcas válidas, agregar una marca predeterminada para evitar errores
        validBrands.push({ id: 'default-id', name: 'Marca predeterminada' });
      }
      
      setCategories(validCategories);
      setFilteredCategories(validCategories);
      setBrands(validBrands);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar tarjeta de categoría
  const renderCategoryCard = (category) => {
    console.log('Renderizando categoría:', category);
    console.log('Marcas disponibles:', brands);
    
    // Verificar si la categoría tiene un brandId asignado
    if (!category.brandId) {
      console.warn(`Categoría ${category.id} (${category.name}) no tiene brandId asignado`);
    }
    
    // Mostrar todas las marcas y sus IDs para depuración
    brands.forEach(b => {
      console.log(`Marca disponible: ${b.name}, ID: ${b.id}, Tipo: ${typeof b.id}`);
    });
    
    // Encontrar la marca asociada a esta categoría
    // Convertir ambos IDs a strings para comparación
    const brand = brands.find(b => {
      const brandIdStr = String(b.id);
      const categoryBrandIdStr = String(category.brandId);
      console.log(`Comparando: Marca "${b.name}" ID=${brandIdStr} con Categoría "${category.name}" brandId=${categoryBrandIdStr}`);
      return brandIdStr === categoryBrandIdStr;
    });
    
    console.log('Marca encontrada para', category.name, ':', brand ? brand.name : 'Ninguna');
    const brandName = brand ? brand.name : "Sin marca";

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="w-full h-full mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold">{category.name}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Marca: {brandName} 
                </CardDescription>
                <div className="text-xs text-gray-400 mt-1">
                  ID Categoría: {category.id} | BrandID: {category.brandId || 'No asignado'}
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {category.status === "ACTIVE" ? "Activo" : "Inactivo"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-gray-600 line-clamp-2">{category.description || "Sin descripción"}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                handleEditCategory(category);
                document.getElementById('edit-category-dialog-trigger').click();
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Editar</span>
            </Button>
            <Button
              variant={category.status === "ACTIVE" ? "destructive" : "outline"}
              size="sm"
              className="h-8 px-2"
              onClick={() => handleToggleStatus(category.id, category.status)}
            >
              {category.status === "ACTIVE" ? (
                <>
                  <X className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Desactivar</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Activar</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Categorías</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
        <Input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-[300px]"
        />
        <Select 
          value={selectedBrandFilter} 
          onValueChange={setSelectedBrandFilter}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-brands">Todas las marcas</SelectItem>
            {brands
              .filter(brand => brand && brand.id)
              .map(brand => (
                <SelectItem 
                  key={brand.id} 
                  value={brand.id.toString() || "default-id"}
                >
                  {brand.name || "Marca sin nombre"}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchDataFromAPI}
          title="Recargar categorías"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Dialog para crear nueva categoría */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer mb-6"
            onClick={handleNewCategory}
          >
            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Nueva Categoría
            </DialogTitle>
            <DialogDescription>
              Completa el formulario para crear una nueva categoría.
            </DialogDescription>
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
              <Label htmlFor="brandId" className="text-right">
                Marca
              </Label>
              <div className="col-span-3">
                <Select 
                  value={getBrandIdAsString(formData.brandId)} 
                  onValueChange={(value) => handleSelectChange("brandId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands
                      .filter(brand => brand && brand.id)
                      .map(brand => (
                        <SelectItem 
                          key={brand.id} 
                          value={brand.id.toString() || "default-id"}
                        >
                          {brand.name || "Marca sin nombre"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icono
              </Label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => handleSaveCategory(() => {})}>Guardar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para editar categoría - se activa programáticamente */}
      <Dialog>
        <DialogTrigger asChild>
          <button id="edit-category-dialog-trigger" className="hidden">Editar Categoría</button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Editar Categoría
            </DialogTitle>
            <DialogDescription>
              Actualiza los detalles de la categoría. Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-brandId" className="text-right">
                Marca
              </Label>
              <div className="col-span-3">
                <Select 
                  value={getBrandIdAsString(formData.brandId)} 
                  onValueChange={(value) => handleSelectChange("brandId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands
                      .filter(brand => brand && brand.id)
                      .map(brand => (
                        <SelectItem 
                          key={brand.id} 
                          value={brand.id.toString() || "default-id"}
                        >
                          {brand.name || "Marca sin nombre"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-icon" className="text-right">
                Icono
              </Label>
              <Input
                id="edit-icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => handleSaveCategory(() => {})}>Guardar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando categorías...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Tag className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay categorías</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mt-2">
            {searchTerm || selectedBrandFilter
              ? "No se encontraron categorías con los filtros aplicados."
              : "No hay categorías creadas aún. Crea una nueva categoría para comenzar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(renderCategoryCard)}
        </div>
      )}
    </div>
  );
}
