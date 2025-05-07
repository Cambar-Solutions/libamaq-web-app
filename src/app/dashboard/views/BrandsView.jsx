import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  getAllBrands, 
  createBrand, 
  updateBrand, 
  changeBrandStatus 
} from "@/services/admin/brandService";
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

export function BrandsView() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    color: "#000000",
    description: "",
    status: "ACTIVE"
  });

  // Cargar marcas al iniciar
  useEffect(() => {
    fetchBrands();
  }, []);

  // Filtrar marcas cuando cambia el término de búsqueda
  useEffect(() => {
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

  // Obtener todas las marcas
  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBrands();
      console.log("Respuesta de marcas:", response);
      
      // Extraer los datos de la respuesta
      const brandsData = Array.isArray(response) 
        ? response 
        : (response.result || []);
      
      setBrands(brandsData);
      setFilteredBrands(brandsData);
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
      logoUrl: "",
      color: "#000000",
      description: "",
      status: "ACTIVE"
    });
    setIsEditing(false);
    setCurrentBrand(null);
  };

  // Preparar formulario para editar marca existente
  const handleEditBrand = (brand) => {
    setFormData({
      id: brand.id,
      name: brand.name || "",
      logoUrl: brand.logoUrl || "",
      color: brand.color || "#000000",
      description: brand.description || "",
      status: brand.status || "ACTIVE"
    });
    setIsEditing(true);
    setCurrentBrand(brand);
  };

  // Guardar marca (crear o actualizar)
  const handleSaveBrand = async (closeDialog) => {
    try {
      // Validar campos requeridos
      if (!formData.name || !formData.logoUrl) {
        toast.error("Nombre y URL del logo son obligatorios");
        return;
      }

      // Validar formato de color hexadecimal
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(formData.color)) {
        toast.error("El color debe estar en formato hexadecimal (ej: #FF0000)");
        return;
      }

      if (isEditing) {
        // Actualizar marca existente
        await updateBrand(formData);
        toast.success("Marca actualizada correctamente");
      } else {
        // Crear nueva marca
        await createBrand(formData);
        toast.success("Marca creada correctamente");
      }

      // Recargar lista de marcas
      await fetchBrands();
      
      // Cerrar diálogo
      closeDialog();
    } catch (error) {
      console.error("Error al guardar marca:", error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la marca: ${error.message || 'Error desconocido'}`);
    }
  };

  // Cambiar estado de marca (activar/desactivar)
  const handleChangeStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await changeBrandStatus(id, newStatus);
      toast.success(`Marca ${newStatus === "ACTIVE" ? "activada" : "desactivada"} correctamente`);
      await fetchBrands();
    } catch (error) {
      console.error("Error al cambiar estado de marca:", error);
      toast.error(`Error al cambiar estado de la marca: ${error.message || 'Error desconocido'}`);
    }
  };

  // Renderizar tarjeta de marca
  const renderBrandCard = (brand) => {
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
              {brand.logoUrl ? (
                <img 
                  src={brand.logoUrl} 
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
            style={{ backgroundColor: brand.color || "#f3f4f6" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold truncate">{brand.name}</h3>
                <p className="text-sm text-white/80">
                  {isActive ? "Activa" : "Inactiva"}
                </p>
              </div>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Marca</DialogTitle>
                      <DialogDescription>
                        Actualiza los detalles de la marca. Haz clic en guardar cuando termines.
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
                        <Label htmlFor="logoUrl" className="text-right">
                          URL del Logo
                        </Label>
                        <Input
                          id="logoUrl"
                          name="logoUrl"
                          value={formData.logoUrl}
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
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="submit" onClick={(e) => handleSaveBrand(() => {})}>
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
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
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
                            onClick={() => handleChangeStatus(brand.id, brand.status)}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Marca" : "Nueva Marca"}
              </DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Actualiza los detalles de la marca. Haz clic en guardar cuando termines."
                  : "Completa el formulario para crear una nueva marca."}
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
                <Label htmlFor="logoUrl" className="text-right">
                  URL del Logo
                </Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
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
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" onClick={(e) => handleSaveBrand(() => {})}>
                  {isEditing ? "Guardar cambios" : "Crear marca"}
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
