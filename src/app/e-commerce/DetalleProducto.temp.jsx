import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock, ArrowLeft, Heart, Star, Truck, Shield, ChevronRight } from "lucide-react";
import { getActiveProductById } from "@/services/public/productService";
import { toast } from "sonner";
import Nav2 from "@/components/Nav2";

const DetalleProducto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [favorite, setFavorite] = useState(false);

  // Función para regresar a la página de categorías
  const handleBack = () => {
    navigate("/tienda", { replace: true });
  };

  // Cargar datos del producto
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await getActiveProductById(id);
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
    <div className="w-full bg-gray-100 min-h-screen pt-16">
      <Nav2 />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Migas de pan y navegación */}
        <div className="py-2 flex items-center text-sm text-gray-500">
          <button onClick={handleBack} className="flex items-center hover:text-blue-500">
            <ArrowLeft size={16} className="mr-1" />
            Volver al listado
          </button>
          <ChevronRight size={14} className="mx-2" />
          <span className="truncate">{product?.name}</span>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow-sm mt-2">
          {/* Galería de imágenes */}
          <div className="w-full md:w-2/3 lg:w-7/12 p-4">
            <div className="relative group">
              <button 
                onClick={() => setFavorite(!favorite)}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              >
                <Heart size={20} className={favorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>
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
            <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
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
          <div className="w-full md:w-1/3 lg:w-5/12 p-4">
            <div className="flex items-center mb-1">
              <span className="text-sm text-gray-500">Nuevo | ID: {product?.externalId}</span>
              {product?.stock > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">En stock</span>
              )}
            </div>
            
            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">{product?.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm text-blue-500 ml-2">(24 opiniones)</span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">${product?.price?.toLocaleString()}</span>
                {product?.discount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-md">{product.discount}% OFF</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">en 12x ${(product?.price / 12).toFixed(2)}</p>
              <p className="text-blue-500 text-sm mt-1">Ver los medios de pago</p>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <Truck size={18} className="text-green-500 mr-2" />
                <div>
                  <p className="font-medium">Envío gratis a todo el país</p>
                  <p className="text-gray-500">Conoce los tiempos y las formas de envío</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-700">
                <Shield size={18} className="text-green-500 mr-2" />
                <div>
                  <p className="font-medium">Garantía de 12 meses</p>
                  <p className="text-gray-500">Garantía del vendedor</p>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="space-y-3 mt-6">
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
          </div>
        </div>
        
        {/* Descripción del producto */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Descripción</h2>
          <p className="text-gray-700 whitespace-pre-line mb-4">{product?.shortDescription}</p>
          
          {product?.description?.details && (
            <p className="text-gray-700 whitespace-pre-line">{product?.description?.details}</p>
          )}
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
            <p className="text-gray-500">ísticas disponibles</p>
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
