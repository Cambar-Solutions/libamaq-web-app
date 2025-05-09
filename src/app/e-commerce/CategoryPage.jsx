import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import Nav2 from "@/components/Nav2";
import { simulatedProductsByBrand } from "@data/simulatedProducts";
import "@/styles/carousel-vanilla.css";
import { Link } from "react-router-dom";



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
  const carouselRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const { brand, category } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [featuredProducts] = useState(getFeaturedProducts());
  const [topSellingProducts] = useState(getTopSellingProducts());
  const [allCategories, setAllCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCarouselControls, setShowCarouselControls] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Estado para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Imágenes de ejemplo para el carrusel (puedes reemplazarlas con tus propias imágenes)
  const carouselImages = [
    { src: "/promocionBosch.png", alt: "Promoción Bosch", id: 1 },
    { src: "/promocionMakita.png", alt: "Promoción Makita", id: 2 },
    { src: "/promocionHusqvarna.png", alt: "Promoción Husqvarna", id: 3 },
  
  ];

  // Función para navegar al siguiente slide
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  }, [carouselImages.length]);

  // Función para navegar al slide anterior
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  }, [carouselImages.length]);

  // Configurar autoplay
  useEffect(() => {
    if (!autoplayEnabled) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplayEnabled, nextSlide]);

  // Estado para detectar si estamos en dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Comprobar al inicio
    checkIfMobile();
    
    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Manejo de eventos táctiles mejorado para deslizar en dispositivos móviles
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    // Desactivar autoplay al interactuar con el carrusel
    setAutoplayEnabled(false);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Prevenir el desplazamiento de la página mientras se desliza el carrusel
    if (Math.abs(touchStart - e.targetTouches[0].clientX) > 10) {
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = () => {
    // Umbral más bajo para dispositivos móviles (50px en lugar de 75px)
    const threshold = isMobile ? 50 : 75;
    
    if (touchStart - touchEnd > threshold) {
      // Deslizar a la izquierda (siguiente slide)
      nextSlide();
    } else if (touchStart - touchEnd < -threshold) {
      // Deslizar a la derecha (slide anterior)
      prevSlide();
    }
    
    // Reactivar autoplay después de 5 segundos de inactividad
    setTimeout(() => {
      setAutoplayEnabled(true);
    }, 5000);
  };

  // Configurar autoplay si es necesario
  useEffect(() => {
    // Solo configurar autoplay si hay contenido que no es visible
    if (!showCarouselControls) return;

    // Crear intervalo para autoplay
    const interval = setInterval(() => {
      handleCarouselNav('next');
    }, 5000);

    // Limpiar al desmontar
    return () => clearInterval(interval);
  }, [showCarouselControls, scrollPosition, maxScroll]);

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

  // helper de scroll suave con duración de 800ms

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
          <div className="w-full bg-gradient-to-t from-gray-50 via-blue-200 to-blue-600 text-white mb-6 overflow-hidden">
            {/* CARRUSEL FULLWIDTH MEJORADO */}
            <div className="max-w-5xl mx-auto px-4 md:px-16 relative">
              {/* Controles de navegación fuera de la imagen - ocultos en móvil */}
              {!isMobile && (
                <>
                  <button 
                    onClick={prevSlide} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-transparent text-blue-600 hover:text-blue-800 p-2 transition-all duration-200 hidden md:block"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  
                  <button 
                    onClick={nextSlide} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-transparent text-blue-600 hover:text-blue-800 p-2 transition-all duration-200 hidden md:block"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
              
              <div 
                className="relative w-full overflow-hidden h-[300px] md:h-[400px] rounded-lg shadow-lg mx-auto mt-6"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
              {/* Contenedor de slides */}
              <div className="flex h-full w-full relative mx-auto">
                {carouselImages.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`absolute  w-full h-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                      <div className="w-full h-full">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                  </div>
                ))}
              </div>
              

              
              {/* Indicadores de posición minimalistas - más pequeños en móvil */}
              <div className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-6 md:w-8 h-1 transition-all duration-300 ${index === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Ir a slide ${index + 1}`}
                  />
                ))}
              </div>
              </div>
            </div>

            {/* NUEVA ZONA */}
            <div className="rounded-t-[3rem] px-12 pt-8 w-[95%] mx-auto flex-grow">
              {!brand && !selectedCategory && !searchTerm && (
                <>
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-100">Los más vendidos</h2>
                      <button
                        className="text-white underline underline-offset-4 hover:text-indigo-800 hover:font-bold hover:transition-all hover:duration-200 hover:ease-in-out flex items-center cursor-pointer"
                        onClick={() => {
                          // limpia búsqueda si quieres
                          setSearchTerm("");
                          // hace scroll al contenedor
                          scrollToSection();
                        }}
                      > Ver todos <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="mb-10">
                      {/* Contenedor principal del carrusel con espacio para los botones */}
                      <div className="relative group" ref={carouselRef}>
                        {/* Contenedor del carrusel con padding lateral para los botones */}
                        <div className="carousel-container overflow-hidden px-14">
                          {/* Pista del carrusel */}
                          <div
                            ref={carouselTrackRef}
                            className="carousel-track flex transition-transform duration-500 ease-out pb-10 pt-2"
                            style={{ transform: `translateX(0px)` }}
                          >
                            {topSellingProducts.map((item, index) => (
                              <motion.div
                                key={`top-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="carousel-item flex-shrink-0 px-2"
                                style={{
                                  width: `${Math.max(
                                    20,
                                    window.innerWidth >= 1280 ? 20 : // 5 items
                                      window.innerWidth >= 1024 ? 25 : // 4 items
                                        window.innerWidth >= 768 ? 33.333 : // 3 items
                                          window.innerWidth >= 640 ? 50 : // 2 items
                                            100 // 1 item
                                  )}%`
                                }}
                              >
                                <Link href={`/detalle/${item.id}`} className="block h-full">
                                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full hover:-translate-y-1 duration-200 cursor-pointer">
                                    <div className="h-52 bg-gray-100 flex items-center justify-center p-4 relative">
                                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">TOP</div>
                                      <img src="/placeholder-product.png" alt={item.title} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <div className="p-3 flex-grow flex flex-col h-[150px]">
                                      <div>
                                        <p className="text-xs text-blue-600 uppercase font-semibold truncate" title={item.brand}>{item.brand}</p>
                                        <h3 className="text-lg font-medium text-gray-800 truncate" title={item.title}>{item.title}</h3>
                                        <p className="text-sm text-gray-500 truncate" title={item.text}>{item.text}</p>
                                      </div>
                                      <p className="text-xl font-bold text-blue-700 mt-2">${item.price.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Botones de navegación fuera del contenedor del carrusel pero dentro del grupo */}
                        {showCarouselControls && (
                          <>
                            <button
                              className="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              onClick={() => handleCarouselNav('prev')}
                              aria-label="Anterior"
                            >
                              <ChevronLeft className="text-blue-600" size={20} />
                            </button>
                            <button
                              className="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              onClick={() => handleCarouselNav('next')}
                              aria-label="Siguiente"
                            >
                              <ChevronRight className="text-blue-600" size={20} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Carrusel con diseño de fila flexible */}

                    </div>
                  </div>

                </>
              )}
            </div>

          </div>
        )}
        <div ref={sectionRef} className="max-w-7xl w-full  mx-auto px-4">
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
          <div className="mb-6 mt-8 w-full">
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
          <div className="bg-gray-100 rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full mx-auto flex-grow">
            {/* Contenedor principal con ancho ajustado */}
            <div className="w-full mx-auto">
              {filteredProducts.length > 0 ? (
                <div className="cursor-pointer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 mb-8">
                  {filteredProducts.map((item, index) => (
                    <Link href={`/detalle/${item.id}`} key={index} className="w-full">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col mx-auto w-full cursor-pointer"
                      >
                        {/* Imagen más larga: cambiamos de h-36 a h-52 (o ajusta según prefieras) */}
                        <div className="h-52 bg-gray-100 flex items-center justify-center p-4">
                          <img src="/placeholder-product.png" alt={item.title} className="max-h-full max-w-full object-contain" />
                        </div>

                        <div className="p-4 flex-grow flex flex-col h-[150px]">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800 truncate" title={item.title}>{item.title}</h3>
                            <p className="text-sm text-gray-500 truncate" title={item.text}>{item.text}</p>
                          </div>
                          {item.price && <p className="text-xl font-bold text-blue-700 mt-3">${item.price.toLocaleString()}</p>}
                        </div>
                      </motion.div>
                    </Link>
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