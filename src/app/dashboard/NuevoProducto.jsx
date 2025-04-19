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
    description: JSON.stringify({
      caracteristicas: "",
      details: "",
      aplicaciones: "",
      destacados: ""
    }),
    descriptionMap: null,
    type: "",
    productUsage: "",
    cost: 0,
    price: 0,
    discount: 0,
    stock: 0,
    garanty: 0,
    technicalData: {
      potencia: "",
      peso: "",
      impactos: "",
      velocidad: ""
    },
    functionalities: {
      modos: "",
      control: "",
      encastre: ""
    },
    downloads: {
      manual: "",
      ficha_tecnica: ""
    },
    status: "ACTIVE",
    brandId: "",
    productCategories: [],
    productMultimediaDto: []
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

  const handleDownloadsChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      downloads: {
        ...prev.downloads,
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
        const newMultimedia = [...prev.productMultimediaDto, ...uploadedResults.map((img, index) => ({
          id: 0,
          displayOrder: prev.productMultimediaDto.length + index + 1,
          productId: 0,
          multimediaId: img.id
        }))];
        console.log('Nuevo estado de multimedia:', newMultimedia);
        return {
          ...prev,
          productMultimediaDto: newMultimedia
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

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setProducto(prev => ({
      ...prev,
      productMultimediaDto: prev.productMultimediaDto.filter((_, i) => i !== index)
    }));
  };

  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    try {
      const currentDescription = JSON.parse(producto.description);
      const newDescription = {
        ...currentDescription,
        [name]: value
      };
      setProducto(prev => ({
        ...prev,
        description: JSON.stringify(newDescription)
      }));
    } catch (error) {
      console.error("Error al actualizar la descripción:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Estado actual del producto:', producto);
      
      // Formatear el body según el requerimiento de la API
      const productToSubmit = {
        id: 0,
        externalId: producto.externalId,
        name: producto.name,
        color: producto.color,
        shortDescription: producto.shortDescription,
        description: producto.description,
        descriptionMap: null,
        type: producto.type,
        productUsage: producto.productUsage,
        cost: parseFloat(producto.cost),
        price: parseFloat(producto.price),
        discount: parseFloat(producto.discount),
        stock: parseInt(producto.stock),
        garanty: parseInt(producto.garanty),
        technicalData: producto.technicalData,
        functionalities: producto.functionalities,
        downloads: producto.downloads,
        status: producto.status,
        brandId: parseInt(producto.brandId),
        brandDto: brands.find(brand => brand.id === parseInt(producto.brandId)),
        productCategoryDto: producto.productCategories.map(cat => ({
          id: 0,
          productId: 0,
          categoryId: cat.categoryId
        })),
        productMultimediaDto: producto.productMultimediaDto,
        productCategories: [],
        multimedia: uploadedImages.map(img => ({
          id: img.id,
          url: img.url
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

  const handleAddField = (section) => {
    setProducto(prev => {
      const newKey = `nueva_clave_${Date.now()}`;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [newKey]: ""
        }
      };
    });
  };

  const handleRemoveField = (section, key) => {
    setProducto(prev => {
      const newSection = { ...prev[section] };
      delete newSection[key];
      return {
        ...prev,
        [section]: newSection
      };
    });
  };

  const handleJsonFieldChange = (section, key, value) => {
    setProducto(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderJsonFields = (section, title) => (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <button
          type="button"
          onClick={() => handleAddField(section)}
          className="text-blue-600 hover:text-blue-800"
        >
          + Agregar campo
        </button>
      </div>
      <div className="space-y-4">
        {Object.entries(producto[section]).map(([key, value]) => (
          <div key={key} className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const newValue = producto[section][key];
                  handleRemoveField(section, key);
                  handleJsonFieldChange(section, newKey, newValue);
                }}
                className="w-full border p-2 rounded"
                placeholder="Clave"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={value}
                onChange={(e) => handleJsonFieldChange(section, key, e.target.value)}
                className="w-full border p-2 rounded"
                rows="2"
                placeholder="Valor"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveField(section, key)}
              className="text-red-600 hover:text-red-800 p-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );

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

          {renderJsonFields('technicalData', 'Datos técnicos')}
          {renderJsonFields('functionalities', 'Funcionalidades')}
          {renderJsonFields('downloads', 'Descargas')}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción completa
            </label>
            <div className="space-y-4">
              {Object.entries(JSON.parse(producto.description)).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => {
                      const newDescription = JSON.parse(producto.description);
                      newDescription[key] = e.target.value;
                      setProducto(prev => ({
                        ...prev,
                        description: JSON.stringify(newDescription)
                      }));
                    }}
                    className="w-full border p-2 rounded mt-1"
                    rows="3"
                  />
                </div>
              ))}
            </div>
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
                        onClick={() => handleRemoveImage(index)}
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
