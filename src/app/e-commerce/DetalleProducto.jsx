import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, FileDown, Info, Percent, Tag, CheckCircle, XCircle, Shield, ShoppingCart, CreditCard, Clock, ArrowLeft, Share2, Home, Star, StarOff } from "lucide-react";
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
import LoadingScreen from '@/components/LoadingScreen';
import { createOrder } from "@/services/public/orderService";
import { createOrderDetail } from "@/services/admin/orderDetailService";

// --- Importa las funciones de API que creamos ---
// Asegúrate de que la ruta sea correcta según la ubicación de tus archivos de API
import { addProductToCart } from "@/services/customer/shoppingCar";

// Componente para mostrar estrellas de ranking
const RankingStars = ({ ranking }) => {
  if (ranking === null || ranking === undefined) {
    return (
      <div className="flex items-center gap-2 mt-1 mb-2">
        <StarOff className="w-5 h-5 text-gray-400" />
        <span className="text-xs text-gray-500">Sin valoración por el momento</span>
      </div>
    );
  }
  const stars = [];
  const rounded = Math.round(ranking * 2) / 2; // permite medias estrellas si se desea
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" fill="currentColor" />);
    } else {
      stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
    }
  }
  return (
    <div className="flex items-center gap-2 mt-1 mb-2">
      {stars}
      <span className="text-xs text-gray-600">{ranking.toFixed(1)} / 5</span>
    </div>
  );
};

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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPreviewError, setPdfPreviewError] = useState(false);

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

  // Scroll al principio al montar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // If loading, show loading indicator
  if (loading) {
    return <LoadingScreen />;
  }

  // Nueva función para comprar ahora (crea la orden y redirige a Mis pedidos)
  const handleBuyNow = async () => {
    if (!isUserLoggedIn) {
      toast.error("Debes iniciar sesión para comprar.");
      return;
    }
    if (!product) {
      toast.error("No se pudo obtener la información del producto.");
      return;
    }
    try {
      // 1. Crear la orden principal
      const orderPayload = {
        userId: Number(currentUserId),
        type: 'PURCHASE', // debe ser mayúsculas
        shippingGuide: 'PENDIENTE',
        shippingStatus: 'PENDING',
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'transferencia',
        branch: null,
      };
      const orderRes = await createOrder(orderPayload);
      const orderId = orderRes?.data?.data?.id;
      if (!orderId) throw new Error('No se pudo obtener el ID de la orden creada');
      // 2. Crear el detalle de la orden (solo este producto)
      await createOrderDetail({
        orderId: Number(orderId),
        productId: Number(product.id),
        quantity: 1,
        unitPrice: Number(product.price),
        discount: 0,
        total: Number(product.price),
      });
      // 3. Guardar en localStorage que esta orden es una compra rápida
      localStorage.setItem('lastCompraRapida', JSON.stringify({ orderId, compra: true }));
      toast.success('¡Compra realizada! Puedes ver el estado en Mis pedidos.');
      // 4. Redirigir a Mis pedidos
      navigate('/user-profile', { state: { view: 'compras' } });
    } catch (err) {
      toast.error('Error al crear la orden: ' + (err?.message || err));
    }
  };

  // Nueva función para rentar ahora (crea la orden de tipo RENTAL y redirige a Mis rentas)
const handleRentNow = async () => {
  if (!isUserLoggedIn) {
    toast.error("Debes iniciar sesión para rentar.");
    return;
  }
  if (!product) {
    toast.error("No se pudo obtener la información del producto.");
    return;
  }
  try {
    // 1. Crear la orden principal de tipo RENTAL
    const orderPayload = {
      userId: Number(currentUserId),
      type: 'RENTAL', // tipo RENTAL en mayúsculas
      shippingGuide: 'PENDIENTE',
      shippingStatus: 'PENDING',
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'CASH',
      // Elimina la línea 'branch: null,' completamente
    };

    console.log("Creando nueva orden (RENTAL):", orderPayload); // Para verificar el payload antes de enviar

    const orderRes = await createOrder(orderPayload);
    const orderId = orderRes?.data?.data?.id;
    if (!orderId) throw new Error('No se pudo obtener el ID de la orden creada');

    // 2. Crear el detalle de la orden (solo este producto)
    await createOrderDetail({
      orderId: Number(orderId),
      productId: Number(product.id),
      quantity: 1,
      unitPrice: Number(product.price),
      discount: 0,
      total: Number(product.price),
    });

    // 3. Guardar en localStorage que esta orden es una renta rápida
    localStorage.setItem('lastRentaRapida', JSON.stringify({ orderId, renta: true }));
    toast.success('¡Renta realizada! Puedes ver el estado en Mis rentas.');

    // 4. Redirigir a Mis rentas
    navigate('/user-profile', { state: { view: 'rentas' } });
  } catch (err) {
    console.error("❌ Error al crear la orden de renta:", err);
    // Mejora el mensaje de error para ver la respuesta detallada del servidor
    toast.error('Error al crear la orden de renta: ' + (err?.response?.data?.message || err?.message || 'Error desconocido'));
  }
};

  // Nueva función para ir al formulario de PaymentMethod
  const handleGoToPaymentMethod = () => {
    if (!isUserLoggedIn) {
      toast.error("Debes iniciar sesión para completar la compra.");
      return;
    }
    navigate('/payment-method', { state: { productId: product?.id } });
  };

  return (
    <div className="w-full bg-gray-100 min-h-screen pt-20 pb-8">
      <SidebarProvider>
        <NavbarComponent />

        <div className="lg:max-w-7xl w-[90%] mx-auto lg:px-4 px-0">
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
            <div className="w-full md:w-1/2 lg:w-3/5 lg:p-4 py-4">
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
                  <div className="absolute lg:top-2 lg:right-2 lg:z-10 top-0 right-4 z-10 ">
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

              <div className="flex sm:hidden mt-4 space-x-2 overflow-x-auto pb-2 mx-4">
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
              <div className="flex items-center mb-0 gap-4">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 leading-tight flex items-center gap-3">
                  {product?.name}
                  {product?.brand?.name && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 align-middle">
                      {product.brand.name}
                    </span>
                  )}
                </h1>
              </div>
              {/* Ranking visualización */}
              <RankingStars ranking={product?.ranking} />

              {/* --- Visualización profesional de precio y rebaja --- */}
              <div className="mb-2 flex flex-col gap-2">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-blue-700">
                    {product?.price?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </span>
                  {product?.discount > 0 && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded font-semibold border border-red-200 ml-2">
                      -{product.discount}%
                    </span>
                  )}
                  {product?.discount > 0 && product?.originalPrice && (
                    <span className="text-base text-gray-400 line-through ml-2">{product.originalPrice.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                  )}
                </div>

              </div>

              {/* Descripción corta (sin título) */}
              {product?.shortDescription && (
                <div className="mb-4">
                  <p className="text-gray-700 text-base whitespace-pre-line mb-2">{product.shortDescription}</p>
                  {product?.description?.details && (
                    <p className="text-gray-700 text-sm whitespace-pre-line">{product.description.details}</p>
                  )}
                </div>
              )}

              {/* --- Botones de acción --- */}
              <div className="mt-8">
                <div className="flex flex-col space-y-3 md:hidden">
                  <Button
                    className="w-full bg-blue-500 text-white py-3 rounded-md flex items-center justify-center gap-2 hover:bg-blue-600"
                    onClick={handleAddToCart}
                    disabled={!product}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Agregar al carrito
                  </Button>
                  <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-2"
                    onClick={handleBuyNow}
                  >
                    <CreditCard className="h-5 w-5" />
                    Comprar ahora
                  </Button>
                  {product?.rentable && (
                    <Button
                      className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 py-3 rounded-md flex items-center justify-center gap-2"
                      onClick={handleRentNow}
                    >
                      <Clock className="h-5 w-5" />
                      Rentar
                    </Button>
                  )}
                </div>
                <div className="hidden md:grid md:grid-cols-3 md:gap-2 lg:gap-3">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center gap-1 cursor-pointer"
                    onClick={handleAddToCart}
                    disabled={!product}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Agregar
                  </Button>
                  <Button
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-1 cursor-pointer"
                    onClick={handleBuyNow}
                  >
                    <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base">Comprar</span>
                  </Button>
                  {product?.rentable && (
                    <Button
                      className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 py-3 rounded-md flex items-center justify-center gap-1"
                      onClick={handleRentNow}
                    >
                      <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span className="text-sm lg:text-base">Rentar</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Funcionalidades planas debajo de los botones */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  Funcionalidades
                </h2>
                {functionalitiesArray.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {functionalitiesArray.map((feature, index) => (
                      <li key={index} className="text-gray-800 text-base">
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No hay funcionalidades disponibles</p>
                )}
              </div>
              {/* Descargas en el bloque principal */}
              {product?.downloads && Array.isArray(product.downloads) && product.downloads.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 p-2 rounded-lg bg-red-100 border-2 border-red-200">
                  <div className="">
                    <h2 className="text-lg font-semibold text-rose-950 mb-2">
                      No olvides dar clic en el PDF para acceder al contenido adicional del producto
                    </h2>
                    {product.downloads
                      .filter(download => download.value && download.value.trim() !== '')
                      .map((download, index) => {
                        const isPdf = download.value && download.value.toLowerCase().includes('.pdf');
                        const isManual = download.key && download.key.toLowerCase().includes('manual');
                        const isFicha = download.key && download.key.toLowerCase().includes('ficha');
                        let icon, color, label;
                        if (isPdf) {
                          icon = <FileText className="w-5 h-5 text-red-600 " />;
                          color = 'bg-rose-50 hover:bg-rose-300 border-red-700 ';
                          label = 'PDF';
                          // Botón para vista previa PDF
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setPdfPreviewUrl(download.value);
                                setShowPdfModal(true);
                                setPdfPreviewError(false);
                              }}
                              className={`flex my-0.5 items-center px-3 py-1 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${color}`}
                            >
                              {icon}
                              <span>{label}</span>
                              <span className="ml-1 text-gray-600">{download.key}</span>
                            </button>
                          );
                        } else if (isManual) {
                          icon = <Tag className="w-5 h-5 text-blue-600 mr-2" />;
                          color = 'bg-blue-50 hover:bg-blue-100 border-blue-200';
                          label = 'Manual';
                        } else if (isFicha) {
                          icon = <Info className="w-5 h-5 text-green-600 mr-2" />;
                          color = 'bg-green-50 hover:bg-green-100 border-green-200';
                          label = 'Ficha';
                        } else {
                          icon = <FileDown className="w-5 h-5 text-gray-500 mr-2" />;
                          color = 'bg-gray-50 hover:bg-gray-100 border-gray-200';
                          label = 'Archivo';
                        }
                        // Para otros archivos, descarga directa
                        return (
                          <a
                            key={index}
                            href={download.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex my-0.5 items-center px-3 py-1 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${color}`}
                          >
                            {icon}
                            <span>{label}</span>
                            <span className="ml-1 text-gray-600">{download.key}</span>
                          </a>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Combined Container: Highlighted Features + Info */}
          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Highlighted Features on the left side */}
            {product?.description && (
              <div
                className="p-6 rounded-lg text-white w-full flex flex-col"
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

            {/* Se elimina la sección de funcionalidades aquí, ya que ahora está arriba */}
          </div>

          {/* --- Mejorar tabla de datos técnicos --- */}
          {product?.technicalData && product.technicalData.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h2 className="flex items-center gap-2 text-lg lg:text-2xl font-medium text-gray-900 mb-4">
                <Info className="w-5 h-5 text-blue-500" />
                Especificaciones técnicas
              </h2>
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

          {/* --- Mejorar sección de descargas para accesibilidad y público de construcción --- */}
          {/* Se elimina la sección de descargas de la parte inferior */}
        </div>
      </SidebarProvider>

      {/* Modal de vista previa PDF */}
      {showPdfModal && pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col relative">
            <button
              className="cursor-pointer absolute top-1 right-4 text-gray-700 hover:text-red-600 text-3xl font-bold"
              onClick={() => setShowPdfModal(false)}
              aria-label="Cerrar vista previa"
            >
              &times;
            </button>
            <div className="flex justify-between items-center px-4 pt-3 pb-3">
              <span className="font-semibold text-xl text-gray-800">Vista previa del PDF</span>
            </div>
            <iframe
              src={pdfPreviewUrl}
              title="Vista previa PDF"
              className="w-full flex-1 rounded-b-lg border-none"
              onError={() => setPdfPreviewError(true)}
            />
            <div className="flex flex-col items-center justify-center py-2">
              <p className="text-center text-gray-600 lg:text-sm text-base mb-2">
                Si no puedes ver la vista previa, descarga el archivo aquí.
              </p>
              <a
                href={pdfPreviewUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 lg:text-sm text-base font-medium shadow"
              >
                <FileDown className="w-5 h-5 mr-2" /> Descargar PDF
              </a>
            </div>
          </div>
        </div>
      )}

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