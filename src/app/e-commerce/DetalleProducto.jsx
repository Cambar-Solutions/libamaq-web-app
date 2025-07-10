import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock, ArrowLeft, Share2, Shield, Home } from "lucide-react";
import ShareProduct from "@/components/ShareProduct";
import { useProductById } from "@/hooks/useProductQueries";
import Nav2 from "@/components/Nav2"; // Navbar para usuarios no loggeados
import { NavCustomer } from "@/app/user/components/molecules/NavCustomer"; // Navbar para usuarios loggeados
import { jwtDecode } from "jwt-decode"; // Para decodificar el token y verificar si es válido
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCartStore } from "@/stores/useCartStore";

// --- Importa las funciones de API que creamos ---
// Asegúrate de que la ruta sea correcta según la ubicación de tus archivos de API
import { addProductToCart } from "@/services/customer/shoppingCar";

const DetalleProducto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [mainImage, setMainImage] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [highlightActive, setHighlightActive] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Estado para el ID del carrito actual del usuario
  const [currentUserId, setCurrentUserId] = useState(null); // Para almacenar el ID del usuario loggeado

  // Usar TanStack Query para obtener los detalles del producto
  const {
    data: productData,
    isLoading: loading,
    error
  } = useProductById(id);

  // Extraer el producto de la respuesta de la API
  const product = productData && productData.status === 200 ? productData.data : null;

  // Función para verificar si el usuario está loggeado y obtener su ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Token decodificado:", decoded);
        setIsUserLoggedIn(true);
        setCurrentUserId(parseInt(decoded.sub, 10));
        console.log("✅ Usuario loggeado. ID:", parseInt(decoded.sub, 10));
      } catch (e) {
        console.error("❌ Token JWT inválido:", e);
        setIsUserLoggedIn(false);
        setCurrentUserId(null);
      }
    } else {
      console.log("ℹ️ Usuario no loggeado.");
      setIsUserLoggedIn(false);
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // Por ejemplo, 768px es un breakpoint común para móvil
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const refreshCart = useCartStore((state) => state.refreshCart);

  // Función para agregar el producto al carrito
  const handleAddToCart = async () => {
    if (!isUserLoggedIn) {
      toast.error("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }
    if (!product) {
      toast.error("No se pudo obtener la información del producto.");
      return;
    }
    try {
      const now = new Date();
      const cartItemData = {
        createdBy: "USER", // O puedes usar currentUserId si lo prefieres
        createdAt: now.toISOString(),
        userId: currentUserId,
        productId: Number(product.id),
        quantity: 1,
      };
      await addProductToCart(cartItemData);
      toast.success("El producto se ha agregado al carrito.");
      refreshCart();
    } catch (err) {
      console.error("❌ Error al agregar producto al carrito:", err);
      toast.error("Error al agregar el producto al carrito.");
    }
  };


  // Función para regresar a la página de inicio o a la tienda según el estado del usuario
  const handleBack = () => {
    if (isUserLoggedIn) {
      navigate("/user-home", { replace: true });
    } else {
      navigate("/tienda", { replace: true });
    }
  };

  // Efecto para activar el resaltado del nombre del producto
  useEffect(() => {
    if (product) {
      setHighlightActive(true);
    }
  }, [product]);

  // Establecer la imagen principal cuando el producto se carga
  useEffect(() => {
    if (product?.media?.length > 0) {
      setMainImage(product.media[0].url);
    }
  }, [product]);

  // Manejar errores de carga
  useEffect(() => {
    if (error) {
      console.error("Error al cargar el producto:", error);
      toast.error("Error al cargar el producto");
      if (isUserLoggedIn) {
        navigate("/user-home");
      } else {
        navigate("/tienda");
      }
    }
  }, [error, navigate, isUserLoggedIn]);

  // Effect to check for description overflow
  useEffect(() => {
    if (descriptionRef.current) {
      const checkOverflow = () => {
        if (descriptionRef.current) {
          setHasOverflow(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
        }
      };

      const timeoutId = setTimeout(checkOverflow, 50);

      window.addEventListener('resize', checkOverflow);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', checkOverflow);
      };
    }
  }, [product?.description, showFullDescription]);

  // Helper function to get functionalities as an array
  const getFunctionalitiesAsArray = () => {
    if (typeof product?.functionalities === 'string') {
      return product.functionalities.split('\n').filter(item => item.trim() !== '');
    }
    if (Array.isArray(product?.functionalities)) {
      return product.functionalities.filter(item => item && (typeof item === 'string' ? item.trim() !== '' : true));
    }
    return [];
  };

  const functionalitiesArray = getFunctionalitiesAsArray();

  // Determine which Navbar to use
  const NavbarComponent = isUserLoggedIn ? NavCustomer : Nav2;

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="w-full bg-gray-100 min-h-screen pt-16">
        <SidebarProvider>
          <NavbarComponent />
        </SidebarProvider>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-32 w-32 bg-gray-300 rounded-full mb-4"></div>
              <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen pt-20 pb-8">
      <SidebarProvider>
        <NavbarComponent />

        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="py-4 mt-4 text-sm lg:text-base">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={isUserLoggedIn ? "/user-home" : "/"} className="flex items-center text-gray-700 hover:text-blue-700">
                      <Home size={18} className="mr-1" />
                      Inicio
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {!isUserLoggedIn && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          to="/tienda"
                          className="text-gray-700 hover:text-blue-700"
                        >
                          Tienda
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className={`truncate transition-colors duration-300 font-semibold lg:w-full w-[13em] select-none ${highlightActive ? 'text-blue-700' : 'text-gray-600'}`}>
                    {product?.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm mt-2">
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 lg:w-3/5 p-4">
              <div className="flex flex-row gap-4">
                <div className="hidden sm:flex flex-col space-y-2 overflow-y-auto max-h-96">
                  {product?.media?.map((img, index) => (
                    <img
                      key={index}
                      src={img.url}
                      alt={`${product.name} - ${index}`}
                      className={`w-16 h-16 object-contain border p-1 cursor-pointer rounded ${mainImage === img.url ? "border-blue-500" : "border-gray-200 hover:border-gray-400"
                        }`}
                      onClick={() => setMainImage(img.url)}
                    />
                  ))}
                  {(!product?.media || product.media.length === 0) && (
                    <img
                      src="/placeholder-product.png"
                      alt="Imagen no disponible"
                      className="w-16 h-16 object-contain border p-1 border-blue-500 rounded"
                    />
                  )}
                </div>

                <div className="relative group flex-1">
                  <div className="absolute top-2 right-2 z-10">
                    <ShareProduct product={product} />
                  </div>
                  <div className="w-full h-80 sm:h-96 flex justify-center items-center bg-white rounded-lg">
                    <img
                      src={product?.media && product.media.length > 0
                        ? mainImage || product.media[0].url
                        : "/placeholder-product.png"}
                      alt={product?.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex sm:hidden mt-4 space-x-2 overflow-x-auto pb-2">
                {product?.media?.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`${product.name} - ${index}`}
                    className={`w-16 h-16 object-contain border p-1 cursor-pointer rounded ${mainImage === img.url ? "border-blue-500" : "border-gray-200 hover:border-gray-400"
                      }`}
                    onClick={() => setMainImage(img.url)}
                  />
                ))}
                {(!product?.media || product.media.length === 0) && (
                  <img
                    src="/placeholder-product.png"
                    alt="Imagen no disponible"
                    className="w-16 h-16 object-contain border p-1 border-blue-500 rounded"
                  />
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="w-full md:w-1/2 lg:w-2/5 p-4">
              <div className="flex items-center mb-1">
                <span className="text-sm text-gray-500">Nuevo | ID: {product?.externalId}</span>
                {product?.stock > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">En stock</span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3">{product?.name}</h1>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-semibold text-gray-900">${product?.price?.toLocaleString()}</span>
                  {product?.discount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-md">{product.discount}% OFF</span>
                  )}
                </div>
              </div>

              {product?.garanty && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Shield size={18} className="text-green-500 mr-2" />
                    <div>
                      <p className="font-medium">Garantía: {product.garanty} {product.garanty === 1 ? 'año' : 'años'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Description */}
              {product?.shortDescription && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-line mb-2">{product.shortDescription}</p>
                  {product?.description?.details && (
                    <p className="text-gray-700 text-sm whitespace-pre-line">{product.description.details}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8">
                {/* Vertical buttons for mobile */}
                <div className="flex flex-col space-y-3 md:hidden">
                  <Button
                    className={`w-full bg-blue-500 text-white py-3 rounded-md flex items-center justify-center gap-2
                      ${(!isUserLoggedIn || !product) ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-600 cursor-pointer'}`}
                    onClick={handleAddToCart}
                    disabled={!product}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {"Agregar al carrito"}
                  </Button>
                  <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Comprar ahora
                  </Button>
                  <Button
                    className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 py-3 rounded-md flex items-center justify-center gap-2"
                    onClick={() => navigate(`/e-commerce/rentar/${product?.id}`, { state: { product } })}
                  >
                    <Clock className="h-5 w-5" />
                    Rentar
                  </Button>
                </div>

                {/* Horizontal buttons for tablet/desktop */}
                <div className="hidden md:grid md:grid-cols-3 md:gap-2 lg:gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {!isUserLoggedIn || !product ? (
                          <span className="inline-block w-full" tabIndex={0}>
                            <Button
                              className="cursor-not-allowed w-full bg-blue-500 text-white py-3 rounded-md flex items-center justify-center gap-1 opacity-50"
                              disabled={true}
                              onClick={handleAddToCart}
                            >
                              <ShoppingCart className="h-5 w-5" />
                              {"Agregar"}
                            </Button>
                          </span>
                        ) : (
                          <Button
                            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center gap-1"
                            onClick={handleAddToCart}
                            disabled={false}
                          >
                            <ShoppingCart className="h-5 w-5" />
                            {"Agregar"}
                          </Button>
                        )}
                      </TooltipTrigger>
                      {/* Contenido del Tooltip */}
                      {(!isUserLoggedIn || !product) && (
                        <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                          {!isUserLoggedIn ? (
                            <p>Debes iniciar sesión para agregar al carrito</p>
                          ) : !product ? (
                            <p>Producto no disponible</p>
                          ) : (
                            <p>Acción deshabilitada</p>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>



                  <Link to="/payment-method">
                    <Button className="cursor-pointer w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-1">
                      <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span className="text-sm lg:text-base">Comprar</span>
                    </Button>
                  </Link>

                  <Button
                    className="cursor-pointer w-full bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 py-3 rounded-md flex items-center justify-center gap-1"
                    onClick={() => navigate(`/e-commerce/rentar/${product?.id}`, { state: { product } })}
                  >
                    <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base">Rentar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Container: Highlighted Features + Info */}
          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Highlighted Features on the left side */}
            {product?.description && (
              <div
                className="p-6 rounded-lg text-white w-full  flex flex-col"
                style={{ backgroundColor: product?.color || '#2968c8' }}
              >
                <h3 className="text-lg lg:text-xl font-bold mb-3 text-white">Características destacadas</h3>
                <div
                  ref={descriptionRef}
                  className={`relative transition-max-height duration-700 ease-in-out overflow-hidden`}
                  style={{
                    maxHeight: showFullDescription ? `${descriptionRef.current?.scrollHeight}px` : '20em',
                  }}
                >
                  <p className="whitespace-pre-line text-sm lg:text-base leading-relaxed text-white text-justify">
                    {product.description}
                  </p>
                  {!showFullDescription && hasOverflow && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--product-color, #2968c8)] to-transparent pointer-events-none"></div>
                  )}
                </div>
                {hasOverflow && (
                  <Button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 self-start text-white hover:text-blue-950 transition-all duration-300 cursor-pointer underline underline-offset-2 bg-transparent hover:bg-transparent"
                  >
                    {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
                  </Button>
                )}
              </div>
            )}

            {/* Functionalities (numbered list in columns in a div) */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg lg:text-2xl font-medium text-gray-900">Funcionalidades</h2>
                {functionalitiesArray.length > 0 ? (
                  <ol className="list-decimal list-inside py-4 columns-1 gap-x-6">
                    {functionalitiesArray.map((feature, index) => (
                      <li key={index} className="text-gray-700 text-sm lg:text-base mb-3 break-inside-avoid">
                        {feature}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500 text-sm">No hay funcionalidades disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications - Returned to table style */}
          {product?.technicalData && product.technicalData.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg lg:text-2xl font-medium text-gray-900 mb-4">Especificaciones técnicas</h2>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody>
                    {product.technicalData.map((item, index) => {
                      let renderedKey;
                      let renderedValue;

                      if (typeof item === 'object' && item !== null && 'key' in item && 'value' in item) {
                        renderedKey = item.key;
                        renderedValue = item.value;
                      } else if (typeof item === 'string') {
                        const parts = item.split(': ');
                        if (parts.length > 1) {
                          renderedKey = parts[0];
                          renderedValue = parts.slice(1).join(': ');
                        } else {
                          renderedKey = 'Información';
                          renderedValue = item;
                        }
                      } else {
                        renderedKey = 'N/A';
                        renderedValue = 'Datos inválidos';
                      }

                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3 border-r border-gray-200">{renderedKey}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{renderedValue}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Downloads - Mercado Libre Style */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4 mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Documentación y descargas</h2>
            {product?.downloads && Array.isArray(product.downloads) && product.downloads.length > 0 ? (
              <ul className="space-y-2">
                {product.downloads
                  .filter(download => download.value && download.value.trim() !== '') // Solo mostrar descargas con URL válida
                  .map((download, index) => {
                    const isPdf = download.value && download.value.toLowerCase().includes('.pdf');
                    const isTemporaryUrl = download.value && download.value.startsWith('blob:');
                    return (
                      <li key={index} className="flex items-center">
                        {isPdf ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6m-6-8h3" />
                          </svg>
                        )}
                        <a
                          href={download.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`hover:underline ${isTemporaryUrl ? 'text-red-600 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'}`}
                        >
                          {download.key}
                          {isTemporaryUrl && <span className="text-xs text-gray-500 ml-1">(temporal)</span>}
                        </a>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No hay descargas disponibles para este producto.</p>
            )}
          </div>
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
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default DetalleProducto;