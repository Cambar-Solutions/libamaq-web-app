import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getProductById, updateProduct, uploadImage } from "@/services/admin/productService";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Save, X, Package, DollarSign, Tags, FileText, Image } from "lucide-react";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId) => {
    try {
      const response = await getProductById(productId);
      if (response.type === "SUCCESS" && response.result) {
        setProduct(response.result);
        // Inicializar las imágenes existentes
        if (response.result.multimedia) {
          setImages(response.result.multimedia);
        }
      } else {
        toast.error("No se pudo cargar el producto");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Error al cargar el producto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleJsonInputChange = (name, value) => {
    try {
      let parsedValue = value;
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        parsedValue = JSON.parse(value);
      }
      setProduct(prev => ({
        ...prev,
        [name]: parsedValue
      }));
    } catch (error) {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newImages = results
        .filter(result => result.type === 'SUCCESS')
        .map(result => ({
          id: result.result.id,
          url: result.result.url,
          displayOrder: images.length + 1
        }));

      setImages(prev => [...prev, ...newImages]);
      toast.success("Imágenes subidas correctamente");
    } catch (error) {
      toast.error("Error al subir las imágenes");
      console.error(error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const productData = {
        ...product,
        multimedia: images.map((img, index) => ({
          ...img,
          displayOrder: index + 1
        }))
      };

      const response = await updateProduct(productData);
      if (response.type === "SUCCESS") {
        toast.success("Producto actualizado correctamente");
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Error al actualizar el producto");
      }
    } catch (error) {
      toast.error("Error al actualizar el producto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="animate-spin text-2xl mr-2">⌛</span> Cargando...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
              <p className="text-sm text-gray-500">{product?.name || 'Cargando...'}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              disabled={isLoading || uploadingImages}
            >
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || uploadingImages}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⌛</span> Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                </span>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            <TabsTrigger value="basic" className="flex items-center">
              <Package className="w-4 h-4 mr-2" /> Básico
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" /> Precios
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Detalles
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center">
              <Image className="w-4 h-4 mr-2" /> Imágenes
            </TabsTrigger>
          </TabsList>
        <TabsContent value="basic">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={product?.name || ""}
                onChange={handleInputChange}
                required
              />
            </div>
              <div>
                <Label htmlFor="externalId">ID Externo</Label>
                <Input
                  id="externalId"
                  name="externalId"
                  value={product?.externalId || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shortDescription">Descripción Corta</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={product?.shortDescription || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color (Hex)</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={product?.color || "#000000"}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={product?.cost || ""}
                onChange={handleInputChange}
                required
              />
            </div>
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={product?.price || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount">Descuento (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={product?.discount || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={product?.stock || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="garanty">Garantía (años)</Label>
                <Input
                  id="garanty"
                  name="garanty"
                  type="number"
                  min="0"
                  value={product?.garanty || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={product?.status || "ACTIVE"}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>


          </Card>
        <TabsContent value="details">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="brandId">ID de Marca</Label>
                  <Input
                    id="brandId"
                    name="brandId"
                    type="number"
                    min="1"
                    value={product?.brandId || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">ID de Categoría</Label>
                  <Input
                    id="categoryId"
                    name="categoryId"
                    type="number"
                    min="1"
                    value={product?.categoryId || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={typeof product?.description === 'object' ? JSON.stringify(product.description, null, 2) : product?.description || ""}
                  onChange={(e) => handleJsonInputChange('description', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="technicalData">Datos Técnicos</Label>
                <Textarea
                  id="technicalData"
                  name="technicalData"
                  rows={4}
                  value={typeof product?.technicalData === 'object' ? JSON.stringify(product.technicalData, null, 2) : product?.technicalData || ""}
                  onChange={(e) => handleJsonInputChange('technicalData', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="functionalities">Funcionalidades</Label>
                <Textarea
                  id="functionalities"
                  name="functionalities"
                  rows={4}
                  value={typeof product?.functionalities === 'object' ? JSON.stringify(product.functionalities, null, 2) : product?.functionalities || ""}
                  onChange={(e) => handleJsonInputChange('functionalities', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="downloads">Descargas</Label>
                <Textarea
                  id="downloads"
                  name="downloads"
                  rows={4}
                  value={typeof product?.downloads === 'object' ? JSON.stringify(product.downloads, null, 2) : product?.downloads || ""}
                  onChange={(e) => handleJsonInputChange('downloads', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-200">
                    <img
                      src={image.url}
                      alt={`Producto ${index + 1}`}
                      className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs opacity-0 group-hover:opacity-100 transition-all duration-200">
                      Imagen {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <ImageUpload
                onUpload={handleImageUpload}
                loading={uploadingImages}
                accept="image/*"
                multiple
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  </div>
  );
}
