import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardImg from "@/components/ui/CardImg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProductPreviews } from "@/services/admin/productService";
import { getAllBrands } from "@/services/admin/brandService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CardComponent = ({ product, onClick }) => {
  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    if (product.multimedia && product.multimedia.length > 0) {
      // Si hay multimedia, usar la primera imagen
      return product.multimedia[0].url;
    }
    // Si no hay multimedia, usar el logo de la marca
    return product.brand?.logoUrl || '';
  };

  return (
    <Card 
      className="cursor-pointer border-2" 
      style={{ borderColor: product.color || '#e5e7eb' }}
      onClick={onClick}
    >
      <CardHeader>
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Si falla la carga de la imagen, mostrar el logo de la marca
              if (product.brand?.logoUrl) {
                e.target.src = product.brand.logoUrl;
              }
            }}
          />
        </div>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-col">
            <span>ID: {product.externalId}</span>
            <span>Marca: {product.brand?.name || 'Sin marca'}</span>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export function ProductsView() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      const filtered = products.filter(product => product.brand.id === selectedBrand);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedBrand, products]);

  const fetchProducts = async () => {
    try {
      const data = await getProductPreviews();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast.error("Error al cargar los productos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getAllBrands();
      setBrands(data);
    } catch (error) {
      toast.error("Error al cargar las marcas");
      console.error(error);
    }
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value === "all" ? null : parseInt(value));
  };

  const handleCardClick = (product) => {
    localStorage.setItem("selectedProductId", product.id);
    navigate("/producto-detalle");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="w-64">
          <Select value={selectedBrand?.toString() || "all"} onValueChange={handleBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => navigate("/nuevo-producto")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Agregar producto
        </button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CardComponent product={product} onClick={() => handleCardClick(product)} />
          </motion.div>
        ))}
      </div>
    </>
  );
}
