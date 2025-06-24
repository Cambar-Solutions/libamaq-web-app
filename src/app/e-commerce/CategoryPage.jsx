import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import Nav2 from "@/components/Nav2";
import { simulatedProductsByBrand } from "@data/simulatedProducts";
import "@/styles/carousel-vanilla.css";
import { Link } from "react-router-dom";
import { getTopSellingProductss, getActiveProductPreviews, getProductsByCategoryAndBrand, getProductsByBrand } from "@/services/public/productService";
import { getAllBrandsWithCategories } from "@/services/public/brandService";
import ProductImageWithFallback from "./ProductImageWithFallback";

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

// Importamos el componente LoadingScreen
const LoadingScreen = React.lazy(() => import('@/components/LoadingScreen'));

export default function CategoryPage() {
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { brand, category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSellingProducts] = useState(getTopSellingProducts());
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
  const [carouselPositionTwo, setCarouselPositionTwo] = useState(0);
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
    setCurrentSlide(
      // (prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1)
    );
  }, [carouselImages.length]);

  // Función para navegar al slide anterior
  const prevSlide = useCallback(() => {
    setCurrentSlide(
      // (prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1)
    );
  }, [carouselImages.length]);

  // Obtener todos los productos más vendidos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const products = await getTopSellingProductss();
        setTopSellingItems(products);
      } catch (error) {
        console.error("Error cargando productos más vendidos:", error);
      }
    }

    fetchProducts();
  }, []);

  // Obtener todos los productos activos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getActiveProductPreviews();
        const products = Array.isArray(data.data) ? data.data : [];
        console.log("Productos activos recibidos:", data);
        setActiveItems(products);
        setShowRightArrow(products.length > 1);
      } catch (error) {
        console.error("Error cargando productos activos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


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


  // --- Efectos de Carga de Datos ---

  // UNIFICADO: Cargar marcas al montar el componente
  useEffect(() => {
    const fetchAndFormatBrands = async () => {
      try {
        const response = await getAllBrandsWithCategories();
        if (response && response.data && Array.isArray(response.data)) {
          const formattedBrands = response.data.map((b) => ({
            ...b,
            categories: b.brandCategories?.map((bc) => bc.category) || [],
          }));
          console.log("Marcas formateadas y cargadas:", formattedBrands);
          setAllBrands(formattedBrands);

          // Extraer todas las categorías únicas de todas las marcas activas
          const allCatsSet = new Set();
          formattedBrands.forEach(b => {
            if (b.status === "ACTIVE" && b.categories) {
              b.categories.forEach(cat => {
                if (cat.status === "ACTIVE") {
                  allCatsSet.add(cat.name);
                }
              });
            }
          });
          setAllCategories(Array.from(allCatsSet));

        } else {
          console.warn("Respuesta inesperada al cargar marcas:", response);
          setAllBrands([]);
          setAllCategories([]);
        }
      } catch (error) {
        console.error("Error al cargar marcas:", error);
        toast.error("Error al cargar marcas");
        setAllBrands([]);
        setAllCategories([]);
      }
    };

    fetchAndFormatBrands();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Efecto para manejar cambios en la marca y categoría seleccionada de la URL
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Cuando 'brand' de la URL cambia o 'allBrands' se carga/actualiza
    if (brand && allBrands.length > 0) {
      const selectedBrand = allBrands.find(b =>
        b.name?.toLowerCase() === brand.toLowerCase()
      );

      if (selectedBrand?.categories?.length > 0) {
        // Obtener categorías activas de la marca seleccionada
        const brandCategories = selectedBrand.categories
          .filter(cat => cat.status === "ACTIVE")
          .map(cat => cat.name);
        setAllCategories(brandCategories);
      } else {
        setAllCategories([]);
      }
    } else if (!brand) {
      // Si no hay marca en la URL, mostrar todas las categorías disponibles globalmente
      // Esto ya se hace en el primer useEffect que carga allBrands y todas las categorías únicas
    }
  }, [brand, allBrands]);

  // Establecer la categoría seleccionada si viene de la URL
  useEffect(() => {
    if (category) {
      setSelectedCategory(decodeURIComponent(category));
    } else {
      setSelectedCategory(null); // Limpiar si no hay categoría en la URL
    }
  }, [category]);

  // Cargar productos según los filtros seleccionados (marca y/o categoría)
  useEffect(() => {
    const loadFilteredProducts = async () => {
      // Si no hay filtros iniciales de brand ni category, podrías decidir mostrar destacados
      // O esperar a que se seleccione algo. Para este caso, solo cargamos los destacados si no hay filtros.
      if (!brand && !selectedCategory && !searchTerm) {
        setIsLoading(true);
        try {
          const featured = await getActiveProductPreviews();
          setActiveItems(featured.data || []);
        } catch (error) {
          console.error('Error al cargar productos destacados iniciales:', error);
          setActiveItems([]);
        } finally {
          setIsLoading(false);
        }
        return; // Salir de la función si no hay filtros aplicados
      }

      setIsLoading(true);
      try {
        console.log('Buscando marca:', brand);
        console.log('Todas las marcas disponibles (para búsqueda):', allBrands);

        let productsResponse = { data: [], status: 200, message: 'success' }; // Default response

        // Solo intentar buscar por marca/categoría si allBrands ya está cargado
        if (allBrands.length > 0) {
          const selectedBrand = allBrands.find(b =>
            b.name?.toLowerCase() === brand?.toLowerCase()
          );

          console.log('Marca seleccionada (found):', selectedBrand);
          const brandId = selectedBrand?.id;

          if (!brandId && brand) {
            console.log('No se encontró la marca seleccionada en los datos cargados. Mostrando destacados.');
            // Si la marca de la URL no se encuentra en allBrands, mostramos destacados
            productsResponse = await getActiveProductPreviews();
          } else if (brandId && selectedCategory) {
            // Buscando productos por marca y categoría
            console.log(`Buscando productos para marca ${brandId} y categoría ${selectedCategory}`);

            const categoryObj = selectedBrand?.categories?.find(
              cat => cat.name.toLowerCase() === selectedCategory.toLowerCase()
            );

            if (categoryObj?.id) {
              productsResponse = await getProductsByCategoryAndBrand(categoryObj.id, brandId);
            } else {
              console.log('Categoría no encontrada en la marca, buscando solo por marca');
              productsResponse = await getProductsByBrand(brandId);
            }
          } else if (brandId) {
            // Buscando productos solo por marca
            console.log(`Buscando productos para marca ${brandId}`);
            productsResponse = await getProductsByBrand(brandId);
          } else if (selectedCategory) {
            // Si hay categoría pero no marca, puedes buscar por categoría solamente
            // Necesitarías un servicio getProductsByCategory si no lo tienes
            console.log(`Buscando productos para categoría ${selectedCategory} (sin marca específica)`);
            // productsResponse = await getProductsByCategory(selectedCategory); // Descomenta si tienes este servicio
            productsResponse = await getActiveProductPreviews(); // Fallback si no hay servicio getProductsByCategory
          }
        } else {
          console.log("Marcas no cargadas aún, esperando o mostrando destacados por defecto.");
          productsResponse = await getActiveProductPreviews();
        }

        // --- Manejo de la respuesta de productos ---
        if (productsResponse && productsResponse.status === 200 && Array.isArray(productsResponse.data) && productsResponse.data.length > 0) {
          setActiveItems(productsResponse.data);
          console.log('Productos encontrados y mostrados:', productsResponse.data.length);
        } else {
          console.log('No se encontraron productos para los filtros aplicados, mostrando productos destacados.');
          const featured = await getActiveProductPreviews();
          setActiveItems(featured.data || []);
        }

      } catch (error) {
        console.error('Error al cargar productos filtrados:', error);
        // En caso de error, siempre mostrar productos destacados
        const featured = await getActiveProductPreviews();
        setActiveItems(featured.data || []);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilteredProducts();
  }, [brand, selectedCategory, allBrands, getProductsByCategoryAndBrand, getProductsByBrand, getActiveProductPreviews]); // Dependencias

  // Cargar productos más vendidos (siempre se muestran independientemente de filtros)
  useEffect(() => {
    const loadTopSelling = async () => {
      try {
        const topSelling = await getTopSellingProductss(); // Asegúrate de que esta función exista en productService
        setTopSellingItems(topSelling || []);
      } catch (error) {
        console.error("Error al cargar productos más vendidos:", error);
        setTopSellingItems([]);
      }
    };
    loadTopSelling();
  }, []);

  // Manejadores de navegación y filtros
  const handleBack = () => navigate("/tienda");
  const handleCategoryChange = (newCategoryName) => {
    // Busca la categoría por nombre en todas las categorías disponibles para obtener su ID
    let categoryToNavigate = newCategoryName; // Por defecto es el nombre

    // Construye la URL de navegación
    if (brand) {
      navigate(`/productos/${brand}/${encodeURIComponent(categoryToNavigate)}`);
    } else {
      navigate(`/productos/categoria/${encodeURIComponent(categoryToNavigate)}`);
    }
  };


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
        <div className="max-w-7xl w-full mx-auto px-4">
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
                <div className="rounded-t-[3rem] px-0 pt-0 w-full mx-auto flex-grow">
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

                        <div className="">
                          {/* Contenedor principal del carrusel con estilo minimalista */}
                          <div className="relative group">
                            {/* Contenedor del carrusel */}
                            <div className="carousel-container overflow-hidden px-0 sm:px-0 rounded-lg">
                              {/* Pista del carrusel */}
                              <div
                                className="carousel-track group p-0 flex transition-transform duration-300 ease-out justify-start"
                                style={{ paddingBottom: 14, paddingTop: 9, transform: `translateX(-${carouselPosition}%)` }}
                              >
                                {topSellingItems.map((topSellingItem, index) => (
                                  <div
                                    key={`top-${index}`}
                                    className={`carousel-item p-0 flex-shrink-0 sm:px-0 md:px-0 ${index === 0 ? 'rounded-l-lg' : ''} ${index === topSellingItem.length - 1 ? 'rounded-r-lg' : ''} group-hover:bg-zinc-300`}
                                    style={{
                                      paddingInline: 0,
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
                                    <Link to={`/producto/${topSellingItem.product_id}`} key={index} className="w-full p-0 m-0 space-x-0 ">
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="cardgroup-hover:blur-[0px] hover:!rounded-lg group-hover:!opacity-40 hover:!blur-none hover:!opacity-100 bg-white hover:shadow-md transition-all duration-500 overflow-hidden w-full cursor-pointer hover:scale-105 group-hover:rounded-none"
                                      >
                                        {/* Diseño adaptativo: horizontal en móvil, vertical en tablet/desktop */}
                                        <div className="flex flex-row sm:flex-col w-full">
                                          {/* Imagen: 1/3 del ancho en móvil, altura completa en desktop */}
                                          <ProductImageWithFallback
                                            src={topSellingItem.media?.[0]?.url || "/placeholder-product.png"} // Asegúrate de tener el placeholder aquí
                                            alt={topSellingItem.product_name || "Producto"} // Usar product_name para el alt
                                            className="max-h-full max-w-full object-contain relative z-10"
                                          />

                                          {/* Contenido: 2/3 del ancho en móvil, ancho completo en desktop */}
                                          <div className="w-2/3 sm:w-full p-3 sm:p-4 flex-grow flex flex-col justify-between sm:h-[150px]">
                                            <div>
                                              <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate" title={topSellingItem.product_name}>{topSellingItem.product_name}</h3>
                                              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2" title={topSellingItem.product_description}>{topSellingItem.product_description}</p>
                                            </div>
                                            {topSellingItem.product_price && <p className="text-lg sm:text-2xl font-bold text-blue-700 mt-2 sm:mt-3">${topSellingItem.product_price}</p>}
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
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>

          <div ref={sectionRef} className="bg-gray-100 max-w-7xl rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full flex-grow">
            {/* Contenedor principal con ancho ajustado */}
            <div className="w-full">
              {activeItems.length > 0 ? (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-500">Todos los productos</h2>
                  </div>

                  <div className="mb-10">
                    {/* Contenedor principal del carrusel con estilo minimalista */}
                    <div className="relative group">
                      {/* Contenedor del carrusel */}
                      <div className="carousel-container overflow-hidden px-0 sm:px-0 rounded-lg">
                        {/* Pista del carrusel */}
                        <div
                          className="carousel-track group p-0 flex transition-transform duration-300 ease-out justify-start"
                          style={{
                            paddingBottom: 14, paddingTop: 9,
                            transform: `translateX(-${carouselPositionTwo}%)`
                          }}
                        >
                          {activeItems.map((activeItem, index) => (
                            <div
                              key={`top-${index}`}
                              className={`carousel-item p-0 flex-shrink-0 sm:px-0 md:px-0 ${index === 0 ? 'rounded-l-lg' : ''} ${index === activeItem.length - 1 ? 'rounded-r-lg' : ''} group-hover:bg-zinc-300`}
                              style={{
                                paddingInline: 0,
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
                              <Link to={`/producto/${activeItem.id}`} key={index} className="w-full p-0 m-0 space-x-0">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="cardgroup-hover:blur-[0px] hover:!rounded-lg group-hover:!opacity-40 hover:!blur-none hover:!opacity-100 bg-white hover:shadow-md transition-all duration-500 overflow-hidden w-full cursor-pointer hover:scale-105 group-hover:rounded-none"
                                >
                                  {/* Diseño adaptativo: horizontal en móvil, vertical en tablet/desktop */}
                                  <div className="flex flex-row sm:flex-col w-full">
                                    {/* Imagen: 1/3 del ancho en móvil, altura completa en desktop */}
                                    <ProductImageWithFallback
                                      src={activeItem.media && activeItem.media.length > 0 ? activeItem.media[0].url : "/placeholder-product.png"}
                                      alt={activeItem.name || "Producto"}
                                      className="max-h-full max-w-full object-contain relative z-10"
                                    />

                                    {/* Contenido: 2/3 del ancho en móvil, ancho completo en desktop */}
                                    <div className="w-2/3 sm:w-full p-3 sm:p-4 flex-grow flex flex-col justify-between sm:h-[150px]">
                                      <div>
                                        <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate" title={activeItem.name}>{activeItem.name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2" title={activeItem.description}>{activeItem.description}</p>
                                      </div>
                                      {activeItem.price && <p className="text-lg sm:text-2xl font-bold text-blue-700 mt-2 sm:mt-3">${activeItem.price}</p>}
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
                              const newPosition = Math.max(0, carouselPositionTwo - itemWidth);
                              setCarouselPositionTwo(newPosition);

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
                              const newPosition = Math.min(maxPosition, carouselPositionTwo + itemWidth);
                              setCarouselPositionTwo(newPosition);

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