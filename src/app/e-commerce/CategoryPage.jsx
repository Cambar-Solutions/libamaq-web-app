import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import Nav2 from "@/components/Nav2";
import { simulatedProductsByBrand } from "@data/simulatedProducts";
import "@/styles/carousel-vanilla.css";
import { Link } from "react-router-dom";
import { getAllPublicProducts, getProductsByBrand, getProductsByCategoryAndBrand } from "@/services/public/productService";
import { getAllBrandsWithCategories } from "@/services/public/brandService";
import { toast } from "sonner";

const items = [
  {
    id: 1,
    name: "Auriculares Inalámbricos Bluetooth",
    shortDescription: "Auriculares con cancelación de ruido y micrófono",
    price: 1299,
    images: ["/images/auriculares.jpg"],
  },
  {
    id: 2,
    name: "Smartwatch Deportivo",
    shortDescription: "Reloj inteligente con monitoreo cardíaco Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, quibusdam aliquid laboriosam sit nobis soluta error accusantium vel sint fugit officiis rerum, expedita nisi, et impedit ut quis similique deserunt?",
    price: 2499,
    images: ["/images/smartwatch.jpg"],
  },
  {
    id: 3,
    name: "Teclado Mecánico RGB",
    shortDescription: "Teclado retroiluminado con switches azules",
    price: 1899,
    images: ["/images/teclado.jpg"],
  },
  {
    id: 4,
    name: "Cámara Web Full HD",
    shortDescription: "Webcam 1080p con micrófono integrado",
    price: 899,
    images: ["/images/webcam.jpg"],
  },
  {
    id: 5,
    name: "Altavoz Bluetooth Portátil",
    shortDescription: "Resistente al agua y con sonido envolvente",
    price: 1599,
    images: ["/images/altavoz.jpg"],
  },
  {
    id: 6,
    name: "Lámpara LED Escritorio",
    shortDescription: "Luz blanca regulable con puerto USB",
    price: 599,
    images: ["/images/lampara.jpg"],
  },
  {
    id: 7,
    name: "Mouse Gamer Inalámbrico",
    shortDescription: "Mouse con DPI ajustable y luces RGB",
    price: 799,
    images: ["/images/mouse.jpg"],
  },
  {
    id: 8,
    name: "Silla Ergonómica de Oficina",
    shortDescription: "Silla ajustable con soporte lumbar",
    price: 5599,
    images: ["/images/silla.jpg"],
  },
  {
    id: 9,
    name: "Tablet 10 Pulgadas",
    shortDescription: "Tablet con Android 12 y 64GB de almacenamiento",
    price: 7299,
    images: ["/images/tablet.jpg"],
  },
  {
    id: 10,
    name: "Monitor Curvo 27\"",
    shortDescription: "Monitor con resolución Full HD y 75Hz",
    price: 8799,
    images: ["/images/monitor.jpg"],
  }
];

// Función para obtener productos destacados de la API
const getFeaturedProducts = async () => {
  try {
    const response = await getAllPublicProducts();
    if (response && response.type === "SUCCESS" && Array.isArray(response.result)) {
      // Filtrar solo productos activos
      const activeProducts = response.result.filter(product => product.status === "ACTIVE");
      console.log(`Productos activos: ${activeProducts.length} de ${response.result.length}`);

      // Limitamos a 12 productos destacados
      return activeProducts.slice(0, 12);
    }
    return [];
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    toast.error("Error al cargar productos destacados");
    return [];
  }
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
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSellingProducts] = useState(getTopSellingProducts());
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCarouselControls, setShowCarouselControls] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para controlar la carga de imágenes y mostrar contenido
  const [carouselImagesLoaded, setCarouselImagesLoaded] = useState(false);
  const [productsImagesLoaded, setProductsImagesLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [totalImagesToLoad, setTotalImagesToLoad] = useState(0);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  // Estado para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [touchStart, setTouchStart] = useState(0);

  // Estados para el carrusel de productos más vendidos
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
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

  // Efecto para manejar el redimensionamiento y actualizar el estado del carrusel
  useEffect(() => {
    if (!topSellingProducts || topSellingProducts.length === 0) return;

    const handleResize = () => {
      // Resetear la posición del carrusel cuando cambia el tamaño de la ventana
      setCarouselPosition(0);
      setShowLeftArrow(false);

      // Calcular si debe mostrar la flecha derecha
      let itemWidth = 20; // Por defecto 5 items (20%)
      if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25; // 4 items
      else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333; // 3 items
      else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50; // 2 items
      else if (window.innerWidth < 640) itemWidth = 100; // 1 item

      const maxPosition = Math.max(0, (topSellingProducts.length * itemWidth) - 100);
      setShowRightArrow(maxPosition > 0);
    };

    // Inicializar el estado del carrusel
    handleResize();

    // Agregar event listener para el redimensionamiento
    window.addEventListener('resize', handleResize);

    // Limpiar event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [topSellingProducts]);

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

  // Función para manejar la carga de imágenes individuales
  const handleImageLoad = () => {
    setLoadedImagesCount(prev => {
      const newCount = prev + 1;
      console.log(`Imagen cargada: ${newCount}/${totalImagesToLoad}`);
      return newCount;
    });
  };

  // Efecto para verificar cuando todas las imágenes están cargadas
  useEffect(() => {
    if (loadedImagesCount > 0 && loadedImagesCount >= totalImagesToLoad) {
      console.log('Todas las imágenes han sido cargadas');
      setProductsImagesLoaded(true);
    }
  }, [loadedImagesCount, totalImagesToLoad]);

  // Efecto para mostrar el contenido cuando todas las imágenes estén cargadas
  useEffect(() => {
    if (carouselImagesLoaded && productsImagesLoaded) {
      console.log('Todas las imágenes del carrusel y productos están cargadas');
      // Añadir un pequeño retraso para asegurar una transición suave
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [carouselImagesLoaded, productsImagesLoaded]);

  // Cargar productos destacados al iniciar
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setIsLoading(true);
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);

        // Calcular el número total de imágenes a cargar (carrusel + productos)
        const totalImages = carouselImages.length + products.length;
        setTotalImagesToLoad(totalImages);
        console.log(`Total de imágenes a cargar: ${totalImages}`);
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
        // En caso de error, mostrar el contenido de todas formas
        setProductsImagesLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Cargar marcas con categorías
  useEffect(() => {
    const loadBrandsWithCategories = async () => {
      try {
        const response = await getAllBrandsWithCategories();
        if (response && response.type === "SUCCESS" && Array.isArray(response.result)) {
          // Filtrar solo marcas activas
          const activeBrands = response.result.filter(brand => brand.status === "ACTIVE");
          setAllBrands(activeBrands);

          // Extraer todas las categorías únicas de todas las marcas
          const allCatsSet = new Set();
          activeBrands.forEach(brand => {
            brand.categories.forEach(category => {
              if (category.status === "ACTIVE") {
                allCatsSet.add(category.name);
              }
            });
          });
          setAllCategories(Array.from(allCatsSet));
        }
      } catch (error) {
        console.error("Error al cargar marcas con categorías:", error);
        toast.error("Error al cargar marcas");
      }
    };

    loadBrandsWithCategories();
  }, []);

  // Efecto para manejar cambios en la marca seleccionada
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (brand) {
      // Buscar la marca seleccionada en allBrands
      const selectedBrand = allBrands.find(b => b.name.toLowerCase() === brand.toLowerCase());

      if (selectedBrand) {
        // Obtener categorías activas de la marca seleccionada
        const brandCategories = selectedBrand.categories
          .filter(cat => cat.status === "ACTIVE")
          .map(cat => cat.name);

        setAllCategories(brandCategories);
      }
    }
  }, [brand, allBrands]);

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

  // Cargar productos según los filtros seleccionados
  useEffect(() => {
    const loadFilteredProducts = async () => {
      if (!brand && !selectedCategory) {
        // Si no hay filtros, ya tenemos los productos destacados
        return;
      }

      setIsLoading(true);
      try {
        // Obtener el objeto de la marca seleccionada
        const selectedBrand = allBrands.find(b => b.name.toLowerCase() === brand?.toLowerCase());
        const brandId = selectedBrand?.id;

        if (!brandId) {
          console.log('No se encontró la marca seleccionada');
          setIsLoading(false);
          return;
        }

        let response;

        // Buscar la categoría seleccionada si existe
        if (selectedCategory) {
          const categoryObj = selectedBrand.categories.find(
            cat => cat.name.toLowerCase() === selectedCategory.toLowerCase()
          );
          const categoryId = categoryObj?.id;

          if (categoryId) {
            // Obtener productos por marca y categoría usando el endpoint específico
            console.log(`Buscando productos por marca ${brandId} y categoría ${categoryId}`);
            response = await getProductsByCategoryAndBrand(categoryId, brandId);
          } else {
            console.log(`Categoría ${selectedCategory} no encontrada para la marca ${selectedBrand.name}`);
            // Si la categoría no existe, mostrar productos de la marca
            response = await getProductsByBrand(brandId);
          }
        } else {
          // Obtener productos solo por marca usando el endpoint específico
          console.log(`Buscando productos por marca ${brandId}`);
          response = await getProductsByBrand(brandId);
        }

        if (response && response.type === "SUCCESS" && Array.isArray(response.result)) {
          console.log(`Productos encontrados: ${response.result.length}`);
          setFeaturedProducts(response.result);
        } else {
          console.log('No se encontraron productos o respuesta inválida');
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Error al cargar productos filtrados:", error);
        toast.error("Error al cargar productos");
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilteredProducts();
  }, [brand, selectedCategory, allBrands]);

  // Filtrar productos por término de búsqueda
  const filteredProducts = searchTerm
    ? featuredProducts.filter(
      item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : featuredProducts;

  // Si no se han cargado todas las imágenes, mostrar el LoadingScreen
  if (!showContent) {
    // Importamos el componente LoadingScreen
    const LoadingScreen = React.lazy(() => import('@/components/LoadingScreen'));

    // Renderizamos un div oculto con las imágenes del carrusel para precargarlas
    return (
      <>
        <React.Suspense fallback={<div></div>}>
          <LoadingScreen />
        </React.Suspense>

        {/* Div oculto para precargar imágenes */}
        <div className="hidden">
          {carouselImages.map((image) => (
            <img
              key={image.id}
              src={image.src}
              alt=""
              onLoad={() => {
                handleImageLoad();
                // Si es la última imagen del carrusel, marcar como cargado
                if (image.id === carouselImages[carouselImages.length - 1].id) {
                  setCarouselImagesLoaded(true);
                }
              }}
              onError={() => {
                handleImageLoad();
                if (image.id === carouselImages[carouselImages.length - 1].id) {
                  setCarouselImagesLoaded(true);
                }
              }}
            />
          ))}

          {/* Precargar imágenes de productos destacados */}
          {featuredProducts.slice(0, 8).map((product, index) => (
            <img
              key={`featured-${index}`}
              src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder-product.png"}
              alt=""
              onLoad={handleImageLoad}
              onError={handleImageLoad}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Nav2 />

      <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
        <div ref={sectionRef} className="max-w-7xl w-full mx-auto px-4">
          <div className="sticky top-20 z-10 bg-white shadow-xl rounded-lg mb-6 p-3">
            <div className="flex flex-row items-center gap-2">
              <div className="relative w-4/5">
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
                className="flex items-center justify-center w-1/5 gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-full transition-colors"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filtros</span>
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
                  : ' '}
            </h1>
          </div>

          <div className="w-full">
            {!brand && !category && (
              <div className="w-full mb-6 overflow-hidden">
                {/* NUEVA ZONA */}
                <div className="rounded-t-[3rem] px-12 pt-0 w-[95%] mx-auto flex-grow">
                  {!brand && !selectedCategory && !searchTerm && (
                    <>
                      <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-500">Los más vendidos</h2>
                          <button
                            className="text-blue-800 underline underline-offset-4 hover:text-indigo-800 hover:font-bold hover:transition-all hover:duration-200 hover:ease-in-out flex items-center cursor-pointer"
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
                          {/* Contenedor principal del carrusel con estilo minimalista */}
                          <div className="relative group">
                            {/* Contenedor del carrusel */}
                            <div className="carousel-container overflow-hidden px-0 sm:px-0 bg-white rounded-lg">
                              {/* Pista del carrusel */}
                              <div
                                className="carousel-track flex transition-transform duration-300 ease-out justify-start"
                                style={{ transform: `translateX(-${carouselPosition}%)` }}
                              >
                                {items.map((item, index) => (
                                  <div
                                    key={`top-${index}`}
                                    className="carousel-item flex-shrink-0 p-0 m-0 sm:px-0 md:px-0 hover:scale-103"
                                    style={{
                                      width: `${Math.max(
                                        20,
                                        window.innerWidth >= 1280 ? 20 : // 5 items
                                          window.innerWidth >= 1024 ? 25 : // 4 items
                                            window.innerWidth >= 768 ? 33.333 : // 3 items
                                              window.innerWidth >= 640 ? 50 : // 2 items
                                                100 // 1 item completo en móvil
                                      )}%`
                                    }}
                                  >
                                    <Link to={`/producto/${item.id}`} key={index} className="w-full hover:scale-103 p-0">
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-lg hover:shadow-md transition-all duration-500 overflow-hidden w-full cursor-pointer p-0"
                                      >
                                        {/* Diseño adaptativo: horizontal en móvil, vertical en tablet/desktop */}
                                        <div className="flex flex-row sm:flex-col w-full">
                                          {/* Imagen: 1/3 del ancho en móvil, altura completa en desktop */}
                                          <div className="w-1/3 sm:w-full h-28 sm:h-52 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
                                            {/* Fondo con patrón de imagen cuando no hay imagen disponible */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-12 h-12 border-2 border-gray-300 rounded-md flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                                              </div>
                                            </div>

                                            {/* La imagen real del producto */}
                                            <img
                                              src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder-product.png"}
                                              alt=""
                                              className="max-h-full max-w-full object-contain relative z-10"
                                              onError={(e) => {
                                                e.target.style.opacity = "0"; // Ocultar la imagen si no carga
                                              }}
                                            />
                                          </div>

                                          {/* Contenido: 2/3 del ancho en móvil, ancho completo en desktop */}
                                          <div className="w-2/3 sm:w-full p-3 sm:p-4 flex-grow flex flex-col justify-between sm:h-[150px]">
                                            <div>
                                              <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate" title={item.name}>{item.name}</h3>
                                              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2" title={item.shortDescription}>{item.shortDescription}</p>
                                            </div>
                                            {item.price && <p className="text-lg sm:text-2xl font-bold text-blue-700 mt-2 sm:mt-3">${item.price.toLocaleString()}</p>}
                                          </div>
                                        </div>
                                      </motion.div>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Botones de navegación simplificados */}
                            <>
                              {showLeftArrow && (
                                <button
                                  className="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer transition-opacity duration-300"
                                  onClick={() => {
                                    // Calcular el ancho de un item según el tamaño de pantalla
                                    let itemWidth = 20; // Por defecto 5 items (20%)
                                    if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25; // 4 items
                                    else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333; // 3 items
                                    else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50; // 2 items
                                    else if (window.innerWidth < 640) itemWidth = 100; // 1 item completo en móvil

                                    // Calcular nueva posición
                                    const newPosition = Math.max(0, carouselPosition - itemWidth);
                                    setCarouselPosition(newPosition);

                                    // Actualizar visibilidad de flechas
                                    setShowLeftArrow(newPosition > 0);
                                    setShowRightArrow(true);
                                  }}
                                  aria-label="Anterior"
                                >
                                  <ChevronLeft className="text-blue-600" size={20} />
                                </button>
                              )}

                              {showRightArrow && (
                                <button
                                  className="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer transition-opacity duration-300"
                                  onClick={() => {
                                    // Calcular el ancho de un item según el tamaño de pantalla
                                    let itemWidth = 20; // Por defecto 5 items (20%)
                                    if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25; // 4 items
                                    else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333; // 3 items
                                    else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50; // 2 items
                                    else if (window.innerWidth < 640) itemWidth = 100; // 1 item completo en móvil

                                    // Calcular nueva posición y límite máximo
                                    const maxPosition = Math.max(0, (topSellingProducts.length * itemWidth) - 100);
                                    const newPosition = Math.min(maxPosition, carouselPosition + itemWidth);
                                    setCarouselPosition(newPosition);

                                    // Actualizar visibilidad de flechas
                                    setShowLeftArrow(true);
                                    setShowRightArrow(newPosition < maxPosition);
                                  }}
                                  aria-label="Siguiente"
                                >
                                  <ChevronRight className="text-blue-600" size={20} />
                                </button>
                              )}
                            </>
                          </div>

                          {/* Carrusel con diseño de fila flexible */}

                        </div>
                      </div>

                    </>
                  )}
                </div>

              </div>
            )}
          </div>
          <div className="bg-gray-100 max-w-7xl rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full mx-auto flex-grow">
            {/* Contenedor principal con ancho ajustado */}
            <div className="w-full mx-auto">
              {items.length > 0 ? (
                <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-500">Todos los productos</h2>
                        </div>

                        <div className="mb-10">
                          {/* Contenedor principal del carrusel con estilo minimalista */}
                          <div className="relative group">
                            {/* Contenedor del carrusel */}
                            <div className="carousel-container overflow-hidden px-0 sm:px-0 bg-white rounded-lg">
                              {/* Pista del carrusel */}
                              <div
                                className="carousel-track flex transition-transform duration-300 ease-out justify-start"
                                style={{ transform: `translateX(-${carouselPosition}%)` }}
                              >
                                {items.map((item, index) => (
                                  <div
                                    key={`top-${index}`}
                                    className="carousel-item flex-shrink-0 p-0 m-0 sm:px-0 md:px-0 hover:scale-103"
                                    style={{
                                      width: `${Math.max(
                                        20,
                                        window.innerWidth >= 1280 ? 20 : // 5 items
                                          window.innerWidth >= 1024 ? 25 : // 4 items
                                            window.innerWidth >= 768 ? 33.333 : // 3 items
                                              window.innerWidth >= 640 ? 50 : // 2 items
                                                100 // 1 item completo en móvil
                                      )}%`
                                    }}
                                  >
                                    <Link to={`/producto/${item.id}`} key={index} className="w-full hover:scale-103 p-0">
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-lg hover:shadow-md transition-all duration-500 overflow-hidden w-full cursor-pointer p-0"
                                      >
                                        {/* Diseño adaptativo: horizontal en móvil, vertical en tablet/desktop */}
                                        <div className="flex flex-row sm:flex-col w-full">
                                          {/* Imagen: 1/3 del ancho en móvil, altura completa en desktop */}
                                          <div className="w-1/3 sm:w-full h-28 sm:h-52 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
                                            {/* Fondo con patrón de imagen cuando no hay imagen disponible */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-12 h-12 border-2 border-gray-300 rounded-md flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                                              </div>
                                            </div>

                                            {/* La imagen real del producto */}
                                            <img
                                              src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder-product.png"}
                                              alt=""
                                              className="max-h-full max-w-full object-contain relative z-10"
                                              onError={(e) => {
                                                e.target.style.opacity = "0"; // Ocultar la imagen si no carga
                                              }}
                                            />
                                          </div>

                                          {/* Contenido: 2/3 del ancho en móvil, ancho completo en desktop */}
                                          <div className="w-2/3 sm:w-full p-3 sm:p-4 flex-grow flex flex-col justify-between sm:h-[150px]">
                                            <div>
                                              <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate" title={item.name}>{item.name}</h3>
                                              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2" title={item.shortDescription}>{item.shortDescription}</p>
                                            </div>
                                            {item.price && <p className="text-lg sm:text-2xl font-bold text-blue-700 mt-2 sm:mt-3">${item.price.toLocaleString()}</p>}
                                          </div>
                                        </div>
                                      </motion.div>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Botones de navegación simplificados */}
                            <>
                              {showLeftArrow && (
                                <button
                                  className="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer transition-opacity duration-300"
                                  onClick={() => {
                                    // Calcular el ancho de un item según el tamaño de pantalla
                                    let itemWidth = 20; // Por defecto 5 items (20%)
                                    if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25; // 4 items
                                    else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333; // 3 items
                                    else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50; // 2 items
                                    else if (window.innerWidth < 640) itemWidth = 100; // 1 item completo en móvil

                                    // Calcular nueva posición
                                    const newPosition = Math.max(0, carouselPosition - itemWidth);
                                    setCarouselPosition(newPosition);

                                    // Actualizar visibilidad de flechas
                                    setShowLeftArrow(newPosition > 0);
                                    setShowRightArrow(true);
                                  }}
                                  aria-label="Anterior"
                                >
                                  <ChevronLeft className="text-blue-600" size={20} />
                                </button>
                              )}

                              {showRightArrow && (
                                <button
                                  className="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer transition-opacity duration-300"
                                  onClick={() => {
                                    // Calcular el ancho de un item según el tamaño de pantalla
                                    let itemWidth = 20; // Por defecto 5 items (20%)
                                    if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25; // 4 items
                                    else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333; // 3 items
                                    else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50; // 2 items
                                    else if (window.innerWidth < 640) itemWidth = 100; // 1 item completo en móvil

                                    // Calcular nueva posición y límite máximo
                                    const maxPosition = Math.max(0, (topSellingProducts.length * itemWidth) - 100);
                                    const newPosition = Math.min(maxPosition, carouselPosition + itemWidth);
                                    setCarouselPosition(newPosition);

                                    // Actualizar visibilidad de flechas
                                    setShowLeftArrow(true);
                                    setShowRightArrow(newPosition < maxPosition);
                                  }}
                                  aria-label="Siguiente"
                                >
                                  <ChevronRight className="text-blue-600" size={20} />
                                </button>
                              )}
                            </>
                          </div>

                          {/* Carrusel con diseño de fila flexible */}

                        </div>
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