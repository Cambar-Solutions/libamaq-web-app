import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { getAllProducts, updateProduct, getProductPreviews, deleteProduct } from "@/services/admin/productService";
import { getAllBrands } from "@/services/admin/brandService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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


function isLightColor(hexColor) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186;
}


const CardComponent = ({ product, onClick, onDelete }) => {
  const getImageUrl = () => {
    // Verificar si hay imágenes en el array media
    if (product.media && product.media.length > 0) {
      return product.media[0].url;
    }
    // Si no hay imágenes, mostrar el logo de la marca si existe
    return product.brand?.logoUrl || "/placeholder-product.jpg";
  };

  // Para la vista previa, usar un color predeterminado
  const bg = product.color || "#3b82f6"; // Color azul predeterminado
  const isLight = isLightColor(bg);
  const textColor = isLight ? "text-black" : "text-white";

  const handleCardClick = (e) => {
    // Prevent card click when clicking on buttons
    if (e.target.closest('button')) {
      e.stopPropagation();
      return;
    }
    onClick();
  };

  return (
    <Card
      onClick={handleCardClick}
      className="
        cursor-pointer
        filter grayscale-[40%] hover:grayscale-0
        transition-filter duration-500
        flex flex-col h-full
        shadow-md hover:shadow-lg
        relative
      "
    >
      <CardHeader>
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              if (product.brand?.logoUrl) {
                e.target.src = product.brand.logoUrl;
              }
            }}
          />
        </div>
      </CardHeader>
      <div
        className="rounded-b-xl w-full px-6 py-3 text-white"
        style={{ backgroundColor: bg }}
      >
        <div>
          <CardTitle className={`truncate whitespace-nowrap overflow-hidden text-sm md:text-base ${textColor}`} title={product.name}>{product.name}</CardTitle>
          <CardDescription>
            <div className={`flex flex-col ${textColor}`}>
              <span>ID: {product.id}</span>
              <span>Precio: ${product.price}</span>
              <span className="truncate">{product.description}</span>
            </div>
          </CardDescription>
        </div>
      </div>
      
      {/* Delete button positioned at the bottom right */}
      <div className="absolute bottom-3 right-3 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 bg-white/20 hover:bg-white/30 rounded-full ${isLight ? "text-black/60 hover:text-white hover:bg-black/30" : "text-white/80"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                ¿Eliminar producto?
              </SheetTitle>
              <SheetDescription>
                Esta acción marcará el producto como inactivo y no aparecerá en listados públicos.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8">
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    onClick={() => onDelete(product.id)}
                    variant="destructive"
                  >
                    Eliminar
                  </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  );
};


export function ProductsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filtrar por marca
    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brandId === selectedBrand);
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        // Verificar si el nombre coincide
        const nameMatch = p.name?.toLowerCase().includes(lower) || false;
        
        // Verificar si el ID externo coincide (si existe)
        const externalIdMatch = p.externalId 
          ? p.externalId.toString().toLowerCase().includes(lower) 
          : false;
        
        // Verificar si el ID interno coincide
        const idMatch = p.id 
          ? p.id.toString().toLowerCase().includes(lower)
          : false;
        
        // Verificar si la descripción coincide (si existe)
        const descriptionMatch = p.description
          ? p.description.toLowerCase().includes(lower)
          : false;
        
        // Devolver verdadero si alguna de las condiciones se cumple
        return nameMatch || externalIdMatch || idMatch || descriptionMatch;
      });
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedBrand, searchTerm]);

  const fetchProducts = async () => {
    try {
      // Obtener productos y marcas
      console.log('Obteniendo productos y marcas...');
      const productsResponse = await getProductPreviews(); // Usar getProductPreviews para obtener la vista previa
      const brandsResponse = await getAllBrands();

      console.log('Respuesta de productos (preview):', productsResponse);
      console.log('Respuesta de marcas:', brandsResponse);

      // Verificar que las respuestas sean válidas
      if (!productsResponse || !brandsResponse) {
        throw new Error('Respuestas inválidas de la API');
      }

      // Extraer los datos de las respuestas
      // La estructura de la respuesta es { data: [...], status: 200, message: 'success' }
      const allProductsData = productsResponse.data || [];
      
      // Filtrar solo los productos activos
      const productsData = allProductsData.filter(product => product.status === "ACTIVE");
      
      const brandsData = Array.isArray(brandsResponse) 
        ? brandsResponse 
        : (brandsResponse.result || []);

      console.log('Datos de productos procesados:', productsData);
      console.log('Datos de marcas procesados:', brandsData);
      console.log('Productos filtrados (solo activos):', productsData.length, 'de', allProductsData.length);

      // Establecer marcas
      setBrands(brandsData);

      // Combinar productos con sus marcas correspondientes
      const withBrand = productsData.map((prod) => ({
        ...prod,
        brand: brandsData.find((b) => b.id === prod.brandId),
      }));

      console.log('Productos con marcas:', withBrand);
      console.log('Cantidad de productos activos:', withBrand.length);

      // Actualizar estado
      setProducts(withBrand);
      setFilteredProducts(withBrand);
    } catch (err) {
      toast.error("Error al cargar productos o marcas: " + (err.message || 'Error desconocido'));
      console.error('Error en fetchProducts:', err);
      // Establecer productos vacíos para evitar errores de renderizado
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Esta función ya no es necesaria ya que fetchProducts ya obtiene las marcas
  const fetchBrands = async () => {
    try {
      const response = await getAllBrands();
      console.log('Respuesta de fetchBrands:', response);

      const data = Array.isArray(response) ? response : (response.result || []);
      console.log('Datos de marcas procesados en fetchBrands:', data);

      setBrands(data);
    } catch (err) {
      toast.error("Error al cargar las marcas: " + (err.message || 'Error desconocido'));
      console.error('Error en fetchBrands:', err);
      // Establecer marcas vacías para evitar errores de renderizado
      setBrands([]);
    }
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value === "all" ? null : parseInt(value, 10));
  };

  const handleCardClick = (product) => {
    // Guardar el ID del producto en localStorage para que ProductoDetalle pueda acceder a él
    localStorage.setItem("selectedProductId", product.id);
    
    // Navegar a la vista detallada del producto
    navigate("/producto-detalle");
    
    console.log(`Navegando a la vista detallada del producto con ID: ${product.id}`);
  };
  
  // Función para manejar la eliminación de un producto
  const handleDeleteProduct = async (productId) => {
    try {
      // Llamar al servicio para eliminar el producto
      const response = await deleteProduct(productId);
      
      if (response && (response.type === 'SUCCESS' || response.result || response.status === 'success')) {
        toast.success('Producto eliminado correctamente');
        
        // Actualizar el estado local eliminando el producto de ambas listas
        setProducts(prevProducts => {
          const updatedProducts = prevProducts.filter(product => product.id !== productId);
          console.log('Productos después de eliminar:', updatedProducts);
          return updatedProducts;
        });
        
        setFilteredProducts(prevFiltered => {
          const updatedFiltered = prevFiltered.filter(product => product.id !== productId);
          console.log('Productos filtrados después de eliminar:', updatedFiltered);
          return updatedFiltered;
        });
        
        // Actualizar la caché de React Query si es necesario
        queryClient.invalidateQueries(['products']);
      } else {
        throw new Error(response?.message || 'No se recibió una respuesta válida del servidor');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error(`Error al eliminar: ${error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error desconocido')}`);
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      {/* Responsive Header */}
      <div className="mb-6 space-y-4">
        {/* Controles superiores - filtros y búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-center">
          {/* Select de marcas */}
          <div className="w-full">
            <Select
              value={selectedBrand?.toString() || "all"}
              onValueChange={handleBrandChange}
            >
              <SelectTrigger className="cursor-pointer w-full h-10">
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands
                  .filter(brand => brand.status === 'ACTIVE')
                  .map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()} className="cursor-pointer">
                      {brand.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Buscar por nombre o ID"
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botón de agregar producto */}
          <div className="w-full flex justify-end">
            <button
              onClick={() => navigate("/nuevo-producto")}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-600 text-sm font-semibold px-6 py-2 h-10 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
            >
              <span className="text-lg font-semibold">+</span> Agregar producto
            </button>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CardComponent
              product={product}
              onClick={() => handleCardClick(product)}
              onDelete={handleDeleteProduct}
            />
          </motion.div>
        ))}
      </div>
    </>
  );
}