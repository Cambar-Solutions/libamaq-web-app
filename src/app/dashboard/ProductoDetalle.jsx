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

  useEffect(() => {
    const productId = localStorage.getItem("selectedProductId");
    if (!productId) {
      toast.error("No se ha seleccionado ningún producto");
      navigate("/dashboard");
      return;
    }
    
    // Cargar producto, marcas y categorías
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productResponse, brandsResponse, categoriesResponse] = await Promise.all([
          getProductById(productId),
          getAllBrands(),
          getAllCategories()
        ]);
        
        if (productResponse.type === "SUCCESS" && productResponse.result) {
          setProducto(productResponse.result);
          setEditedProduct(productResponse.result);
          setMainImage(productResponse.result.multimedia[0]?.url);
          setUploadedImages(productResponse.result.multimedia || []);
        } else {
          toast.error("Producto no encontrado");
          navigate("/dashboard");
          return;
        }
        
        setBrands(brandsResponse);
        setCategories(categoriesResponse);
      } catch (error) {
        toast.error("Error al cargar los datos");
        console.error(error);
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Función para manejar el cambio de marca y actualizar el color automáticamente
  const handleBrandChange = (value) => {
    const selectedBrand = brands.find(b => b.id === +value);
    setEditedProduct(prev => ({
      ...prev,
      brandId: value,
      brand_id: value,
      color: selectedBrand?.color || prev.color
    }));
  };

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (value) => {
    setEditedProduct(prev => ({
      ...prev,
      categoryId: value,
      category_id: value
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
    setEditedProduct(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [`nuevo_${Date.now()}`]: "" }
    }));
  };

  const handleRemoveField = (section, key) => {
    setEditedProduct(prev => {
      const sectionData = { ...prev[section] };
      delete sectionData[key];
      return { ...prev, [section]: sectionData };
    });
  };

  const handleFieldChange = (section, key, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value }
    }));
  };

  const handleFieldKeyChange = (section, oldKey, newKey) => {
    setEditedProduct(prev => {
      const sectionData = { ...prev[section] };
      const value = sectionData[oldKey];
      delete sectionData[oldKey];
      return { ...prev, [section]: { ...sectionData, [newKey]: value } };
    });
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
      
      // Procesar campos JSON si son strings
      const processJsonField = (field) => {
        if (!field) return {};
        return typeof field === 'string' ? JSON.parse(field) : field;
      };
      
      // Preparar los datos del producto para la actualización
      const productData = {
        ...editedProduct,
        id: Number(editedProduct.id),
        status: editedProduct.status || 'ACTIVE',
        description: processJsonField(editedProduct.description),
        technicalData: processJsonField(editedProduct.technicalData),
        functionalities: processJsonField(editedProduct.functionalities),
        downloads: processJsonField(editedProduct.downloads),
        brandId: Number(editedProduct.brandId),
        categoryId: Number(editedProduct.categoryId),
        cost: Number(editedProduct.cost),
        price: Number(editedProduct.price),
        discount: Number(editedProduct.discount),
        stock: Number(editedProduct.stock),
        garanty: Number(editedProduct.garanty),
        productMultimediaDto: editedProduct.multimedia?.map((m, index) => ({
          id: Number(m.id),
          displayOrder: index + 1,
          productId: Number(editedProduct.id),
          multimediaId: Number(m.id)
        })) || []
      };
      
      // Enviar la actualización al servidor
      const response = await updateProduct(productData);
      
      if (response.type === "SUCCESS") {
        toast.success("Producto actualizado correctamente");
        setProducto(response.result);
        setEditedProduct(response.result);
        setUploadedImages(response.result.multimedia || []);
        setMainImage(response.result.multimedia[0]?.url);
        setIsEditing(false);
      } else {
        toast.error(response.message || "Error al actualizar el producto");
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
    setEditedProduct((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleJsonInputChange = (name, value) => {
    try {
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      setEditedProduct((prev) => ({ ...prev, [name]: jsonValue }));
    } catch {
      setEditedProduct((prev) => ({ ...prev, [name]: value }));
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button className="bg-blue-500 rounded-b-2xl hover:bg-blue-700" onClick={handleBack} disabled={isLoading}>
          Regresar al Dashboard
        </Button>
        {isEditing && (
          <div className="flex space-x-2">
            <Button className="bg-red-500 hover:bg-red-700" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button className="bg-green-500 hover:bg-green-700" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={isEditing ? "edit" : "view"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
          <TabsTrigger value="view" onClick={() => setIsEditing(false)}>
            Visualización
          </TabsTrigger>
          <TabsTrigger value="edit" onClick={handleEdit}>
            Edición
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

          {/* Especificaciones técnicas en formato de tabla */}
          {(producto.technicalData || producto.functionalities) && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ESPECIFICACIONES TÉCNICAS</h3>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {producto.technicalData && Object.entries(producto.technicalData).map(([key, value]) => (
                      <tr key={`tech-${key}`}>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3 capitalize">{key.replace('_', ' ')}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{value}</td>
                      </tr>
                    ))}
                    {producto.functionalities && Object.entries(producto.functionalities).map(([key, value]) => (
                      <tr key={`func-${key}`}>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3 capitalize">{key.replace('_', ' ')}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



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
                      value={editedProduct.brand_id ? editedProduct.brand_id.toString() : ""}
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
                      value={editedProduct.category_id ? editedProduct.category_id.toString() : ""}
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
                      value={editedProduct.description.caracteristicas || ''}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            caracteristicas: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
                    <textarea
                      name="details"
                      value={editedProduct.description.details || ''}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            details: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aplicaciones</label>
                    <textarea
                      name="aplicaciones"
                      value={editedProduct.description.aplicaciones || ''}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            aplicaciones: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destacados</label>
                    <textarea
                      name="destacados"
                      value={editedProduct.description.destacados || ''}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            destacados: e.target.value,
                          },
                        }))
                      }
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
                  {editedProduct.technicalData && Object.entries(editedProduct.technicalData).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Nombre del campo"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const oldValue = editedProduct.technicalData[key];
                            handleFieldKeyChange('technicalData', key, newKey);
                          }}
                          className="mb-1"
                        />
                        <Input
                          placeholder="Valor"
                          value={value}
                          onChange={(e) => handleFieldChange('technicalData', key, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveField('technicalData', key)}
                        className="text-red-500 hover:text-red-700 self-center"
                        title="Eliminar campo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
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
                  {editedProduct.functionalities && Object.entries(editedProduct.functionalities).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Nombre del campo"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const oldValue = editedProduct.functionalities[key];
                            handleFieldKeyChange('functionalities', key, newKey);
                          }}
                          className="mb-1"
                        />
                        <Input
                          placeholder="Valor"
                          value={value}
                          onChange={(e) => handleFieldChange('functionalities', key, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveField('functionalities', key)}
                        className="text-red-500 hover:text-red-700 self-center"
                        title="Eliminar campo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
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
                {editedProduct.downloads && Object.entries(editedProduct.downloads).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <Input
                          placeholder="Nombre del documento (ej: manual, ficha_tecnica)"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const oldValue = editedProduct.downloads[key];
                            handleFieldKeyChange('downloads', key, newKey);
                          }}
                          className="flex-1"
                        />
                      </div>
                      <Input
                        placeholder="URL del documento"
                        value={value}
                        onChange={(e) => handleFieldChange('downloads', key, e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveField('downloads', key)}
                      className="text-red-500 hover:text-red-700 self-center"
                      title="Eliminar descarga"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {(!editedProduct.downloads || Object.keys(editedProduct.downloads).length === 0) && (
                  <p className="text-gray-500 text-center py-2">No hay descargas. Haz clic en "Agregar descarga" para añadir.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
