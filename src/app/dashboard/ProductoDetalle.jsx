// ProductoDetalle.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProductById } from "@/services/admin/productService";

export default function ProductoDetalle() {
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const productId = localStorage.getItem("selectedProductId");
    if (!productId) {
      toast.error("No se ha seleccionado ningún producto");
      navigate("/dashboard");
      return;
    }
    fetchProduct(productId);
  }, []);

  const fetchProduct = async (id) => {
    try {
      const data = await getProductById(id);
      if (data.type === "SUCCESS" && data.result) {
        setProducto(data.result);
        setMainImage(data.result.multimedia[0]?.url || data.result.brandDto.logoUrl);
      } else {
        toast.error("Producto no encontrado");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Error al cargar el producto");
      console.error(error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem("selectedProductId");
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!producto) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Button className="bg-blue-500 rounded-b-2xl hover:bg-blue-700 mb-3" onClick={handleBack}>
          Regresar al Dashboard
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Galería de imágenes */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-md h-80 flex justify-center items-center">
            <img
              src={mainImage}
              alt={producto.name}
              className="w-full h-full object-contain"
            />
          </div>
          {producto.multimedia?.length > 1 && (
            <div className="flex mt-4 space-x-2 overflow-x-auto">
              {producto.multimedia.map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt={`${producto.name} - ${index}`}
                  className={`w-16 h-16 object-contain border p-1 cursor-pointer ${
                    mainImage === media.url ? "border-blue-600" : "border-gray-300"
                  }`}
                  onClick={() => setMainImage(media.url)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{producto.name}</h1>
          <p className="text-md sm:text-lg text-gray-700 font-bold my-2">{producto.externalId}</p>
          <p className="text-gray-600 text-md sm:text-lg font-semibold">{producto.shortDescription}</p>

          {/* Descripción completa */}
          {producto.description && (
            <div className="mt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Descripción completa</h3>
              {(() => {
                try {
                  const description = JSON.parse(producto.description);
                  return (
                    <div className="space-y-4">
                      {description.caracteristicas && (
                        <div>
                          <h4 className="font-semibold text-gray-800">Características</h4>
                          <p className="text-gray-700 whitespace-pre-line">{description.caracteristicas}</p>
                        </div>
                      )}
                      {description.details && (
                        <div>
                          <h4 className="font-semibold text-gray-800">Detalles</h4>
                          <p className="text-gray-700 whitespace-pre-line">{description.details}</p>
                        </div>
                      )}
                      {description.aplicaciones && (
                        <div>
                          <h4 className="font-semibold text-gray-800">Aplicaciones</h4>
                          <p className="text-gray-700 whitespace-pre-line">{description.aplicaciones}</p>
                        </div>
                      )}
                      {description.destacados && (
                        <div>
                          <h4 className="font-semibold text-gray-800">Destacados</h4>
                          <p className="text-gray-700 whitespace-pre-line">{description.destacados}</p>
                        </div>
                      )}
                    </div>
                  );
                } catch (error) {
                  console.error("Error al parsear la descripción:", error);
                  return <p className="text-gray-700">{producto.description}</p>;
                }
              })()}
            </div>
          )}

          {/* Características técnicas */}
          {producto.technicalData && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Características técnicas</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {Object.entries(producto.technicalData).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </>
          )}

          {/* Funcionalidades */}
          {producto.functionalities && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Funcionalidades</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {Object.entries(producto.functionalities).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-blue-950">Información del producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700"><span className="font-semibold">Tipo:</span> {producto.type}</p>
            <p className="text-gray-700"><span className="font-semibold">Uso:</span> {producto.productUsage}</p>
            <p className="text-gray-700"><span className="font-semibold">Precio:</span> ${producto.price}</p>
            <p className="text-gray-700"><span className="font-semibold">Descuento:</span> {producto.discount}%</p>
          </div>
          <div>
            <p className="text-gray-700"><span className="font-semibold">Stock:</span> {producto.stock} unidades</p>
            <p className="text-gray-700"><span className="font-semibold">Garantía:</span> {producto.garanty} años</p>
            <p className="text-gray-700"><span className="font-semibold">Marca:</span> {producto.brandDto.name}</p>
            <p className="text-gray-700"><span className="font-semibold">Categorías:</span> {producto.productCategories.map(cat => cat.name).join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Sección destacada con color del producto */}
      <div 
        className="mt-12 p-6 text-center rounded-md"
        style={{ 
          backgroundColor: producto.color || producto.brandDto.color || '#1C398E',
          color: 'white'
        }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">INFORMACIÓN DESTACADA</h2>
        {producto.description && (() => {
          try {
            const description = JSON.parse(producto.description);
            return (
              <div className="space-y-4 text-left">
                {description.destacados && (
                  <div className="text-lg">
                    {description.destacados}
                  </div>
                )}
                {description.caracteristicas && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Características principales</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {description.caracteristicas.split('\n').map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {description.aplicaciones && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Aplicaciones</h3>
                    <p>{description.aplicaciones}</p>
                  </div>
                )}
              </div>
            );
          } catch (error) {
            console.error("Error al parsear la descripción:", error);
            return <p>{producto.description}</p>;
          }
        })()}
      </div>

      {/* Especificaciones técnicas */}
      {producto.technicalData && Object.keys(producto.technicalData).length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-blue-950">ESPECIFICACIONES TÉCNICAS</h2>
          <div className="w-80">
            <hr />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(producto.technicalData).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">
                  {key.replace(/\b\w/g, l => l.toUpperCase())}:
                </span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de descargas */}
      {producto.downloads && Object.keys(producto.downloads).length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-blue-950 mb-2">DESCARGAS</h2>
          <div className="w-80">
            <hr />
          </div>
          <ul className="mt-4 space-y-2">
            {Object.entries(producto.downloads).map(([key, url]) => (
              <li key={key} className="text-blue-600 hover:underline">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
