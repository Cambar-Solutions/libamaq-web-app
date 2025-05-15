import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock, ArrowLeft, Share2, Shield, Home } from "lucide-react";
import { getProductById } from "@/services/public/productService";
import ShareProduct from "@/components/ShareProduct";
import { toast } from "sonner";
import Nav2 from "@/components/Nav2";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DetalleProducto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [highlightActive, setHighlightActive] = useState(false);

  // Función para regresar a la página de categorías
  const handleBack = () => {
    navigate("/tienda", { replace: true });
  };

  // Efecto para activar el resaltado del nombre del producto
  useEffect(() => {
    if (product) {
      // Activar el resaltado después de cargar el producto
      setHighlightActive(true);
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

  return (
    <div className="w-full bg-gray-100 min-h-screen pt-20 pb-8">
      <Nav2 />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Migas de pan y navegación con el componente Breadcrumb */}
        <div className="py-4 mt-4 text-sm lg:text-base">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/" className="flex items-center text-gray-700 hover:text-blue-700">
          <Home size={18} className="mr-1" />
          Inicio
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink
          href="/tienda"
          onClick={(e) => { e.preventDefault(); handleBack(); }}
          className="text-gray-700 hover:text-blue-700"
        >
          Tienda
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className={`truncate transition-colors duration-300 font-semibold ${highlightActive ? 'text-blue-700' : 'text-gray-600'}`}>
          {product?.name}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>


        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm mt-2">
          {/* Galería de imágenes */}
          <div className="w-full md:w-1/2 lg:w-3/5 p-4">
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
                {/* Componente para compartir en redes sociales */}
                <div className="absolute top-2 right-2 z-10">
                  <ShareProduct product={product} />
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
            <div className="mt-8">
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

        {/* Contenedor combinado: Características destacadas + info */}
<div className="mt-6 flex flex-col lg:flex-row gap-6">
  {/* Características destacadas al lado izquierdo */}
  {product?.description?.destacados && (
    <div
      className="p-6 rounded-lg text-white w-full lg:w-1/2"
      style={{ backgroundColor: product?.color || '#2968c8' }}
    >
      <h3 className="text-lg lg:text-xl font-bold mb-3 text-white">Características destacadas</h3>
      <p className="whitespace-pre-line text-sm lg:text-base leading-relaxed text-white">{product.description.destacados}</p>
    </div>
  )}

  {/* Características principales + Usos recomendados */}
  <div className="w-full lg:w-1/2 flex flex-col gap-4">
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg lg:text-2xl font-medium text-gray-900 mb-4">Características principales</h2>
      {product?.description?.caracteristicas ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
          {product.description.caracteristicas.split('\n').map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="min-w-2 h-2 w-2 bg-blue-500 rounded-full mt-2 mr-2"></div>
              <span className="text-gray-700 text-sm lg:text-base">{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No hay características disponibles</p>
      )}
    </div>

    {product?.description?.aplicaciones && (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg lg:text-2xl font-medium text-gray-900 mb-4">Usos recomendados</h2>
        <p className="text-gray-700 whitespace-pre-line text-sm lg:text-base">{product.description.aplicaciones}</p>
      </div>
    )}
  </div>
</div>

        



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
