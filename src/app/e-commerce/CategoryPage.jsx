import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, ChevronRight } from "lucide-react";
import Nav2 from "@/components/Nav2";

// Importamos los productos simulados
import { simulatedProductsByBrand } from "@data/simulatedProducts";

// Función para obtener productos destacados de todas las marcas
const getFeaturedProducts = () => {
  const featured = [];
  Object.keys(simulatedProductsByBrand).forEach(brandKey => {
    const brand = simulatedProductsByBrand[brandKey];
    Object.keys(brand).forEach(categoryKey => {
      const products = brand[categoryKey];
      // Tomamos el primer producto de cada categoría como destacado
      if (products && products.length > 0) {
        featured.push({
          ...products[0],
          brand: brandKey,
          category: categoryKey
        });
        // Limitamos a 12 productos destacados en total
        if (featured.length >= 12) return;
      }
    });
  });
  return featured;
};

// Función para obtener productos más vendidos (simulados)
const getTopSellingProducts = () => {
  const topSelling = [];
  const brands = Object.keys(simulatedProductsByBrand);
  
  // Seleccionamos algunos productos aleatoriamente para simular los más vendidos
  for (let i = 0; i < 8; i++) {
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const categories = Object.keys(simulatedProductsByBrand[randomBrand]);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const products = simulatedProductsByBrand[randomBrand][randomCategory];
    
    if (products && products.length > 0) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      topSelling.push({
        ...randomProduct,
        brand: randomBrand,
        category: randomCategory,
        price: Math.floor(Math.random() * 10000) + 1000 // Precio aleatorio entre 1000 y 11000
      });
    }
  }
  
  return topSelling;
};

export default function CategoryPage() {
  const { brand, category } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [featuredProducts] = useState(getFeaturedProducts());
  const [topSellingProducts] = useState(getTopSellingProducts());
  const [allCategories, setAllCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Si tenemos una marca seleccionada, obtenemos sus categorías
    if (brand) {
      const brandData = simulatedProductsByBrand[brand.toLowerCase()];
      if (brandData) {
        setAllCategories(Object.keys(brandData));
      }
    } else {
      // Si no hay marca seleccionada, mostramos categorías generales
      const allCats = new Set();
      Object.values(simulatedProductsByBrand).forEach(brandData => {
        Object.keys(brandData).forEach(cat => allCats.add(cat));
      });
      setAllCategories([...allCats]);
    }
  }, [brand]);

  // Actualizar la categoría seleccionada cuando cambia en la URL
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const handleBack = () => navigate(-1);

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    if (brand) {
      navigate(`/productos/${brand}/${newCategory}`);
    } else {
      navigate(`/productos/categoria/${newCategory}`);
    }
  };

  // Obtener productos según la selección actual
  const getDisplayProducts = () => {
    if (brand && selectedCategory) {
      return simulatedProductsByBrand[brand.toLowerCase()]?.[selectedCategory] || [];
    } else if (brand) {
      // Si solo hay marca seleccionada, mostramos todos sus productos
      const allProducts = [];
      const brandData = simulatedProductsByBrand[brand.toLowerCase()];
      if (brandData) {
        Object.values(brandData).forEach(products => {
          allProducts.push(...products);
        });
      }
      return allProducts;
    } else if (selectedCategory) {
      // Si solo hay categoría seleccionada, mostramos productos de esa categoría de todas las marcas
      const categoryProducts = [];
      Object.keys(simulatedProductsByBrand).forEach(brandKey => {
        const products = simulatedProductsByBrand[brandKey][selectedCategory];
        if (products) {
          products.forEach(product => {
            categoryProducts.push({
              ...product,
              brand: brandKey
            });
          });
        }
      });
      return categoryProducts;
    }
    
    // Si no hay filtros, mostramos productos destacados
    return featuredProducts;
  };

  const displayProducts = getDisplayProducts();
  
  // Filtrar por término de búsqueda si existe
  const filteredProducts = searchTerm ? displayProducts.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
  ) : displayProducts;

  return (
    <>
      <Nav2 />

      <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
        {/* Banner promocional */}
        {!brand && !category && (
          <div className="w-full bg-blue-600 text-white py-8 px-4 mb-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 md:mr-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Ofertas especiales en herramientas</h2>
                <p className="text-blue-100">Hasta 30% de descuento en productos seleccionados</p>
              </div>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 px-6 rounded-full transition-colors">
                Ver ofertas
              </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl w-full mx-auto px-4">
          {/* Barra de búsqueda y filtros */}
          <div className="sticky top-16 z-10 bg-white shadow-md rounded-lg mb-6 p-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center md:justify-start gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-full transition-colors"
              >
                <Filter size={18} />
                <span>Filtros</span>
              </button>
              
              {brand && (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center md:justify-start gap-2 text-blue-600 py-2 px-4 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Volver</span>
                </button>
              )}
            </div>
            
            {/* Panel de filtros */}
            {showFilters && (
              <div className="mt-3 p-3 border-t border-gray-200">
                <h3 className="font-medium mb-2">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {cat.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Título de la página */}
          <div className="mb-6">
            {brand && selectedCategory ? (
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {brand.charAt(0).toUpperCase() + brand.slice(1)} - {selectedCategory.replace(/-/g, ' ')}
              </h1>
            ) : brand ? (
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Productos {brand.charAt(0).toUpperCase() + brand.slice(1)}
              </h1>
            ) : selectedCategory ? (
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {selectedCategory.replace(/-/g, ' ')}
              </h1>
            ) : (
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Productos destacados
              </h1>
            )}
          </div>

          {/* Contenedor de productos */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
              {filteredProducts.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                >
                  <div className="h-28 bg-gray-100 flex items-center justify-center p-4">
                    <img 
                      src="/placeholder-product.png"
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-3 flex-grow flex flex-col h-[160px]">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 truncate" title={item.title}>{item.title}</h3>
                      <p className="text-sm text-gray-500 truncate" title={item.text}>{item.text}</p>
                    </div>
                    {item.price && (
                      <p className="text-xl font-bold text-blue-700 mb-2">${item.price.toLocaleString()}</p>
                    )}
                    <div className="mt-auto">
                      <button className="w-full py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver todos los productos
              </button>
            </div>
          )}

          {/* Sección de productos más vendidos (solo en la página principal) */}
          {!brand && !selectedCategory && !searchTerm && (
            <div className="mt-8 mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Los más vendidos</h2>
                <button className="text-blue-600 hover:text-blue-800 flex items-center">
                  Ver todos <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {topSellingProducts.map((item, index) => (
                  <motion.div
                    key={`top-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center p-4 relative">
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">TOP</div>
                      <img 
                        src="/placeholder-product.png"
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-3 flex-grow flex flex-col h-[180px]">
                      <div>
                        <p className="text-xs text-blue-600 uppercase font-semibold truncate" title={item.brand}>{item.brand}</p>
                        <h3 className="text-lg font-medium text-gray-800 truncate" title={item.title}>{item.title}</h3>
                        <p className="text-sm text-gray-500 truncate" title={item.text}>{item.text}</p>
                      </div>
                      <p className="text-xl font-bold text-blue-700 mb-2">${item.price.toLocaleString()}</p>
                      <div className="mt-auto">
                        <button className="w-full py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
