import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, ChevronRight } from "lucide-react";
import Nav2 from "@/components/Nav2";
import { simulatedProductsByBrand } from "@data/simulatedProducts";

// JSON con los detalles de marca y sus categorías
const brandDetails = {
  bosch: {
    name: "Bosch",
    description: "Líder mundial en herramientas eléctricas profesionales y accesorios. Bosch ofrece soluciones innovadoras y de alta calidad para todo tipo de aplicaciones.",
    products: [
      "Rotomartillos y taladros",
      "Amoladoras",
      "Herramienta para madera",
      "Herramientas de medición",
      "Herramienta a Bateria 12V y 18V",
      "Limpieza y jardineria"
    ],
    image: "/logo_bosch.png",
  },
  makita: {
    name: "Makita",
    description: "Reconocida por su durabilidad y rendimiento excepcional. Makita ofrece una amplia gama de herramientas eléctricas y accesorios para profesionales.",
    products: [
      "Taladros inalámbricos",
      "Amoladoras",
      "Herramienta para madera",
      "Herramientas de medición",
      "Herramienta a Bateria 12V y 18V ",
      "Limpieza y jardineria"
    ],
    image: "/makita.png",
  },
  husqvarna: {
    name: "Husqvarna",
    description: "Especialistas en equipos para exteriores y construcción. Husqvarna combina potencia y precisión en cada una de sus herramientas.",
    products: [
      "Cortadoras de concreto",
      "Apisonadoras o bailarinas",
      "Placas Vibratorias",
      "Rodillos Vibratorios",
      "Desbaste y pulido de concreto",
      "Barrenadores",
      "Accesorios y Herramientas de diamante"
    ],
    image: "/husq.png",
  },
  honda: {
    name: "Honda",
    description: "Líder en motores y equipos de fuerza. Honda ofrece productos confiables y eficientes para diversas aplicaciones.",
    products: [
      "Generadores",
      "Motobombas 2 y 3 pulgadas ",
      "Motores de 6.5hp, 9hp y 14hp"
    ],
    image: "/honda-fuerza.png",
  },
  marshalltown: {
    name: "Marshalltown",
    description: "Expertos en herramientas manuales para construcción. Marshalltown es sinónimo de calidad y precisión en el acabado.",
    products: [
      "Llanas tipo avión",
      "Llanas tipo fresno",
      "Texturizadores 1/2, 3/4 y 1 pulgada",
      "Regla Vibratoria",
      "Llanas Manuales",
      "Orilladores",
      "Barredoras de concreto",
      "Cortadores de concreto"
    ],
    image: "/marshalltown.png",
  },
  mpower: {
    name: "Mpower",
    description: "Innovación y calidad en herramientas eléctricas. Mpower ofrece soluciones efectivas para profesionales y entusiastas.",
    products: [
      "Motores a gasolina 6.5, 9, 15hp.",
      "Motobombas 2 y 3 pulgadas.",
      "Generadores de luz de 3,500w a 8000w.",
      "Soldadora 200 A.",
      "Discos de 14 in para corte de concreto",
      "Accesorios"
    ],
    image: "/m-power.webp",
  },
  cipsa: {
    name: "Cipsa",
    description: "Cipsa es especialistas en herramientas y maquinaria para construcción.",
    products: [
      "Revolvedoras para concreto de 1 y 2 sacos",
      "Vibradores a gasolina para concreto",
      "Rodillos Vibratorios",
      "Apisonadores o bailarinas",
      "Torres de ilumiación",
      "Soldadoras",
      "Bombas para concreto"
    ],
    image: "/cipsa.avif",
  }
};

// Funciones auxiliares
const getFeaturedProducts = () => {
  const featured = [];
  Object.keys(simulatedProductsByBrand).forEach(brandKey => {
    const brand = simulatedProductsByBrand[brandKey];
    Object.keys(brand).forEach(categoryKey => {
      const products = brand[categoryKey];
      if (products && products.length > 0 && featured.length < 12) {
        featured.push({
          ...products[0],
          brand: brandKey,
          category: categoryKey
        });
      }
    });
  });
  return featured;
};

const getTopSellingProducts = () => {
  const topSelling = [];
  const brands = Object.keys(simulatedProductsByBrand);
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
        price: Math.floor(Math.random() * 10000) + 1000
      });
    }
  }
  return topSelling;
};

export default function CategoryPage() {
  const sectionRef = useRef(null);
  // helper de scroll suave con duración de 800ms
  const scrollToSection = () => {
    if (!sectionRef.current) return;
    const targetY = sectionRef.current.getBoundingClientRect().top + window.pageYOffset - 16; // compensar sticky si hiciera falta
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    const duration = 800;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const time = timestamp - startTime;
      const t = Math.min(time / duration, 1);
      window.scrollTo(0, startY + diff * t);
      if (time < duration) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

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
    // Configurar categorías basadas en simulatedProductsByBrand para asegurar keys válidas
    const key = brand ? brand.toLowerCase() : null;
    if (key && simulatedProductsByBrand[key]) {
      // Solo categorías de la marca seleccionada
      setAllCategories(Object.keys(simulatedProductsByBrand[key]));
    } else {
      // Todas las categorías de todas las marcas sin duplicados
      const allCatsSet = new Set();
      Object.values(simulatedProductsByBrand).forEach(brandData => {
        Object.keys(brandData).forEach(catKey => allCatsSet.add(catKey));
      });
      setAllCategories(Array.from(allCatsSet));
    }
  }, [brand]);

  useEffect(() => {
    if (category) setSelectedCategory(category);
  }, [category]);

  // Manejadores de navegación y filtros
  const handleBack = () => navigate("/tienda");
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    if (brand) {
      navigate(`/productos/${brand}/${encodeURIComponent(newCategory)}`);
    } else {
      navigate(`/productos/categoria/${encodeURIComponent(newCategory)}`);
    }
  };

  // Obtener lista de productos a mostrar según filtros
  const getDisplayProducts = () => {
    const key = brand ? brand.toLowerCase() : null;
    const isBrand = key && simulatedProductsByBrand[key];
    if (isBrand && selectedCategory) {
      // Categoría dentro de una marca válida
      return simulatedProductsByBrand[key][selectedCategory] || [];
    } else if (isBrand) {
      // Página de marca sin categoría específica
      return Object.values(simulatedProductsByBrand[key] || {}).flat();
    } else if (selectedCategory) {
      // Filtro general: categoría buscada en todas las marcas
      return Object.entries(simulatedProductsByBrand).flatMap(
        ([brandKey, brandData]) => {
          const products = brandData[selectedCategory] || [];
          return products.map(item => ({ ...item, brand: brandKey }));
        }
      );
    }
    // Sin filtros: productos destacados
    return featuredProducts;
  };

  const displayProducts = getDisplayProducts();
  const filteredProducts = searchTerm
    ? displayProducts.filter(
      item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : displayProducts;

  return (
    <>
      <Nav2 />

      <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
        {!brand && !category && (
          <div className="w-full bg-gradient-to-t from-gray-50 via-blue-200 to-blue-600 text-white pt-8 px-4 mb-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 md:mr-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Ofertas especiales en herramientas</h2>
                <p className="text-blue-50">Hasta 30% de descuento en productos seleccionados</p>
              </div>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-600 hover:text-white font-bold py-2 px-6 rounded-full transition-colors">
                Ver ofertas
              </button>
            </div>

            {/* NUEVA ZONA */}
            <div className="rounded-t-[3rem] px-12 pt-14 w-[95%] mx-auto flex-grow">
              {!brand && !selectedCategory && !searchTerm && (
                <>
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-100">Los más vendidos</h2>
                      <button
                        className="text-white hover:text-indigo-800 hover:font-semibold hover:transition-all hover:duration-300 hover:ease-in-out flex items-center"
                        onClick={() => {
                          // limpia búsqueda si quieres
                          setSearchTerm("");
                          // hace scroll al contenedor
                          scrollToSection();
                        }}
                      > Ver todos <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {topSellingProducts.map((item, index) => (
                        <motion.div
                          key={`top-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                        >
                          <div className="h-40 bg-gray-100 flex items-center justify-center p-4 relative">
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">TOP</div>
                            <img src="/placeholder-product.png" alt={item.title} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="p-3 flex-grow flex flex-col h-[180px]">
                            <div>
                              <p className="text-xs text-blue-600 uppercase font-semibold truncate" title={item.brand}>{item.brand}</p>
                              <h3 className="text-lg font-medium text-gray-800 truncate" title={item.title}>{item.title}</h3>
                              <p className="text-sm text-gray-500 truncate" title={item.text}>{item.text}</p>
                            </div>
                            <p className="text-xl font-bold text-blue-700 mb-2">${item.price.toLocaleString()}</p>
                            <button className="w-full py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm mt-auto">Ver detalles</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </>
              )}
            </div>

          </div>
        )}
        <div ref={sectionRef} className="max-w-6xl w-full mx-auto px-4">
          <div className="sticky top-16 z-10 bg-white shadow-md rounded-lg mb-6 p-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                  <span>Regresar</span>
                </button>
              )}
            </div>
            {showFilters && (
              <div className="mt-3 p-3 border-t border-gray-200">
                <h3 className="font-medium mb-2">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => (
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
          <div className="mb-6 mt-16">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {brand
                ? selectedCategory
                  ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${selectedCategory.replace(/-/g, ' ')}`
                  : `Productos ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
                : selectedCategory
                  ? selectedCategory.replace(/-/g, ' ')
                  : 'Productos destacados'}
            </h1>
          </div>
          <div className="bg-gray-100 rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-[95%] mx-auto flex-grow">
            {/* AQUÍ ESTABA */}
            <div>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                  {filteredProducts.map((item, index) => (
                    <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                      <div className="h-28 bg-gray-100 flex items-center justify-center p-4">
                        <img src="/placeholder-product.png" alt={item.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="p-3 flex-grow flex flex-col h-[160px]">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 truncate" title={item.title}>{item.title}</h3>
                          <p className="text-sm text-gray-500 truncate" title={item.text}>{item.text}</p>
                        </div>
                        {item.price && <p className="text-xl font-bold text-blue-700 mb-2">${item.price.toLocaleString()}</p>}
                        <button className="w-full py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm mt-auto">Ver detalles</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
                  <button onClick={() => setSearchTerm('')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Ver todos los productos</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}