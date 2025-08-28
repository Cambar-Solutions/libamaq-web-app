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
import { getCategoryById } from "@/services/public/categoryService";
import ProductImageWithFallback from "./ProductImageWithFallback";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavCustomer } from "../user/components/molecules/NavCustomer";
import AllProductCardSection from "./AllProductCardSection";
import TopSellingCarouselSection from "./TopSellingCarouselSection";
import { getAllActiveSpareParts } from "@/services/public/sparePartService";

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

  const { brandId, categoryId } = useParams(); // Cambiar de brand/category a brandId/categoryId
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [categoryName, setCategoryName] = useState(null); // Nuevo estado para el nombre de la categoría
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingFilteredProducts, setLoadingFilteredProducts] = useState(true);

  // --- NUEVO ESTADO PARA LA SESIÓN ---
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  // --- NUEVO ESTADO PARA FILTRO DE TIPO DE PRODUCTO ---
  const [productType, setProductType] = useState('productos'); // Cambiar de 'todos' a 'productos'

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

  // ELIMINAR TODO ESTE useEffect COMPLETO:
  // useEffect(() => {
  //   const fetchFilteredProducts = async () => {
  //     setLoadingFilteredProducts(true);
  //     try {
  //       let fetchedData = [];
  //       if (selectedBrand && selectedCategory) {
  //         const response = await getProductsByBrandAndCategory(selectedBrand, selectedCategory);
  //         fetchedData = response.data;
  //       }
  //       else if (selectedBrand) {
  //         const response = await getProductsByBrand(selectedBrand);
  //         fetchedData = response.data;
  //       }
  //       else if (selectedCategory) {
  //         const response = await getProductsByCategory(selectedCategory);
  //         fetchedData = response.data;
  //       }
  //       else {
  //         // código comentado...
  //       }
  //       setFilteredProducts(fetchedData);
  //     } catch (error) {
  //       console.error("Error al obtener productos filtrados:", error);
  //       setFilteredProducts([]);
  //     } finally {
  //       setLoadingFilteredProducts(false);
  //     }
  //   };
  //   fetchFilteredProducts();
  // }, [selectedBrand, selectedCategory]);

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

    // Cuando 'brandId' de la URL cambia o 'allBrands' se carga/actualiza
    if (brandId && allBrands.length > 0) {
      const selectedBrandObject = allBrands.find(b => {
        return b.id.toString() === brandId;
      });
      setSelectedBrand(selectedBrandObject);

      if (selectedBrandObject?.brandCategories?.length > 0) {
        // Obtener categorías activas de la marca seleccionada
        const brandCategories = selectedBrandObject.brandCategories
          .filter(item => item.category && item.category.status === "ACTIVE")
          .map(item => item.category.name);
        setAllCategories(brandCategories);
      } else {
        setAllCategories([]);
      }
    } else if (!brandId) {
      setSelectedBrand(null);
    }
  }, [brandId, allBrands]);

  // Establecer la categoría seleccionada si viene de la URL
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (categoryId) {
        try {
          const response = await getCategoryById(categoryId);
          const category = response.data;
          setCategoryName(category?.name || null);
        } catch (error) {
          console.error('Error fetching category:', error);
          setCategoryName(null);
        }
      } else {
        setCategoryName(null);
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  // useEffect para manejar selectedCategory basado en selectedBrand
  useEffect(() => {
    if (categoryId && allBrands.length > 0 && selectedBrand) {
      const categoryItem = selectedBrand.brandCategories?.find(item => 
        item.category && item.category.id.toString() === categoryId
      );
      const categoryObject = categoryItem?.category;
      setSelectedCategory(categoryObject?.name || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, allBrands, selectedBrand]);

  // Cargar productos según los filtros seleccionados (marca, categoría y término de búsqueda)
  useEffect(() => {
    const loadFilteredProducts = async () => {
      console.log('=== INICIO loadFilteredProducts ===');
      console.log('Parámetros:', { brandId, categoryId, searchTerm });
      
      setLoadingFilteredProducts(true);
      try {
        let productsFromApi = [];
  
        if (brandId && categoryId) {
          console.log(`🔍 Cargando productos: categoría ${categoryId}, marca ${brandId}`);
          const response = await getProductsByCategoryAndBrand(categoryId, brandId);
          productsFromApi = response.data || [];
          console.log(`✅ ${productsFromApi.length} productos cargados`);
        } else if (brandId) {
          console.log(`🔍 Cargando productos por marca: ${brandId}`);
          const response = await getProductsByBrand(brandId);
          productsFromApi = response.data || [];
          console.log(`✅ ${productsFromApi.length} productos cargados`);
        } else {
          const response = await getActiveProductPreviews();
          productsFromApi = response.data || [];
        }
        
        // Aplicar filtros adicionales (searchTerm y productType)
        let finalFilteredProducts = productsFromApi;
        if (searchTerm) {
          finalFilteredProducts = productsFromApi.filter(
            item =>
              item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
  
        if (productType === 'productos') {
          finalFilteredProducts = finalFilteredProducts.filter(item => {
            const itemText = `${item.name || ''} ${item.shortDescription || ''} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase();
            return !itemText.includes('refaccion') && !itemText.includes('refacción');
          });
        } else if (productType === 'refacciones') {
          finalFilteredProducts = finalFilteredProducts.filter(item => {
            const itemText = `${item.name || ''} ${item.shortDescription || ''} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase();
            return itemText.includes('refaccion') || itemText.includes('refacción');
          });
        }
  
        console.log('Productos finales filtrados:', finalFilteredProducts.length);
        setFilteredProducts(finalFilteredProducts);
      } catch (error) {
        console.error('❌ Error al cargar productos filtrados:', error);
        setFilteredProducts([]);
      } finally {
        setLoadingFilteredProducts(false);
      }
    };

    // Ejecutar directamente sin validaciones complejas
    loadFilteredProducts();
  }, [brandId, categoryId, searchTerm, productType]);

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
      navigate(`/productos/${brandId}/${encodeURIComponent(categoryToNavigate)}`);
    } else {
      navigate(`/productos/categoria/${encodeURIComponent(categoryToNavigate)}`);
    }
  };
  
  // --- NUEVA FUNCIÓN PARA MANEJAR CAMBIO DE TIPO DE PRODUCTO ---
  const handleProductTypeChange = (type) => {
    setProductType(type);
    if (type === 'refacciones') {
      loadSpareParts();
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
            
            {/* CONTENEDOR UNIFICADO - FILTROS Y BARRA DE BÚSQUEDA */}
            <div className="lg:mt-4 mt-2 mx-auto px-2 sticky lg:top-20 top-19 z-20 bg-white shadow-md rounded-2xl mb-6 p-4">
              
              {/* BARRA DE BÚSQUEDA Y FILTROS EN LA MISMA LÍNEA - 80% DEL ANCHO */}
              <div className="flex flex-row items-center gap-4 w-4/5 mx-auto">
                {/* BARRA DE BÚSQUEDA */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* FILTROS DE PRODUCTOS Y REFACCIONES - DESKTOP */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => handleProductTypeChange('productos')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      productType === 'productos'
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-blue-300'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:bg-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                    }`}
                  >
                    Productos
                  </button>
                  <button
                    onClick={() => handleProductTypeChange('refacciones')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      productType === 'refacciones'
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-blue-300'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:bg-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                    }`}
                  >
                    Refacciones
                  </button>
                </div>
                
                {/* SELECT PARA MOBILE - FILTROS DE TIPO DE PRODUCTO */}
                <div className="md:hidden">
                  <select
                    value={productType}
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                    className="px-3 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                  >
                    <option value="productos">Productos</option>
                    <option value="refacciones">Refacciones</option>
                  </select>
                </div>
                
                {(brandId || selectedCategory) && (
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 text-blue-600 py-2 px-4 rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    <ArrowLeft size={18} />
                    <span className="hidden lg:inline">Regresar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="w-full">
              {(brandId || selectedCategory || searchTerm) ? (
                // --- MUESTRA LOS PRODUCTOS FILTRADOS/BUSCADOS ---
                <div className="bg-gray-100 max-w-7xl rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full flex-grow">
                  {/* TÍTULO DINÁMICO SIMPLIFICADO */}
                  <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        {(() => {
                          if (selectedBrand && categoryName) {
                            return `${categoryName} ${selectedBrand.name}`;
                          } else if (selectedBrand) {
                            return `Productos ${selectedBrand.name}`;
                          } else if (categoryName) {
                            return `${categoryName}`;
                          } else if (searchTerm) {
                            return `Resultados para "${searchTerm}"`;
                          } else {
                            return "Productos";
                          }
                        })()} 
                    </h1>
                </div>
                  
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
                      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <div className="max-w-md mx-auto">
                          <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {selectedCategory 
                              ? `No hay productos en la categoría "${selectedCategory.replace(/-/g, ' ')}" todavía`
                              : brandId
                                ? `No hay productos de la marca "${brandId}" todavía`
                                : searchTerm
                                  ? `No se encontraron productos para "${searchTerm}"`
                                  : 'No hay productos con esta selección todavía'
                            }
                          </h3>
                          <p className="text-gray-500 mb-6">
                            {selectedCategory || brandId 
                              ? 'Estamos trabajando para agregar más productos pronto.'
                              : 'Intenta con otros términos de búsqueda o revisa nuestros productos destacados.'
                            }
                          </p>
                          <button 
                            onClick={() => { 
                              setSelectedBrand(null); 
                              setSelectedCategory(null); 
                              setSearchTerm(''); 
                              navigate('/tienda');
                            }} 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Ver todos los productos
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                // --- MUESTRA LAS SECCIONES PREDETERMINADAS (más vendidos y activos) SOLO CUANDO NO HAY FILTROS ---
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
                  <div className="bg-gray-100 max-w-7xl rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full flex-grow">
                    <div className="w-full">
                      {activeItems.length > 0 ? (
                        <div className="mb-10">
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

  // Función para cargar refacciones - MOVER ESTA FUNCIÓN DENTRO DEL COMPONENTE
  const loadSpareParts = async () => {
    setLoadingSpareParts(true);
    try {
      const response = await getAllActiveSpareParts();
      setSpareParts(response.data || []);
    } catch (error) {
      console.error('Error loading spare parts:', error);
      setSpareParts([]);
    } finally {
      setLoadingSpareParts(false);
    }
  };
}