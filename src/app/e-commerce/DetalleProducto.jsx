import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock, ArrowLeft, Share2, Shield, ChevronRight, MessageCircle, Copy, Facebook, Twitter } from "lucide-react";
import { getProductById } from "@/services/public/productService";
import { toast } from "sonner";
import Nav2 from "@/components/Nav2";
import DynamicMetaTags from "@/components/DynamicMetaTags";

const DetalleProducto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [highlightActive, setHighlightActive] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Función para regresar a la página de categorías
  const handleBack = () => {
    navigate("/tienda", { replace: true });
  };

  // Función para compartir por WhatsApp
  const shareOnWhatsApp = () => {
    const currentUrl = window.location.href;
    const productName = product?.name || "Producto";
    const productPrice = product?.price ? `$${product.price.toLocaleString()}` : "";
    const message = `¡Mira este producto en Libamaq! ${productName} ${productPrice}\n${currentUrl}`;
    
    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear la URL de WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Abrir en una nueva pestaña
    window.open(whatsappUrl, "_blank");
    
    // Cerrar el menú de opciones de compartir
    setShowShareOptions(false);
    
    // Mostrar notificación de éxito
    toast.success("Enlace preparado para compartir en WhatsApp");
  };
  
  // Función para compartir en Facebook
  const shareOnFacebook = () => {
    const currentUrl = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(facebookUrl, "_blank");
    setShowShareOptions(false);
    toast.success("Enlace preparado para compartir en Facebook");
  };
  
  // Función para compartir en Twitter
  const shareOnTwitter = () => {
    const currentUrl = window.location.href;
    const productName = product?.name || "Producto";
    const message = `¡Mira este producto en Libamaq! ${productName}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(twitterUrl, "_blank");
    setShowShareOptions(false);
    toast.success("Enlace preparado para compartir en Twitter");
  };
  
  // Función para copiar el enlace
  const copyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        toast.success("Enlace copiado al portapapeles");
        setShowShareOptions(false);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
        toast.error("No se pudo copiar el enlace");
      });
  };

  // Efecto para activar el resaltado del nombre del producto y obtener la marca
  useEffect(() => {
    if (product) {
      // Activar el resaltado después de cargar el producto
      setHighlightActive(true);
      
      // Determinar el nombre de la marca basado en brandId
      if (product.brandId === 1) {
        setBrandName("Makita");
      } else if (product.brandId === 2) {
        setBrandName("DeWalt");
      } else if (product.brandId === 3) {
        setBrandName("Bosch");
      } else if (product.brandId === 4) {
        setBrandName("Milwaukee");
      } else if (product.type) {
        // Si no tenemos la marca pero tenemos el tipo de producto
        setBrandName(product.type);
      }
    }
  }, [product]);

  // Cargar datos del producto
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id);
        if (response && response.type === "SUCCESS") {
          console.log('Producto obtenido:', response.result);
          setProduct(response.result);
          if (response.result?.multimedia?.length > 0) {
            setMainImage(response.result.multimedia[0].url);
          }
        } else {
          toast.error("No se pudo cargar el producto");
          console.error("Respuesta inválida al cargar el producto:", response);
        }
      } catch (error) {
        toast.error("Error al cargar el producto");
        console.error("Error al cargar el producto:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
    
    // Al montar el componente, hacer scroll al inicio de la página
    window.scrollTo(0, 0);
  }, [id]);

  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return (
      <div className="w-full bg-gray-100 min-h-screen pt-16">
        <Nav2 />
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

  // Preparar datos para las etiquetas meta
  const metaTitle = product ? `${product.name} ${product.price ? `$${product.price.toLocaleString()}` : ''} | Libamaq` : '';
  const metaDescription = product?.shortDescription || (product?.description?.details || '');
  const metaImage = product?.multimedia && product.multimedia.length > 0 
    ? product.multimedia[0].url 
    : '/Monograma_LIBAMAQ.png';

  return (
    <div className="w-full bg-gray-100 min-h-screen pt-20 pb-8">
      {/* Componente para gestionar las etiquetas meta */}
      {product && (
        <DynamicMetaTags 
          title={metaTitle}
          description={metaDescription}
          image={metaImage}
          type="product"
        />
      )}
      <Nav2 />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Migas de pan y navegación */}
        <div className="py-4 mt-4 flex items-center text-sm text-gray-500">
          <button onClick={handleBack} className="flex items-center hover:text-blue-500">
            <ArrowLeft size={16} className="mr-1" />
            Volver al listado
          </button>
          <ChevronRight size={14} className="mx-2" />
          {brandName && (
            <>
              <span className="text-gray-500">{brandName}</span>
              <ChevronRight size={14} className="mx-2" />
            </>
          )}
          <span className={`truncate transition-colors duration-300 ${highlightActive ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>{product?.name}</span>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm mt-2">
          {/* Galería de imágenes */}
          <div className="w-full md:w-3/5 lg:w-2/3 p-4">
            <div className="flex flex-row gap-4">
              {/* Miniaturas verticales */}
              <div className="hidden sm:flex flex-col space-y-2 overflow-y-auto max-h-96">
                {product?.multimedia?.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`${product.name} - ${index}`}
                    className={`w-16 h-16 object-contain border p-1 cursor-pointer rounded ${
                      mainImage === img.url ? "border-blue-500" : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setMainImage(img.url)}
                  />
                ))}
                {(!product?.multimedia || product.multimedia.length === 0) && (
                  <img
                    src="/placeholder-product.png"
                    alt="Imagen no disponible"
                    className="w-16 h-16 object-contain border p-1 border-blue-500 rounded"
                  />
                )}
              </div>
              
              {/* Imagen principal */}
              <div className="relative group flex-1">
                <div className="absolute top-2 right-2 z-10">
                  <button 
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    data-component-name="DetalleProducto"
                  >
                    <Share2 size={20} className="text-gray-400" />
                  </button>
                  
                  {/* Menú de opciones para compartir */}
                  {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 py-1">
                      <button
                        onClick={shareOnWhatsApp}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <MessageCircle size={16} className="mr-2 text-green-500" />
                        Compartir por WhatsApp
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Facebook size={16} className="mr-2 text-blue-600" />
                        Compartir en Facebook
                      </button>
                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Twitter size={16} className="mr-2 text-blue-400" />
                        Compartir en Twitter
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={copyLink}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Copy size={16} className="mr-2 text-gray-500" />
                        Copiar enlace
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full h-80 sm:h-96 flex justify-center items-center bg-white rounded-lg">
                  <img
                    src={product?.multimedia && product.multimedia.length > 0 
                      ? mainImage || product.multimedia[0].url 
                      : "/placeholder-product.png"}
                    alt={product?.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Miniaturas horizontales (solo móvil) */}
            <div className="flex sm:hidden mt-4 space-x-2 overflow-x-auto pb-2">
              {product?.multimedia?.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`${product.name} - ${index}`}
                  className={`w-16 h-16 object-contain border p-1 cursor-pointer rounded ${
                    mainImage === img.url ? "border-blue-500" : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => setMainImage(img.url)}
                />
              ))}
              {(!product?.multimedia || product.multimedia.length === 0) && (
                <img
                  src="/placeholder-product.png"
                  alt="Imagen no disponible"
                  className="w-16 h-16 object-contain border p-1 border-blue-500 rounded"
                />
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="w-full md:w-2/5 lg:w-1/3 p-4">
            <div className="flex items-center mb-1">
              <span className="text-sm text-gray-500">Nuevo | ID: {product?.externalId}</span>
              {product?.stock > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">En stock</span>
              )}
            </div>
            
            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-1">{product?.name}</h1>
            
            {brandName && (
              <div className="mb-3">
                <span className="text-sm font-medium text-blue-600">Marca: {brandName}</span>
              </div>
            )}
            
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
            
            {/* Descripción del producto */}
            {product?.shortDescription && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700 text-sm whitespace-pre-line mb-2">{product.shortDescription}</p>
                {product?.description?.details && (
                  <p className="text-gray-700 text-sm whitespace-pre-line">{product.description.details}</p>
                )}
              </div>
            )}
            
            {/* Botones de acción - Verticales en móvil, horizontales en desktop */}
            <div className="mt-6">
              {/* Botones verticales para móvil */}
              <div className="flex flex-col space-y-3 md:hidden">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Agregar al carrito
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
              
              {/* Botones horizontales para tablet/desktop */}
              <div className="hidden md:grid md:grid-cols-3 md:gap-2 lg:gap-3">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center gap-1">
                  <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="text-sm lg:text-base">Agregar</span>
                </Button>
                <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-1">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="text-sm lg:text-base">Comprar</span>
                </Button>
                <Button 
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 py-3 rounded-md flex items-center justify-center gap-1"
                  onClick={() => navigate(`/e-commerce/rentar/${product?.id}`, { state: { product } })}
                >
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="text-sm lg:text-base">Rentar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        


        {/* Características principales - Estilo Mercado Libre */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Características principales</h2>
          
          {product?.description?.caracteristicas ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
              {product.description.caracteristicas.split('\n').map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="min-w-2 h-2 w-2 bg-blue-500 rounded-full mt-2 mr-2"></div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay características disponibles</p>
          )}
        </div>
        
        {/* Usos recomendados */}
        {product?.description?.aplicaciones && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Usos recomendados</h2>
            <p className="text-gray-700 whitespace-pre-line">{product?.description?.aplicaciones}</p>
          </div>
        )}
        
        {/* Sección destacada con fondo de color */}
        {product?.description?.destacados && (
          <div className="mt-6 p-6 rounded-lg text-white" style={{ backgroundColor: product?.color || '#2968c8' }}>
            <h3 className="text-xl font-bold mb-3 text-white">Características destacadas</h3>
            <p className="whitespace-pre-line text-white leading-relaxed">{product?.description?.destacados}</p>
          </div>
        )}

        {/* Especificaciones técnicas - Estilo Mercado Libre */}
        {(product?.technicalData || product?.functionalities) && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Especificaciones técnicas</h2>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {product?.technicalData && Object.entries(product.technicalData).map(([key, value], index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3 border-r border-gray-200">{key}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{value}</td>
                    </tr>
                  ))}
                  {product?.functionalities && Object.entries(product.functionalities).map(([key, value], index) => (
                    <tr key={`func-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3 border-r border-gray-200">{key}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
  
        {/* Descargas - Estilo Mercado Libre */}
        {product?.downloads && Object.keys(product.downloads).length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4 mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Documentación y descargas</h2>
            <ul className="space-y-2">
              {Object.entries(product.downloads).map(([key, url], index) => (
                <li key={index} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    {key.replace(/_/g, ' ')}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleProducto;
