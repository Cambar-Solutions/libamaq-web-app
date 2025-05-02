import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProductPreviews } from "@/services/admin/productService";
import { getAllBrands } from "@/services/admin/brandService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CardComponent = ({ product, onClick }) => {
  const getImageUrl = () => {
    if (product.multimedia && product.multimedia.length > 0) {
      return product.multimedia[0].url;
    }
    return product.brand?.logoUrl || "";
  };

  const bg = product.color || "#e5e7eb";

  return (
    <Card
      onClick={onClick}
      className="
        cursor-pointer
        filter grayscale-[40%] hover:grayscale-0
        transition-filter duration-500
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
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-col text-white">
            <span>ID: {product.externalId}</span>
            <span>Marca: {product.brand?.name || "Sin marca"}</span>
          </div>
        </CardDescription>
      </div>
    </Card>
  );
};


export function ProductsView() {
  const navigate = useNavigate();

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

    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand.id === selectedBrand);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.externalId.toLowerCase().includes(lower)
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedBrand, searchTerm]);

  const fetchProducts = async () => {
    try {
      const [productsData, brandsData] = await Promise.all([
        getProductPreviews(),
        getAllBrands(),
      ]);
      setBrands(brandsData);
      const withBrand = productsData.map((prod) => ({
        ...prod,
        brand: brandsData.find((b) => b.id === prod.brandId),
      }));
      setProducts(withBrand);
      setFilteredProducts(withBrand);
    } catch (err) {
      toast.error("Error al cargar productos o marcas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getAllBrands();
      setBrands(data);
    } catch (err) {
      toast.error("Error al cargar las marcas");
      console.error(err);
    }
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value === "all" ? null : parseInt(value, 10));
  };

  const handleCardClick = (product) => {
    localStorage.setItem("selectedProductId", product.id);
    navigate("/producto-detalle");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Controles de filtro y búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 ">
          {/* Select de marcas */}
          <div className="w-full sm:w-64">
            <Select
              value={selectedBrand?.toString() || "all"}
              onValueChange={handleBrandChange}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()} className="cursor-pointer">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Barra de búsqueda */}
          <div className="w-3/4 sm:flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Botón de agregar producto */}
        <div className="w-full md:w-auto">
        <button
            onClick={() => navigate("/nuevo-producto")}
            className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            + Agregar producto
          </button>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            />
          </motion.div>
        ))}
      </div>
    </>
  );
}