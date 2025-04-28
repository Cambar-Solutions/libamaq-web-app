import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProductById, updateProduct } from "@/services/admin/productService";

export default function EditarProducto() {
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
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
      const response = await getProductById(id);
      if (response.type === "SUCCESS" && response.result) {
        setProduct(response.result);
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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleJsonInputChange = (name, value) => {
    try {
      // Si es un string JSON válido, lo parseamos
      let jsonValue = value;
      if (typeof value === 'string') {
        // Intentar parsear solo si parece JSON
        if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
          jsonValue = JSON.parse(value);
        }
      }
      
      setProduct(prev => ({
        ...prev,
        [name]: jsonValue
      }));
    } catch (error) {
      // Si hay error al parsear, mantenemos el valor como string
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Preparar los campos JSON
      const descriptionObj = {
        caracteristicas: product.description?.caracteristicas || '',
        details: product.description?.details || '',
        aplicaciones: product.description?.aplicaciones || '',
        destacados: product.description?.destacados || ''
      };

      const technicalDataObj = typeof product.technicalData === 'string'
        ? JSON.parse(product.technicalData)
        : product.technicalData || {};

      const functionalitiesObj = typeof product.functionalities === 'string'
        ? JSON.parse(product.functionalities)
        : product.functionalities || {};

      const downloadsObj = typeof product.downloads === 'string'
        ? JSON.parse(product.downloads)
        : product.downloads || {};

      const productData = {
        ...product,
        description: descriptionObj,
        technicalData: technicalDataObj,
        functionalities: functionalitiesObj,
        downloads: downloadsObj,
        status: product.status || 'ACTIVE',
        // Asegurarse de que los campos numéricos sean números
        cost: Number(product.cost),
        price: Number(product.price),
        discount: Number(product.discount),
        stock: Number(product.stock),
        garanty: Number(product.garanty),
        brandId: Number(product.brandId),
        categoryId: Number(product.categoryId),
        // Manejar multimedia
        productMultimediaDto: Array.isArray(product.multimedia)
          ? product.multimedia.map((m, index) => ({
              id: Number(m.id),
              displayOrder: Number(index + 1),
              productId: Number(product.id),
              multimediaId: Number(m.id)
            }))
          : []
      };

      const response = await updateProduct(productData);
      
      if (response.type === "SUCCESS") {
        toast.success("Producto actualizado correctamente");
        navigate("/dashboard");
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

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-950">Editar Producto</h1>
        <Button variant="outline" onClick={handleBack}>
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Externo</label>
            <input
              type="text"
              name="externalId"
              value={product?.externalId || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={product?.name || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color (Hex)</label>
            <input
              type="text"
              name="color"
              value={product?.color || "#000000"}
              onChange={handleInputChange}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción Corta</label>
            <input
              type="text"
              name="shortDescription"
              value={product?.shortDescription || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Información comercial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Costo</label>
            <input
              type="number"
              name="cost"
              value={product?.cost || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              name="price"
              value={product?.price || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
            <input
              type="number"
              name="discount"
              value={product?.discount || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Información de stock y garantía */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={product?.stock || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Garantía (años)</label>
            <input
              type="number"
              name="garanty"
              value={product?.garanty || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              name="status"
              value={product?.status || "ACTIVE"}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Información de categorización */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID de Marca</label>
            <input
              type="number"
              name="brandId"
              value={product?.brandId || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID de Categoría</label>
            <input
              type="number"
              name="categoryId"
              value={product?.categoryId || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="1"
            />
          </div>
        </div>

        {/* Campos de texto largo */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={typeof product?.description === 'object' ? JSON.stringify(product.description, null, 2) : product?.description || ""}
              onChange={(e) => handleJsonInputChange('description', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Datos Técnicos</label>
            <textarea
              name="technicalData"
              value={typeof product?.technicalData === 'object' ? JSON.stringify(product.technicalData, null, 2) : product?.technicalData || ""}
              onChange={(e) => handleJsonInputChange('technicalData', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Funcionalidades</label>
            <textarea
              name="functionalities"
              value={typeof product?.functionalities === 'object' ? JSON.stringify(product.functionalities, null, 2) : product?.functionalities || ""}
              onChange={(e) => handleJsonInputChange('functionalities', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descargas</label>
            <textarea
              name="downloads"
              value={typeof product?.downloads === 'object' ? JSON.stringify(product.downloads, null, 2) : product?.downloads || ""}
              onChange={(e) => handleJsonInputChange('downloads', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
