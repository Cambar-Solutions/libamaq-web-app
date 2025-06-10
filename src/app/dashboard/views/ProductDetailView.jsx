import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Package, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductById } from "@/services/admin/productService";
import ProductEdit from "../ProductEdit";

// Componente para visualizar los detalles del producto
const ProductView = ({ product }) => {
  if (!product) return <div>No hay información disponible</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detalles del Producto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Nombre</h3>
              <p className="text-lg">{product.name || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">ID Externo</h3>
              <p>{product.externalId || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Marca</h3>
              <p>{product.brand?.name || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Categoría</h3>
              <p>{product.category?.name || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Tipo</h3>
              <p>{product.type || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Uso del Producto</h3>
              <p>{product.productUsage || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Color</h3>
              <p>{product.color || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Garantía</h3>
              <p>{product.garanty || 0} meses</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Rentable</h3>
              <p>{product.rentable ? "Sí" : "No"}</p>
            </div>
          </div>

          {/* Precios e inventario */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Precio</h3>
              <p className="text-lg font-semibold">${product.price?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Costo</h3>
              <p>${product.cost?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Descuento</h3>
              <p>{product.discount || 0}%</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Stock</h3>
              <p>{product.stock || 0} unidades</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Estado</h3>
              <p>{product.status || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Creado por</h3>
              <p>{product.createdBy || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Fecha de creación</h3>
              <p>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Última actualización</h3>
              <p>{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Descripción</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="whitespace-pre-wrap">{product.description || "Sin descripción"}</p>
          </div>
        </div>

        {/* Descripción corta */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Descripción Corta</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="whitespace-pre-wrap">{product.shortDescription || "Sin descripción corta"}</p>
          </div>
        </div>

        {/* Datos técnicos */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Datos Técnicos</h3>
          {product.technicalData && product.technicalData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.technicalData.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <span className="font-medium">{item.key}: </span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              No hay datos técnicos disponibles
            </div>
          )}
        </div>

        {/* Funcionalidades */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Funcionalidades</h3>
          {product.functionalities && product.functionalities.length > 0 ? (
            <div className="p-4 bg-gray-50 rounded-md">
              <ul className="list-disc pl-5 space-y-1">
                {product.functionalities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              No hay funcionalidades disponibles
            </div>
          )}
        </div>

        {/* Descargas */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Descargas</h3>
          {product.downloads && product.downloads.length > 0 ? (
            <div className="space-y-2">
              {product.downloads.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="font-medium">{item.key || item.name}</span>
                  <a 
                    href={item.value || item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Descargar
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              No hay descargas disponibles
            </div>
          )}
        </div>

        {/* Imágenes */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">Imágenes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.media && product.media.length > 0 ? (
              product.media.map((img, index) => (
                <div key={img.id || index} className="relative aspect-square">
                  <img
                    src={img.url}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-4 bg-gray-50 rounded-md">
                No hay imágenes disponibles
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal que integra las pestañas
export default function ProductDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view");
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (id) {
      console.log("ProductDetailView - ID recibido:", id);
      loadProduct(id);
    } else {
      console.error("ProductDetailView - No se recibió ID");
      toast.error("No se pudo identificar el producto");
      navigate("/dashboard");
    }
  }, [id, navigate]);

  const loadProduct = async (productId) => {
    try {
      setIsLoading(true);
      setLoadError(null); // Limpiar errores anteriores
      console.log("ProductDetailView - Cargando producto con ID:", productId);
      
      const response = await getProductById(productId);
      console.log("ProductDetailView - Respuesta de getProductById:", response);
      
      // Manejar diferentes formatos de respuesta
      if (response) {
        // Si la respuesta tiene un formato específico con data o result
        if (response.data) {
          console.log("ProductDetailView - Formato de respuesta con data:", response.data);
          setProduct(response.data);
        } else if (response.result) {
          console.log("ProductDetailView - Formato de respuesta con result:", response.result);
          setProduct(response.result);
        } else {
          // Si la respuesta es directamente el objeto producto
          console.log("ProductDetailView - Formato de respuesta directo:", response);
          setProduct(response);
        }
      } else {
        const errorMsg = "No se pudo cargar el producto: respuesta vacía";
        console.error(errorMsg);
        setLoadError(errorMsg);
        toast.error("No se pudo cargar el producto");
      }
    } catch (error) {
      const errorMsg = "Error al cargar el producto: " + (error.message || "Error desconocido");
      console.error("ProductDetailView - ", errorMsg, error);
      setLoadError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (loadError && !product) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Error al cargar el producto</h1>
          </div>
        </div>
        
        <Card className="w-full p-6">
          <div className="text-center space-y-4">
            <p className="text-red-500">{loadError}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => loadProduct(id)}>Reintentar</Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Volver al Dashboard</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {product?.name || "Detalle de Producto"}
            </h1>
            <p className="text-sm text-gray-500">ID: {product?.id || ""}</p>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="view"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="view" className="flex items-center">
            <Eye className="w-4 h-4 mr-2" /> Visualizar
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center">
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-0">
          <ProductView product={product} />
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          {/* Usamos el componente ProductEdit existente */}
          {product ? (
            <ProductEdit 
              productData={product} 
              onSave={() => {
                console.log("Producto actualizado, recargando datos...");
                loadProduct(id);
                setActiveTab("view");
                toast.success("Producto actualizado correctamente");
              }} 
            />
          ) : (
            <div className="p-6 text-center">
              <p>No se pudo cargar la información del producto para editar.</p>
              <Button 
                onClick={() => loadProduct(id)}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
