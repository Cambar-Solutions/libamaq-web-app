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
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavCustomer } from "../user/components/molecules/NavCustomer";
import AllProductCardSection from "./AllProductCardSection";
import TopSellingCarouselSection from "./TopSellingCarouselSection";

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

  const { brand, category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingFilteredProducts, setLoadingFilteredProducts] = useState(true);

  // --- NUEVO ESTADO PARA LA SESIÓN ---
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

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
  const [touchEnd, setTouchEnd] = useState(0);

  // Para el carrusel de "Los más vendidos"
  const [topSellingCarouselPosition, setTopSellingCarouselPosition] = useState(0);
  const [showTopSellingLeftArrow, setShowTopSellingLeftArrow] = useState(false);
  const [showTopSellingRightArrow, setShowTopSellingRightArrow] = useState(true);

  // Para el carrusel de "Todos los productos" / "Productos activos"
  const [activeProductsCarouselPosition, setActiveProductsCarouselPosition] = useState(0);
  const [showActiveProductsLeftArrow, setShowActiveProductsLeftArrow] = useState(false);
  const [showActiveProductsRightArrow, setShowActiveProductsRightArrow] = useState(true);


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

  // --- EFECTO PARA VERIFICAR LA SESIÓN ---
  useEffect(() => {
    const token = localStorage.getItem("token"); // O el nombre de tu token
    setIsUserLoggedIn(!!token); // Si hay token, está loggeado (true), si no, false
  }, []);

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
        setShowActiveProductsRightArrow(products.length > 1);
      } catch (error) {
        console.error("Error cargando productos activos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoadingFilteredProducts(true); // Activar carga antes de la petición
      try {
        let fetchedData = [];
        // Lógica de filtrado:
        // Si tienes tanto marca como categoría seleccionadas
        if (selectedBrand && selectedCategory) {
          const response = await getProductsByBrandAndCategory(selectedBrand, selectedCategory);
          fetchedData = response.data;
        }
        // Si solo tienes marca seleccionada (y quieres mostrar todos de esa marca, ignorando la categoría)
        else if (selectedBrand) {
          const response = await getProductsByBrand(selectedBrand);
          fetchedData = response.data;
        }
        // Si solo tienes categoría seleccionada (y quieres mostrar todos de esa categoría, ignorando la marca)
        else if (selectedCategory) {
          const response = await getProductsByCategory(selectedCategory);
          fetchedData = response.data;
        }
        // Si no hay marca ni categoría seleccionadas (este es el caso de la carga inicial si no quieres mostrar nada)
        else {
          // Puedes optar por no cargar nada, o cargar un conjunto predeterminado
          // fetchedData = []; // No muestra nada hasta que se filtre
          // O: Puedes cargar todos los productos activos aquí si quieres que sean el valor por defecto
          // const data = await getActiveProductPreviews();
          // fetchedData = Array.isArray(data.data) ? data.data : [];
        }

        setFilteredProducts(fetchedData); // Actualiza el estado con los productos filtrados
      } catch (error) {
        console.error("Error al obtener productos filtrados:", error);
        setFilteredProducts([]); // Limpia los productos en caso de error
      } finally {
        setLoadingFilteredProducts(false); // Desactivar carga después de la petición
      }
    };

    fetchFilteredProducts();
  }, [selectedBrand, selectedCategory]); // Este useEffect se ejecuta cada vez que selectedBrand o selectedCategory cambian


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
      setTopSellingCarouselPosition(0);
      setShowTopSellingLeftArrow(false);

      // Calcular si debe mostrar la flecha derecha
      let itemWidth = 20; // Por defecto 5 items (20%)
      if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25; // 4 items
      else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333; // 3 items
      else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50; // 2 items
      else if (window.innerWidth < 640) itemWidth = 100; // 1 item

      const maxPosition = Math.max(0, (topSellingProducts.length * itemWidth) - 100);
      setShowTopSellingRightArrow(maxPosition > 0);
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
    const targetY = sectionRef.current.getBoundingClientRect().top + window.pageYOffset - 180; // <- Aquí va el valor que mediste
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
        // toast.error("Error al cargar marcas");
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

  // Cargar productos según los filtros seleccionados (marca, categoría y término de búsqueda)
  useEffect(() => {
    const loadFilteredProducts = async () => {
      setLoadingFilteredProducts(true);
      try {
        let productsFromApi = []; // Usaremos este array para guardar los resultados de la API

        // 1. Lógica para obtener productos de la API según marca y categoría
        if (brand || selectedCategory) { // Si hay marca O categoría en la URL
          // Buscar la marca seleccionada
          const selectedBrandObject = allBrands.find(b =>
            b.name?.toLowerCase() === brand?.toLowerCase()
          );
          const brandId = selectedBrandObject?.id;

          // Lógica para determinar qué API llamar
          if (brandId && selectedCategory) {
            const categoryObj = selectedBrandObject?.categories?.find(
              cat => cat.name.toLowerCase() === selectedCategory.toLowerCase()
            );
            if (categoryObj?.id) {
              const response = await getProductsByCategoryAndBrand(categoryObj.id, brandId);
              productsFromApi = response.data || [];
            } else {
              console.log('Categoría no encontrada en la marca, buscando solo por marca');
              const response = await getProductsByBrand(brandId);
              productsFromApi = response.data || [];
            }
          } else if (brandId) {
            const response = await getProductsByBrand(brandId);
            productsFromApi = response.data || [];
          } else if (selectedCategory) {
            // Si hay categoría pero no marca, necesitas un servicio para solo categoría
            // O puedes decidir que siempre necesitas marca para filtrar por categoría
            // Por ahora, si no tienes ese servicio, podría caer a destacados o a la lista completa
            // Si tienes un getProductsByCategory:
            // const response = await getProductsByCategory(selectedCategory);
            // productsFromApi = response.data || [];
            console.warn('Solo categoría seleccionada sin marca, esto puede no estar cubierto por la API actual.');
            // Fallback a todos los productos activos si no hay un endpoint de solo categoría
            const response = await getActiveProductPreviews();
            productsFromApi = response.data || [];
          }
        } else {
          // Si no hay filtros de marca/categoría en la URL, se cargan los productos activos por defecto
          const response = await getActiveProductPreviews();
          productsFromApi = response.data || [];
        }

        // 2. APLICAR EL FILTRO POR TÉRMINO DE BÚSQUEDA A LOS productosFromApi
        let finalFilteredProducts = productsFromApi;
        if (searchTerm) {
          finalFilteredProducts = productsFromApi.filter(
            item =>
              item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchTerm.toLowerCase()) // Añadí también descripción si existe
          );
        }

        // 3. Actualizar el estado con los productos finalmentes filtrados
        setFilteredProducts(finalFilteredProducts);

      } catch (error) {
        console.error('Error al cargar productos filtrados:', error);
        // En caso de error, muestra los productos activos como fallback
        const featured = await getActiveProductPreviews();
        setFilteredProducts(featured.data || []);
      } finally {
        setLoadingFilteredProducts(false);
      }
    };

    loadFilteredProducts();
  }, [brand, selectedCategory, searchTerm, allBrands]); // Asegúrate de incluir 'searchTerm' en las dependencias

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

  const NavbarComponent = isUserLoggedIn ? NavCustomer : Nav2;

  return (
    <>
      <SidebarProvider>
        <NavbarComponent />

        <div className="min-h-screen bg-gray-50 flex flex-col pt-20 w-full">
          <div className="max-w-7xl w-full mx-auto px-4">
            {/* Barra de búsqueda y filtros (tu código actual, se mantiene) */}
            <div className="lg:mt-4 mt-2 mx-auto px-2 sticky lg:top-20 top-19 z-20 bg-white shadow-md rounded-full mb-6 p-2">
              <div className="flex flex-row items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center w-1/5 gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-full transition-colors"
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filtros</span>
                </button> */}
                {/* Asegúrate de que 'brand' aquí se refiera a tu 'selectedBrand' si es lo que usas para filtrar */}
                {(brand || selectedCategory) && ( // Muestra el botón de regresar si hay alguna selección
                  <button
                    onClick={handleBack} // Esta función debería limpiar selectedBrand y selectedCategory
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
                        onClick={() => handleCategoryChange(cat)} // Esta función DEBE actualizar `selectedCategory`
                        className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        {cat.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Título de la sección de productos */}
            <div className="mb-6 mt-8 w-full">
              <h1 className="text-xl md:text-2xl font-bold text-gray-500">
                {/* Aquí la lógica de título debe reflejar los productos que se están mostrando */}
                {/* Asumiendo que 'brand' y 'selectedCategory' son tus estados de filtro */}
                {brand && selectedCategory
                  ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${selectedCategory.replace(/-/g, ' ')}`
                  : brand
                    ? `Productos ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
                    : selectedCategory
                      ? `Productos de la categoría ${selectedCategory.replace(/-/g, ' ')}`
                      : searchTerm // Si hay un término de búsqueda, muestra ese título
                        ? `Resultados para "${searchTerm}"`
                        : ''} {/* Título por defecto si no hay filtros ni búsqueda */}
              </h1>
            </div>

            <div className="w-full">
              {(brand || selectedCategory || searchTerm) ? (
                // --- MUESTRA LOS PRODUCTOS FILTRADOS/BUSCADOS ---
                <div className="bg-gray-100 max-w-7xl rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full flex-grow">
                  {loadingFilteredProducts ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">Cargando productos...</p>
                      {/* Puedes agregar un spinner aquí */}
                    </div>
                  ) : (
                    filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                          <Link to={`/producto/${product.product_id || product.id}`} key={product.id} className="block"> {/* Asegúrate de usar la ID correcta */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
                            >
                              <ProductImageWithFallback
                                src={product.media?.[0]?.url || "/placeholder-product.png"}
                                alt={product.product_name || product.name || "Producto"}
                                className="w-full h-48 object-contain" // Ajusta la altura de la imagen si es necesario
                              />
                              <div className="p-4 flex-grow flex flex-col justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.product_name || product.name}</h3>
                                  <p className="text-sm text-gray-500 line-clamp-2">{product.product_description || product.description}</p>
                                </div>
                                {(product.product_price || product.price) && <p className="text-xl font-bold text-blue-700 mt-2">${product.product_price || product.price}</p>}
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No se encontraron productos que coincidan con tu selección.</p>
                        {/* Puedes ofrecer opciones para limpiar filtros aquí */}
                        <button onClick={() => { setBrand(null); setSelectedCategory(null); setSearchTerm(''); }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Limpiar filtros</button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                // --- MUESTRA LAS SECCIONES PREDETERMINADAS (más vendidos y activos) ---
                <>
                  <TopSellingCarouselSection
                    topSellingItems={topSellingItems}
                    topSellingCarouselPosition={topSellingCarouselPosition}
                    setTopSellingCarouselPosition={setTopSellingCarouselPosition}
                    showTopSellingLeftArrow={showTopSellingLeftArrow}
                    setShowTopSellingLeftArrow={setShowTopSellingLeftArrow}
                    showTopSellingRightArrow={showTopSellingRightArrow}
                    setShowTopSellingRightArrow={setShowTopSellingRightArrow}
                    setSearchTerm={setSearchTerm}
                    scrollToSection={scrollToSection}
                  />

                  {/* Sección "Todos los productos" / Productos Activos */}
                  <div ref={sectionRef} className="flex items-center justify-between mb-0 mt-14 lg:mt-0">
                    <h2 className="text-xl font-bold text-gray-500">Todos los productos</h2>
                  </div>
                  <div  className="sm:bg-gray-100 sm:max-w-7xl sm:rounded-t-[3rem] sm:shadow-inner px-0 sm:px-6 py-0 sm:py-10 mt-6 w-full flex-grow">
                    <div className="w-full">
                      {activeItems.length > 0 ? (
                        <div className="mb-10">
                          {/* <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-500">Todos los productos</h2>
                          </div> */}
                          <div className="mb-10">
                            {/* Reemplaza el carrusel de activeItems por un grid de ProductCard */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 lg:gap-x-6 sm:gap-x-2 gap-x-2 lg:gap-y-8 sm:gap-y-2 gap-y-2 mb-8">
                              {activeItems.map((activeItem, index) => (
                                <AllProductCardSection key={activeItem.id} product={activeItem} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                          <p className="text-gray-500">No se encontraron productos activos.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}