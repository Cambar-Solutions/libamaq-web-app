import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createProduct } from "@/services/admin/productService";
import { getAllBrands } from "@/services/admin/brandService";
import { getAllCategories } from "@/services/admin/categoryService";
import { uploadMultimedia } from "@/services/admin/multimediaService";

export default function NuevoProducto() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const [producto, setProducto] = useState({
    externalId: "",
    name: "",
    color: "",
    shortDescription: "",
    description: "",
    descriptionMap: {},
    type: "",
    productUsage: "",
    cost: 0,
    price: 0,
    discount: 0,
    stock: 0,
    garanty: 0,
    technicalData: {},
    functionalities: {},
    downloads: {},
    status: "ACTIVE",
    brandId: "",
    productCategories: [],
    multimedia: []
  });

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        getAllBrands(),
        getAllCategories()
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Error al cargar marcas y categorías");
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "brandId") {
      const selectedBrand = brands.find(brand => brand.id === parseInt(value));
      setProducto(prev => ({
        ...prev,
        [name]: value,
        color: selectedBrand?.color || prev.color
      }));
    } else {
      setProducto(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTechnicalDataChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      technicalData: {
        ...prev.technicalData,
        [name]: value
      }
    }));
  };

  const handleFunctionalitiesChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      functionalities: {
        ...prev.functionalities,
        [name]: value
      }
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedCategories = Array.from(e.target.selectedOptions, option => ({
      id: parseInt(option.value),
      productId: 0,
      categoryId: parseInt(option.value)
    }));
    setProducto(prev => ({
      ...prev,
      productCategories: selectedCategories
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsLoading(true);

    try {
      const uploadPromises = files.map(file => uploadMultimedia(file));
      const uploadedResults = await Promise.all(uploadPromises);
      
      console.log('Resultados de la subida de imágenes:', uploadedResults);
      
      setUploadedImages(prev => [...prev, ...uploadedResults]);
      setProducto(prev => {
        const newMultimedia = [...prev.multimedia, ...uploadedResults.map(img => ({
          id: img.id,
          url: img.url
        }))];
        console.log('Nuevo estado de multimedia:', newMultimedia);
        return {
          ...prev,
          multimedia: newMultimedia
        };
      });
      
      toast.success(`Se subieron ${files.length} imágenes exitosamente`);
    } catch (error) {
      toast.error("Error al subir las imágenes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Estado actual del producto:', producto);
      
      // Formatear el body según el requerimiento de la API
      const productToSubmit = {
        id: 0, // El backend asignará el ID
        externalId: producto.externalId,
        name: producto.name,
        color: producto.color,
        shortDescription: producto.shortDescription,
        description: producto.description,
        descriptionMap: producto.descriptionMap,
        type: producto.type,
        productUsage: producto.productUsage,
        cost: producto.cost,
        price: producto.price,
        discount: producto.discount,
        stock: producto.stock,
        garanty: producto.garanty,
        technicalData: producto.technicalData,
        functionalities: producto.functionalities,
        downloads: producto.downloads,
        status: producto.status,
        brandId: producto.brandId,
        brandDto: brands.find(brand => brand.id === parseInt(producto.brandId)),
        productCategoryDto: producto.productCategories.map(cat => ({
          id: 0,
          productId: 0,
          categoryId: cat.categoryId
        })),
        productMultimediaDto: producto.multimedia.map(img => ({
          id: 0,
          displayOrder: 1,
          productId: 0,
          multimediaId: img.id
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      };

      console.log('Producto a enviar:', productToSubmit);
      console.log('Formato de multimedia:', productToSubmit.productMultimediaDto);

      await createProduct(productToSubmit);
      toast.success("Producto creado exitosamente");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error al crear el producto");
      console.error('Error completo:', error);
      console.error('Mensaje de error:', error.message);
      console.error('Respuesta del servidor:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar nuevo producto</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Externo</label>
              <input
                name="externalId"
                value={producto.externalId}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                name="name"
                value={producto.name}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                name="color"
                value={producto.color}
                onChange={handleChange}
                className="w-full h-10 border rounded mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Marca</label>
              <select
                name="brandId"
                value={producto.brandId}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              >
                <option value="">Selecciona una marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <input
                name="type"
                value={producto.type}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Uso</label>
              <input
                name="productUsage"
                value={producto.productUsage}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Costo</label>
              <input
                type="number"
                name="cost"
                value={producto.cost}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                name="price"
                value={producto.price}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
              <input
                type="number"
                name="discount"
                value={producto.discount}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                name="stock"
                value={producto.stock}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Garantía (años)</label>
              <input
                type="number"
                name="garanty"
                value={producto.garanty}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción corta</label>
            <textarea
              name="shortDescription"
              value={producto.shortDescription}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              rows="2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción completa</label>
            <textarea
              name="description"
              value={producto.description}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categorías</label>
            <select
              multiple
              value={producto.productCategories.map(cat => cat.categoryId)}
              onChange={handleCategoryChange}
              className="w-full border p-2 rounded mt-1"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Datos técnicos</h3>
              <div className="space-y-2">
                <input
                  name="procesador"
                  placeholder="Procesador"
                  value={producto.technicalData.procesador || ""}
                  onChange={handleTechnicalDataChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  name="ram"
                  placeholder="RAM"
                  value={producto.technicalData.ram || ""}
                  onChange={handleTechnicalDataChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Funcionalidades</h3>
              <div className="space-y-2">
                <input
                  name="conectividad"
                  placeholder="Conectividad"
                  value={producto.functionalities.conectividad || ""}
                  onChange={handleFunctionalitiesChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  name="puertos"
                  placeholder="Puertos"
                  value={producto.functionalities.puertos || ""}
                  onChange={handleFunctionalitiesChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del producto
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                multiple
                accept="image/*,.webp"
                onChange={handleImageUpload}
                className="w-full border p-2 rounded"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              )}
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  {uploadedImages.length} imagen(es) seleccionada(s)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-contain border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImages(prev => prev.filter((_, i) => i !== index));
                          setProducto(prev => ({
                            ...prev,
                            multimedia: prev.multimedia.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
