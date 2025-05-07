import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProductById, updateProduct, uploadImage } from "@/services/admin/productService";
import { getAllBrands } from "@/services/admin/brandService";
import { getAllCategories } from "@/services/admin/categoryService";
import { createMultimedia } from "@/services/admin/multimediaService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductoDetalle() {
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();

  // Función para cargar los datos del producto
  const loadProductData = async (id) => {
    try {
      setIsLoading(true);
      
      console.log(`Cargando datos del producto con ID ${id}...`);
      
      // Forzar una recarga completa desde el servidor
      const response = await getProductById(id);
      console.log('Respuesta completa del servidor:', response);
      
      if (response.type === "SUCCESS" && response.result) {
        const product = response.result;
        
        // Asegurarse de que los campos dinámicos estén inicializados como objetos
        if (!product.technicalData) product.technicalData = {};
        if (!product.functionalities) product.functionalities = {};
        if (!product.downloads) product.downloads = {};
        if (!product.description) product.description = {};
        
        // Procesar campos JSON si son strings
        if (typeof product.technicalData === 'string') {
          try {
            product.technicalData = JSON.parse(product.technicalData);
          } catch (e) {
            console.error('Error al parsear technicalData:', e);
            product.technicalData = {};
          }
        }
        
        if (typeof product.functionalities === 'string') {
          try {
            product.functionalities = JSON.parse(product.functionalities);
          } catch (e) {
            console.error('Error al parsear functionalities:', e);
            product.functionalities = {};
          }
        }
        
        if (typeof product.downloads === 'string') {
          try {
            product.downloads = JSON.parse(product.downloads);
          } catch (e) {
            console.error('Error al parsear downloads:', e);
            product.downloads = {};
          }
        }
        
        if (typeof product.description === 'string') {
          try {
            product.description = JSON.parse(product.description);
          } catch (e) {
            console.error('Error al parsear description:', e);
            product.description = {};
          }
        }
        
        // Asegurarse de que brandId y categoryId estén presentes
        product.brandId = product.brandId || product.brand_id;
        product.categoryId = product.categoryId || product.category_id;
        product.brand_id = product.brandId;
        product.category_id = product.categoryId;
        
        console.log('Producto cargado (procesado):', product);
        console.log('Datos técnicos:', product.technicalData);
        
        // Actualizar el estado con los datos procesados
        setProducto({...product});
        setEditedProduct({...product});
        setUploadedImages(product.multimedia || []);
        if (product.multimedia && product.multimedia.length > 0) {
          setMainImage(product.multimedia[0]?.url);
        }
        
        return product;
      } else {
        toast.error("Error al cargar el producto");
        navigate("/dashboard");
        return null;
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      toast.error("Error al cargar los datos del producto: " + (error.message || 'Error desconocido'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const productId = localStorage.getItem("selectedProductId");
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const id = localStorage.getItem("selectedProductId");
        
        if (id) {
          await loadProductData(id);
        } else {
          navigate("/dashboard");
        }
        
        // Cargar marcas y categorías en paralelo para mejorar el rendimiento
        try {
          const [brandsResponse, categoriesResponse] = await Promise.all([
            getAllBrands(),
            getAllCategories()
          ]);
          
          console.log('Respuesta de marcas:', brandsResponse);
          console.log('Respuesta de categorías:', categoriesResponse);
          
          if (brandsResponse.type === "SUCCESS" && brandsResponse.result) {
            setBrands(brandsResponse.result);
            console.log('Marcas cargadas:', brandsResponse.result);
          } else {
            console.error('Error al cargar marcas:', brandsResponse);
            toast.error("Error al cargar las marcas");
          }
          
          if (categoriesResponse.type === "SUCCESS" && categoriesResponse.result) {
            setCategories(categoriesResponse.result);
            console.log('Categorías cargadas:', categoriesResponse.result);
          } else {
            console.error('Error al cargar categorías:', categoriesResponse);
            toast.error("Error al cargar las categorías");
          }
        } catch (error) {
          console.error('Error al cargar marcas y categorías:', error);
          toast.error("Error al cargar marcas y categorías");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Función para manejar el cambio de marca y actualizar el color automáticamente
  const handleBrandChange = (value) => {
    const selectedBrand = brands.find(b => b.id === +value);
    setEditedProduct(prev => ({
      ...prev,
      brandId: value,
      brand_id: value, // Mantener ambos por compatibilidad
      color: selectedBrand?.color || prev.color
    }));
  };

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (value) => {
    setEditedProduct(prev => ({
      ...prev,
      categoryId: value,
      category_id: value // Mantener ambos por compatibilidad
    }));
  };



  // Función para manejar la carga de imágenes
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsLoading(true);
    try {
      const results = await Promise.all(
        files.map(file => createMultimedia(file))
      );
      
      // Actualizar las imágenes cargadas
      setUploadedImages(prev => [...prev, ...results]);
      
      // Actualizar el producto editado con las nuevas imágenes
      setEditedProduct(prev => {
        const base = prev.multimedia?.length || 0;
        const newMultimedia = results.map((img, i) => ({
          id: img.id,
          url: img.url,
          displayOrder: base + i + 1
        }));
        
        return {
          ...prev,
          multimedia: [...(prev.multimedia || []), ...newMultimedia],
          productMultimediaDto: [...(prev.productMultimediaDto || []), ...newMultimedia.map(m => ({
            multimediaId: m.id,
            displayOrder: m.displayOrder,
            productId: prev.id
          }))]
        };
      });
      
      toast.success("Imágenes cargadas correctamente");
    } catch (error) {
      toast.error("Error al cargar las imágenes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar una imagen
  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setEditedProduct(prev => {
      const updatedMultimedia = prev.multimedia.filter((_, i) => i !== index);
      
      // Si la imagen eliminada era la principal, actualizamos la imagen principal
      if (mainImage === prev.multimedia[index]?.url) {
        setMainImage(updatedMultimedia[0]?.url || '');
      }
      
      return {
        ...prev,
        multimedia: updatedMultimedia,
        productMultimediaDto: prev.productMultimediaDto?.filter((_, i) => i !== index) || []
      };
    });
  };

  // Funciones para manejar campos dinámicos
  const handleAddField = (section) => {
    // Crear una copia profunda del estado actual
    const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
    
    // Asegurarse de que la sección existe
    if (!updatedProduct[section]) {
      updatedProduct[section] = {};
    }
    
    // Añadir el nuevo campo con un ID único
    const newKey = `nuevo_${Date.now()}`;
    updatedProduct[section][newKey] = "";
    
    // Actualizar el estado
    setEditedProduct(updatedProduct);
    
    // Log para depuración
    console.log(`Campo añadido a ${section}:`, updatedProduct[section]);
  };

  const handleRemoveField = (section, key) => {
    // Crear una copia profunda del estado actual
    const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
    
    // Asegurarse de que la sección existe
    if (updatedProduct[section] && updatedProduct[section][key] !== undefined) {
      // Eliminar el campo
      delete updatedProduct[section][key];
      
      // Actualizar el estado
      setEditedProduct(updatedProduct);
      
      // Log para depuración
      console.log(`Campo eliminado de ${section}:`, updatedProduct[section]);
    }
  };

  const handleFieldChange = (section, key, value) => {
    // Crear una copia profunda del estado actual
    const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
    
    // Asegurarse de que la sección existe
    if (!updatedProduct[section]) {
      updatedProduct[section] = {};
    }
    
    // Actualizar el valor
    updatedProduct[section][key] = value;
    
    // Actualizar el estado
    setEditedProduct(updatedProduct);
    
    // Log para depuración
    console.log(`Valor actualizado en ${section}[${key}]:`, value);
    console.log('Estado actualizado:', updatedProduct[section]);
  };

  const handleFieldKeyChange = (section, oldKey, newKey) => {
    // Evitar claves vacías
    if (!newKey.trim()) return;
    
    // Si las claves son iguales, no hacer nada
    if (oldKey === newKey) return;
    
    // Crear una copia profunda del estado actual
    const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
    
    // Asegurarse de que la sección existe
    if (!updatedProduct[section]) {
      updatedProduct[section] = {};
    }
    
    // Si la clave antigua existe, copiar su valor a la nueva clave
    if (updatedProduct[section][oldKey] !== undefined) {
      const value = updatedProduct[section][oldKey];
      updatedProduct[section][newKey] = value;
      delete updatedProduct[section][oldKey];
      
      // Actualizar el estado
      setEditedProduct(updatedProduct);
      
      // Log para depuración
      console.log(`Clave cambiada en ${section}: ${oldKey} -> ${newKey}`);
      console.log('Estado actualizado:', updatedProduct[section]);
    }
  };

  const handleBack = () => {
    localStorage.removeItem("selectedProductId");
    navigate("/dashboard");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProduct({ ...producto });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Crear una copia profunda para evitar problemas de referencia
      const productToUpdate = JSON.parse(JSON.stringify(editedProduct));
      
      console.log('Estado actual antes de guardar:', productToUpdate);
      
      // Asegurarse de que los campos dinámicos estén presentes y sean objetos
      if (!productToUpdate.technicalData) productToUpdate.technicalData = {};
      if (!productToUpdate.functionalities) productToUpdate.functionalities = {};
      if (!productToUpdate.downloads) productToUpdate.downloads = {};
      if (!productToUpdate.description) productToUpdate.description = {};
      
      // Preparar los datos del producto para la actualización
      const productData = {
        ...productToUpdate,
        id: Number(productToUpdate.id),
        status: productToUpdate.status || 'ACTIVE',
        // Asegurarse de que los campos JSON sean objetos, no strings
        description: typeof productToUpdate.description === 'string' 
          ? JSON.parse(productToUpdate.description) 
          : productToUpdate.description,
        technicalData: typeof productToUpdate.technicalData === 'string' 
          ? JSON.parse(productToUpdate.technicalData) 
          : productToUpdate.technicalData,
        functionalities: typeof productToUpdate.functionalities === 'string' 
          ? JSON.parse(productToUpdate.functionalities) 
          : productToUpdate.functionalities,
        downloads: typeof productToUpdate.downloads === 'string' 
          ? JSON.parse(productToUpdate.downloads) 
          : productToUpdate.downloads,
        // Asegurarse de que los IDs sean números
        brandId: Number(productToUpdate.brandId || productToUpdate.brand_id || 0),
        categoryId: Number(productToUpdate.categoryId || productToUpdate.category_id || 0),
        // Asegurarse de que los valores numéricos sean números
        cost: Number(productToUpdate.cost || 0),
        price: Number(productToUpdate.price || 0),
        discount: Number(productToUpdate.discount || 0),
        stock: Number(productToUpdate.stock || 0),
        garanty: Number(productToUpdate.garanty || 0),
        // Procesar multimedia
        productMultimediaDto: Array.isArray(productToUpdate.multimedia)
          ? productToUpdate.multimedia.map((m, index) => ({
              id: m.id ? Number(m.id) : 0,
              displayOrder: index + 1,
              productId: Number(productToUpdate.id),
              multimediaId: m.id ? Number(m.id) : 0
            }))
          : []
      };
      
      // Mantener compatibilidad con brand_id y category_id
      productData.brand_id = productData.brandId;
      productData.category_id = productData.categoryId;
      
      console.log('Datos preparados para enviar al servidor:', productData);
      
      // Enviar la actualización al servidor
      const response = await updateProduct(productData);
      console.log('Respuesta del servidor:', response);
      
      if (response && (response.type === "SUCCESS" || response.result)) {
        toast.success("Producto actualizado correctamente");
        
        // Recargar los datos del producto desde el servidor para asegurar que tenemos la última versión
        await loadProductData(productData.id);
        
        // Cambiar a la pestaña de visualización para ver los cambios
        setIsEditing(false);
      } else {
        toast.error("Error al actualizar el producto: " + (response?.message || "Error desconocido"));
      }
    } catch (error) {
      toast.error("Error al actualizar el producto: " + (error.message || 'Error desconocido'));
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProduct({ ...producto });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Crear una copia profunda del estado actual para evitar problemas de referencia
    const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
    
    // Actualizar el campo correspondiente
    updatedProduct[name] = type === 'number' ? Number(value) : value;
    
    // Actualizar el estado con la copia actualizada
    setEditedProduct(updatedProduct);
  };

  const handleJsonInputChange = (name, value) => {
    try {
      // Crear una copia profunda del estado actual
      const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
      
      // Intentar parsear el valor como JSON si es una cadena
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      
      // Actualizar el campo correspondiente
      updatedProduct[name] = jsonValue;
      
      // Actualizar el estado
      setEditedProduct(updatedProduct);
    } catch (error) {
      // Si hay un error al parsear, usar el valor tal cual
      const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
      updatedProduct[name] = value;
      setEditedProduct(updatedProduct);
      
      console.error(`Error al procesar el campo JSON ${name}:`, error);
    }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2" onClick={handleBack} disabled={isLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Regresar al Dashboard
        </Button>
        {isEditing && (
          <div className="flex space-x-3">
            <Button 
              className="bg-gray-400 hover:bg-gray-500 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2" 
              onClick={handleCancel} 
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              Cancelar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2" 
              onClick={handleSave} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="relative w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 mb-0">
          <h2 className="text-xl font-semibold">Detalles del Producto</h2>
        </div>
        <div className="p-6">
          <Tabs defaultValue={isEditing ? "edit" : "view"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gradient-to-r from-blue-50 to-slate-100 border border-slate-200 rounded-lg shadow-md p-1">
          <TabsTrigger value="view" onClick={() => setIsEditing(false)} className="font-medium text-blue-800 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Visualización
            </span>
          </TabsTrigger>
          <TabsTrigger value="edit" onClick={handleEdit} className="font-medium text-blue-800 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Edición
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-0">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Galería de imágenes */}
            <div className="w-full lg:w-1/2 flex flex-col items-center">
              <div className="w-full max-w-md h-80 flex justify-center items-center">
                <img src={mainImage} alt={producto.name} className="w-full h-full object-contain" />
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

            {/* Información básica del producto */}
            <div className="w-full lg:w-1/2">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{producto.name}</h1>
              <p className="text-md sm:text-lg text-gray-700 font-bold my-2">{producto.externalId}</p>
              <p className="text-gray-600 text-md sm:text-lg font-semibold">{producto.shortDescription}</p>
              
              {/* Información básica y técnica del producto */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {producto.price > 0 && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Precio:</span>
                    <p className="font-semibold">${producto.price.toLocaleString()}</p>
                  </div>
                )}
                {producto.cost > 0 && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Costo:</span>
                    <p className="font-semibold">${producto.cost.toLocaleString()}</p>
                  </div>
                )}
                {producto.stock > 0 && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Stock:</span>
                    <p className="font-semibold">{producto.stock} unidades</p>
                  </div>
                )}
                {producto.discount > 0 && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Descuento:</span>
                    <p className="font-semibold">{producto.discount}%</p>
                  </div>
                )}
                {producto.garanty > 0 && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Garantía:</span>
                    <p className="font-semibold">{producto.garanty} meses</p>
                  </div>
                )}
                {producto.type && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Tipo:</span>
                    <p className="font-semibold">{producto.type}</p>
                  </div>
                )}
                {producto.productUsage && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 text-sm">Uso:</span>
                    <p className="font-semibold">{producto.productUsage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional del producto */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Características */}
            {producto.description?.caracteristicas && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Características</h4>
                <p className="text-gray-700 whitespace-pre-line">{producto.description.caracteristicas}</p>
              </div>
            )}
            
            {/* Detalles */}
            {producto.description?.details && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Detalles</h4>
                <p className="text-gray-700 whitespace-pre-line">{producto.description.details}</p>
              </div>
            )}
            
            {/* Aplicaciones */}
            {producto.description?.aplicaciones && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Aplicaciones</h4>
                <p className="text-gray-700 whitespace-pre-line">{producto.description.aplicaciones}</p>
              </div>
            )}
          </div>

          {/* Sección destacada con fondo de color */}
          {producto.description?.destacados && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: producto.color || '#f3f4f6' }}>
              <h3 className="text-xl font-bold text-white mb-2">Características destacadas</h3>
              <p className="text-white whitespace-pre-line">{producto.description.destacados}</p>
            </div>
          )}

          {/* Especificaciones técnicas */}
          <div className="mt-6" data-component-name="ProductoDetalle">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ESPECIFICACIONES TÉCNICAS</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {producto.technicalData && Object.entries(producto.technicalData).length > 0 ? (
                    Object.entries(producto.technicalData).map(([key, value]) => (
                      <tr key={`tech-${key}`}>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3 capitalize" data-component-name="ProductoDetalle">{key}</td>
                        <td className="px-6 py-3 text-sm text-gray-500" data-component-name="ProductoDetalle">{value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm text-gray-500 text-center">No hay especificaciones técnicas disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">FUNCIONALIDADES</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {producto.functionalities && Object.entries(producto.functionalities).length > 0 ? (
                    Object.entries(producto.functionalities).map(([key, value]) => (
                      <tr key={`func-${key}`}>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3 capitalize">{key}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm text-gray-500 text-center">No hay funcionalidades disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Sección de descargas */}
          {producto.downloads && Object.keys(producto.downloads).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Descargas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(producto.downloads).map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 font-medium capitalize">{key.replace('_', ' ')}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos básicos */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Datos básicos</h3>
                
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre</Label>
                  <Input 
                    id="name"
                    name="name" 
                    value={editedProduct.name} 
                    onChange={handleInputChange} 
                    className="mt-1" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="externalId" className="text-sm font-medium text-gray-700">ID Externo</Label>
                  <Input 
                    id="externalId"
                    name="externalId" 
                    value={editedProduct.externalId} 
                    onChange={handleInputChange} 
                    className="mt-1" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Marca</Label>
                    <Select
                      value={editedProduct.brandId ? editedProduct.brandId.toString() : ""}
                      onValueChange={(value) => handleBrandChange(parseInt(value))}
                    >
                      <SelectTrigger id="brand">
                        <SelectValue placeholder="Seleccionar marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            <div className="flex items-center">
                              {brand.color && (
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: brand.color }}
                                />
                              )}
                              {brand.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Categoría</Label>
                    <Select
                      value={editedProduct.categoryId ? editedProduct.categoryId.toString() : ""}
                      onValueChange={(value) => handleCategoryChange(parseInt(value))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="color" className="text-sm font-medium text-gray-700">Color</Label>
                  <div className="flex items-center mt-1">
                    <Input 
                      id="color"
                      name="color" 
                      type="color"
                      value={editedProduct.color || '#000000'} 
                      onChange={handleInputChange} 
                      className="w-12 h-10 p-1 mr-2" 
                    />
                    <Input 
                      name="colorHex" 
                      value={editedProduct.color || '#000000'} 
                      onChange={(e) => setEditedProduct(prev => ({ ...prev, color: e.target.value }))} 
                      className="flex-1" 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-700">Descripción corta</Label>
                  <textarea 
                    id="shortDescription"
                    name="shortDescription" 
                    value={editedProduct.shortDescription} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">Precio</Label>
                    <Input 
                      id="price"
                      type="number" 
                      name="price" 
                      value={editedProduct.price} 
                      onChange={handleInputChange} 
                      className="mt-1" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cost" className="text-sm font-medium text-gray-700">Costo</Label>
                    <Input 
                      id="cost"
                      type="number" 
                      name="cost" 
                      value={editedProduct.cost} 
                      onChange={handleInputChange} 
                      className="mt-1" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
                    <Input 
                      id="stock"
                      type="number" 
                      name="stock" 
                      value={editedProduct.stock} 
                      onChange={handleInputChange} 
                      className="mt-1" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="garanty" className="text-sm font-medium text-gray-700">Garantía (meses)</Label>
                    <Input 
                      id="garanty"
                      type="number" 
                      name="garanty" 
                      value={editedProduct.garanty} 
                      onChange={handleInputChange} 
                      className="mt-1" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discount" className="text-sm font-medium text-gray-700">Descuento (%)</Label>
                    <Input 
                      id="discount"
                      type="number" 
                      name="discount" 
                      value={editedProduct.discount} 
                      onChange={handleInputChange} 
                      className="mt-1" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">Tipo</Label>
                    <Input 
                      id="type"
                      name="type" 
                      value={editedProduct.type} 
                      onChange={handleInputChange} 
                      className="mt-1" 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="productUsage" className="text-sm font-medium text-gray-700">Uso del producto</Label>
                  <textarea 
                    id="productUsage"
                    name="productUsage" 
                    value={editedProduct.productUsage} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                    rows="2"
                  />
                </div>
              </div>
              
              {/* Galería de imágenes */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Galería de imágenes</h3>
                <div className="w-full h-64 flex justify-center items-center border border-gray-300 rounded-md mb-4">
                  <img src={mainImage} alt={editedProduct.name} className="max-h-full max-w-full object-contain" />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="imageUpload" className="text-sm font-medium text-gray-700">Agregar imágenes</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    multiple
                    accept="image/*,.webp"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Puedes seleccionar múltiples imágenes</p>
                </div>
                
                {editedProduct.multimedia?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editedProduct.multimedia.map((media, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={media.url}
                          alt={`${editedProduct.name} - ${index}`}
                          className={`w-full h-20 object-contain border p-1 cursor-pointer ${mainImage === media.url ? "border-blue-600" : "border-gray-300"}`}
                          onClick={() => setMainImage(media.url)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Eliminar imagen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Descripción completa */}
            {editedProduct.description && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Descripción completa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                    <textarea
                      name="caracteristicas"
                      value={editedProduct.description?.caracteristicas || ''}
                      onChange={(e) => {
                        const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                        if (!updatedProduct.description) updatedProduct.description = {};
                        updatedProduct.description.caracteristicas = e.target.value;
                        setEditedProduct(updatedProduct);
                      }}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
                    <textarea
                      name="details"
                      value={editedProduct.description?.details || ''}
                      onChange={(e) => {
                        const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                        if (!updatedProduct.description) updatedProduct.description = {};
                        updatedProduct.description.details = e.target.value;
                        setEditedProduct(updatedProduct);
                      }}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aplicaciones</label>
                    <textarea
                      name="aplicaciones"
                      value={editedProduct.description?.aplicaciones || ''}
                      onChange={(e) => {
                        const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                        if (!updatedProduct.description) updatedProduct.description = {};
                        updatedProduct.description.aplicaciones = e.target.value;
                        setEditedProduct(updatedProduct);
                      }}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destacados</label>
                    <textarea
                      name="destacados"
                      value={editedProduct.description?.destacados || ''}
                      onChange={(e) => {
                        const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                        if (!updatedProduct.description) updatedProduct.description = {};
                        updatedProduct.description.destacados = e.target.value;
                        setEditedProduct(updatedProduct);
                      }}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Especificaciones técnicas */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Características técnicas */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Características técnicas</h3>
                  <button
                    type="button"
                    onClick={() => handleAddField('technicalData')}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar campo
                  </button>
                </div>
                <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                  {editedProduct.technicalData && Object.entries(editedProduct.technicalData || {}).map(([key, value], index) => {
                    // Crear un ID único para este par clave-valor
                    const fieldId = `tech-${index}-${key}`;
                    return (
                      <div key={fieldId} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Nombre del campo"
                            value={key}
                            onChange={(e) => {
                              if (!e.target.value.trim()) return;
                              
                              // Crear una copia profunda del estado actual
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              
                              // Asegurarse de que technicalData existe
                              if (!updatedProduct.technicalData) {
                                updatedProduct.technicalData = {};
                              }
                              
                              // Obtener el valor actual
                              const currentValue = updatedProduct.technicalData[key];
                              
                              // Eliminar la entrada antigua
                              delete updatedProduct.technicalData[key];
                              
                              // Crear la nueva entrada con la clave actualizada
                              updatedProduct.technicalData[e.target.value] = currentValue;
                              
                              // Actualizar el estado
                              setEditedProduct(updatedProduct);
                              
                              // Log para depuración
                              console.log(`Clave cambiada: ${key} -> ${e.target.value}`);
                              console.log('Datos técnicos actualizados:', updatedProduct.technicalData);
                            }}
                            className="mb-1"
                            onBlur={(e) => {
                              // Forzar la actualización del estado al perder el foco
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              setEditedProduct(updatedProduct);
                            }}
                          />
                          <Input
                            placeholder="Valor"
                            value={value}
                            onChange={(e) => {
                              // Crear una copia profunda del estado actual
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              
                              // Asegurarse de que technicalData existe
                              if (!updatedProduct.technicalData) {
                                updatedProduct.technicalData = {};
                              }
                              
                              // Actualizar el valor
                              updatedProduct.technicalData[key] = e.target.value;
                              
                              // Actualizar el estado
                              setEditedProduct(updatedProduct);
                              
                              // Log para depuración
                              console.log(`Valor actualizado para ${key}: ${e.target.value}`);
                              console.log('Datos técnicos actualizados:', updatedProduct.technicalData);
                            }}
                            onBlur={(e) => {
                              // Forzar la actualización del estado al perder el foco
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              setEditedProduct(updatedProduct);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Crear una copia profunda del estado actual
                            const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                            
                            // Asegurarse de que technicalData existe
                            if (!updatedProduct.technicalData) {
                              updatedProduct.technicalData = {};
                            }
                            
                            // Eliminar la entrada
                            delete updatedProduct.technicalData[key];
                            
                            // Actualizar el estado
                            setEditedProduct(updatedProduct);
                            
                            // Log para depuración
                            console.log(`Campo eliminado: ${key}`);
                            console.log('Datos técnicos actualizados:', updatedProduct.technicalData);
                          }}
                          className="text-red-500 hover:text-red-700 self-center"
                          title="Eliminar campo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                  {(!editedProduct.technicalData || Object.keys(editedProduct.technicalData).length === 0) && (
                    <p className="text-gray-500 text-center py-2">No hay características técnicas. Haz clic en "Agregar campo" para añadir.</p>
                  )}
                </div>
              </div>
              
              {/* Funcionalidades */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Funcionalidades</h3>
                  <button
                    type="button"
                    onClick={() => handleAddField('functionalities')}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar campo
                  </button>
                </div>
                <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                  {editedProduct.functionalities && Object.entries(editedProduct.functionalities || {}).map(([key, value], index) => {
                    // Crear un ID único para este par clave-valor
                    const fieldId = `func-${index}-${key}`;
                    return (
                      <div key={fieldId} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Nombre del campo"
                            value={key}
                            onChange={(e) => {
                              // Crear una copia profunda del estado actual
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              
                              // Obtener el valor actual
                              const currentValue = updatedProduct.functionalities[key];
                              
                              // Eliminar la entrada antigua
                              delete updatedProduct.functionalities[key];
                              
                              // Crear la nueva entrada con la clave actualizada
                              updatedProduct.functionalities[e.target.value] = currentValue;
                              
                              // Actualizar el estado
                              setEditedProduct(updatedProduct);
                            }}
                            className="mb-1"
                          />
                          <Input
                            placeholder="Valor"
                            value={value}
                            onChange={(e) => {
                              // Crear una copia profunda del estado actual
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              
                              // Actualizar el valor
                              updatedProduct.functionalities[key] = e.target.value;
                              
                              // Actualizar el estado
                              setEditedProduct(updatedProduct);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Crear una copia profunda del estado actual
                            const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                            
                            // Eliminar la entrada
                            delete updatedProduct.functionalities[key];
                            
                            // Actualizar el estado
                            setEditedProduct(updatedProduct);
                          }}
                          className="text-red-500 hover:text-red-700 self-center"
                          title="Eliminar campo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                  {(!editedProduct.functionalities || Object.keys(editedProduct.functionalities).length === 0) && (
                    <p className="text-gray-500 text-center py-2">No hay funcionalidades. Haz clic en "Agregar campo" para añadir.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Descargas */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Descargas</h3>
                <button
                  type="button"
                  onClick={() => handleAddField('downloads')}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar descarga
                </button>
              </div>
              <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                {editedProduct.downloads && Object.entries(editedProduct.downloads || {}).map(([key, value], index) => {
                  // Crear un ID único para este par clave-valor
                  const fieldId = `download-${index}-${key}`;
                  return (
                    <div key={fieldId} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <Input
                            placeholder="Nombre del documento (ej: manual, ficha_tecnica)"
                            value={key}
                            onChange={(e) => {
                              // Crear una copia profunda del estado actual
                              const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                              
                              // Obtener el valor actual
                              const currentValue = updatedProduct.downloads[key];
                              
                              // Eliminar la entrada antigua
                              delete updatedProduct.downloads[key];
                              
                              // Crear la nueva entrada con la clave actualizada
                              updatedProduct.downloads[e.target.value] = currentValue;
                              
                              // Actualizar el estado
                              setEditedProduct(updatedProduct);
                            }}
                            className="flex-1"
                          />
                        </div>
                        <Input
                          placeholder="URL del documento"
                          value={value}
                          onChange={(e) => {
                            // Crear una copia profunda del estado actual
                            const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                            
                            // Actualizar el valor
                            updatedProduct.downloads[key] = e.target.value;
                            
                            // Actualizar el estado
                            setEditedProduct(updatedProduct);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Crear una copia profunda del estado actual
                          const updatedProduct = JSON.parse(JSON.stringify(editedProduct));
                          
                          // Eliminar la entrada
                          delete updatedProduct.downloads[key];
                          
                          // Actualizar el estado
                          setEditedProduct(updatedProduct);
                        }}
                        className="text-red-500 hover:text-red-700 self-center"
                        title="Eliminar descarga"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
                {(!editedProduct.downloads || Object.keys(editedProduct.downloads).length === 0) && (
                  <p className="text-gray-500 text-center py-2">No hay descargas. Haz clic en "Agregar descarga" para añadir.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
