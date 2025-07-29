import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getActiveProductPreviews,
    getProductsByCategoryAndBrand,
    getProductsByBrand,
} from "@/services/public/productService"; // Importar servicios de productos
import { getAllBrandsWithCategories } from "@/services/public/brandService"; // Importar servicio de marcas
import toast, { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavCustomer } from "@/app/user/components/molecules/NavCustomer";
import SearchBar from "./components/organisms/SearchBar";
import CardProducts from "./components/organisms/CardProducts";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "@/services/admin/userService";
import FC_CardProducts from "./components/organisms/FC_CardProducts";

// Importamos el componente LoadingScreen de forma lazy
const LoadingScreen = lazy(() => import('@/components/LoadingScreen'));

export default function UserHome() {
    const [userInfo, setUserInfo] = useState({ name: "null", email: "null@gmail.com" });
    const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol del usuario

    const [activeItems, setActiveItems] = useState([]); // Productos activos, para el estado inicial o fallback
    const [filteredProducts, setFilteredProducts] = useState([]); // Productos que se mostrarán después de filtros/búsqueda
    const [loadingFilteredProducts, setLoadingFilteredProducts] = useState(true); // Nuevo estado de carga para productos filtrados

    const { brand, category } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(null); // Usamos null para indicar que no hay categoría seleccionada inicialmente
    const [allCategories, setAllCategories] = useState([]); // Todas las categorías disponibles
    const [allBrands, setAllBrands] = useState([]); // Todas las marcas disponibles
    const [searchTerm, setSearchTerm] = useState("");
    const sectionRef = useRef(null); // Referencia para el scroll

    // Estados para controlar la carga de imágenes y mostrar contenido
    const [carouselImagesLoaded, setCarouselImagesLoaded] = useState(false); // No usado directamente aquí, pero útil si se reintroduce el carrusel
    const [productsImagesLoaded, setProductsImagesLoaded] = useState(false); // No usado directamente aquí, pero útil si se reintroduce el carrusel
    const [showContent, setShowContent] = useState(false); // Controla si se muestra el contenido o el loading screen
    const [totalImagesToLoad, setTotalImagesToLoad] = useState(0); // No usado directamente aquí
    const [loadedImagesCount, setLoadedImagesCount] = useState(0); // No usado directamente aquí

    const navigate = useNavigate();

    // Debug: Monitorear cambios en searchTerm
    useEffect(() => {
        console.log('searchTerm cambió:', searchTerm);
    }, [searchTerm]);

    // Función para manejar la carga de imágenes individuales (si se usan)
    const handleImageLoad = () => {
        setLoadedImagesCount(prev => prev + 1);
    };

    // Efecto para verificar cuando todas las imágenes están cargadas (si se usan)
    useEffect(() => {
        // Si no hay imágenes para cargar (ej. no hay carrusel o productos precargados visualmente), consideramos que están cargadas
        if (totalImagesToLoad === 0 || loadedImagesCount >= totalImagesToLoad) {
            setProductsImagesLoaded(true);
        }
    }, [loadedImagesCount, totalImagesToLoad]);

    // Efecto para mostrar el contenido cuando todas las imágenes estén cargadas (si se usan)
    useEffect(() => {
        // Si no hay carrusel, consideramos carouselImagesLoaded como true
        if (productsImagesLoaded) { // Antes era carouselImagesLoaded && productsImagesLoaded
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [productsImagesLoaded]); // Dependencia actualizada

    // Obtiene el usuario
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    // Si no hay token, podrías redirigir o establecer un rol predeterminado si es necesario
                    setUserRole(null);
                    return;
                }

                const decoded = jwtDecode(token);
                const userId = decoded.sub;
                // Asumiendo que el rol está en 'decoded.role' o similar
                // Ajusta 'decoded.role' si la propiedad es diferente en tu token
                setUserRole(decoded.role); // <-- ¡Aquí obtenemos el rol!

                const user = await getUserById(userId);
                setUserInfo({ name: user.name, email: user.email });
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
                // En caso de error, podrías querer manejar el rol también
                setUserRole(null);
                toast.error("Error al cargar la información del usuario.");
            }
        };

        fetchUserData();
    }, []);

    // Cargar todas las marcas y sus categorías al montar el componente
    useEffect(() => {
        const fetchAndFormatBrands = async () => {
            try {
                const response = await getAllBrandsWithCategories();
                // console.log("Respuesta completa de marcas con categorías:", response); // Descomenta esto para depurar si el problema es en la respuesta inicial

                if (response && response.data && Array.isArray(response.data)) {
                    const formattedBrands = response.data.map((b) => {
                        // *** VERIFICACIÓN ADICIONAL: Asegurarse que 'b' no sea null/undefined ***
                        if (!b) {
                            console.warn("Elemento de marca nulo o indefinido en la respuesta:", b);
                            return null; // O un objeto vacío, o simplemente filtrar este elemento más tarde
                        }
                        return {
                            ...b,
                            categories: b.brandCategories?.map((bc) => bc.category) || [],
                        };
                    }).filter(Boolean); // Filtra cualquier 'null' si se retornó alguno

                    setAllBrands(formattedBrands);

                    const allCatsSet = new Set();
                    formattedBrands.forEach(b => {
                        // *** ¡LA SOLUCIÓN PRINCIPAL ESTÁ AQUÍ! ***
                        // Asegúrate de que 'b' (la marca) no sea null/undefined antes de acceder a 'b.status'
                        if (b && b.status === "ACTIVE" && b.categories) {
                            b.categories.forEach(cat => {
                                // También podrías añadir una verificación para 'cat' si hay riesgo de que sea null
                                if (cat && cat.status === "ACTIVE") {
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
    }, []);

    // Establecer la categoría seleccionada desde la URL
    useEffect(() => {
        if (category) {
            setSelectedCategory(decodeURIComponent(category));
        } else {
            setSelectedCategory(null);
        }
    }, [category]);

    // Cargar productos según los filtros seleccionados (marca, categoría y término de búsqueda)
    useEffect(() => {
        console.log('useEffect de filtrado ejecutado con:', { brand, selectedCategory, searchTerm, allBrandsLength: allBrands.length });
        const loadFilteredProducts = async () => {
            setLoadingFilteredProducts(true);
            try {
                let productsFromApi = [];

                const selectedBrandObject = allBrands.find(b =>
                    b.name?.toLowerCase() === brand?.toLowerCase()
                );
                const brandId = selectedBrandObject?.id;

                if (brandId && selectedCategory) {
                    const categoryObj = selectedBrandObject?.categories?.find(
                        cat => cat.name.toLowerCase() === selectedCategory.toLowerCase()
                    );
                    if (categoryObj?.id) {
                        const response = await getProductsByCategoryAndBrand(categoryObj.id, brandId);
                        productsFromApi = response.data || [];
                    } else {
                        console.warn('Categoría no encontrada para la marca, buscando solo por marca.');
                        const response = await getProductsByBrand(brandId);
                        productsFromApi = response.data || [];
                    }
                } else if (brandId) {
                    const response = await getProductsByBrand(brandId);
                    productsFromApi = response.data || [];
                } else if (selectedCategory) {
                    // Si solo hay categoría seleccionada (sin marca específica de la URL)
                    // Esto es más complejo ya que getProductsByCategory podría necesitar una revisión o un endpoint específico.
                    // Por ahora, si no hay marca, y solo categoría, cargamos todos los activos y filtramos por categoría.
                    const allActive = await getActiveProductPreviews();
                    productsFromApi = (allActive.data || []).filter(prod =>
                        prod.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
                    );
                } else {
                    const response = await getActiveProductPreviews();
                    productsFromApi = response.data || [];
                }

                // Aplicar filtro por término de búsqueda
                let finalFilteredProducts = productsFromApi;
                if (searchTerm) {
                    console.log('Filtrando por searchTerm:', searchTerm);
                    console.log('Productos antes del filtro:', productsFromApi.length);
                    finalFilteredProducts = productsFromApi.filter(
                        item =>
                            (item.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.product_description?.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                    console.log('Productos después del filtro:', finalFilteredProducts.length);
                }
                setFilteredProducts(finalFilteredProducts);
            } catch (error) {
                console.error('Error al cargar productos filtrados:', error);
                toast.error("Error al cargar productos. Mostrando todos los productos.");
                const featured = await getActiveProductPreviews();
                setFilteredProducts(featured.data || []);
            } finally {
                setLoadingFilteredProducts(false);
            }
        };

        // Asegurarse de que `allBrands` esté cargado antes de intentar cargar productos filtrados
        if (allBrands.length > 0 || (!brand && !category)) { // Cargar si ya hay marcas o si no hay filtros en la URL
            loadFilteredProducts();
        }
        // Si allBrands aún no se carga y hay brand/category en la URL, se esperará al siguiente ciclo.
    }, [brand, selectedCategory, searchTerm, allBrands]);

    // Si no se ha mostrado el contenido (es decir, el LoadingScreen está activo)
    if (!showContent) {
        return (
            <Suspense fallback={<div>Cargando...</div>}>
                <LoadingScreen />
            </Suspense>
        );
    }

    return (
        <>
            <SidebarProvider>
                <NavCustomer />

                <div className="w-full bg-gray-50 min-h-screen pb-0 pt-1">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="max-w-full mx-auto px-2 sm:px-2 lg:px-4">
                            {/* Buscador y filtros */}
                            <SearchBar
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                brand={brand}
                                category={category}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                allCategories={allCategories} // Pasar todas las categorías
                            />

                            {userRole === "GENERAL_CUSTOMER" && (
                                <CardProducts
                                    sectionRef={sectionRef}
                                    brand={brand}
                                    selectedCategory={selectedCategory}
                                    isLoading={loadingFilteredProducts}
                                    filteredProducts={filteredProducts}
                                    searchTerm={searchTerm}
                                />
                            )}

                            {userRole === "FREQUENT_CUSTOMER" && (
                                <FC_CardProducts
                                    sectionRef={sectionRef}
                                    brand={brand}
                                    selectedCategory={selectedCategory}
                                    isLoading={loadingFilteredProducts}
                                    filteredProducts={filteredProducts}
                                    searchTerm={searchTerm}
                                />
                            )}


                            {/* Opcional: Mostrar un mensaje si el rol no es reconocido o es nulo */}
                            {userRole && userRole !== "GENERAL_CUSTOMER" && userRole !== "FREQUENT_CUSTOMER" && (
                                <p className="text-center text-red-500 mt-8">Tipo de usuario no reconocido. Contacte a la empresa Libamaq.</p>
                            )}
                            {!userRole && !loadingFilteredProducts && ( // Solo muestra esto si no hay rol y no está cargando productos
                                <p className="text-center text-gray-500 mt-8">Cargando productos...</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </SidebarProvider>

            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}