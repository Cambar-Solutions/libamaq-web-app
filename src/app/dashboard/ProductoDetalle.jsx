import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProductById, updateProduct } from "@/services/admin/productService";

export default function ProductoDetalle() {
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
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
        setProducto(response.result);
        setEditedProduct(response.result);
        setMainImage(response.result.multimedia[0]?.url);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProduct({...producto});
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Asegurarse de que el status sea un string válido
      const productData = {
        ...editedProduct,
        status: editedProduct.status || 'ACTIVE',
        // Asegurarse de que los campos JSON estén en el formato correcto
        description: editedProduct.description || '',
        technicalData: editedProduct.technicalData || '',
        functionalities: editedProduct.functionalities || '',
        downloads: editedProduct.downloads || '',
        // Asegurarse de que los IDs sean números
        brandId: Number(editedProduct.brandId),
        categoryId: Number(editedProduct.categoryId),
        // Mapear la multimedia correctamente
        productMultimediaDto: editedProduct.multimedia?.map((m, index) => ({
          multimediaId: m.id,
          displayOrder: index + 1
        })) || []
      };

      const response = await updateProduct(productData);
      
      if (response.type === "SUCCESS") {
        toast.success("Producto actualizado correctamente");
        setProducto(response.result);
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
    setEditedProduct({...producto});
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setEditedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleJsonInputChange = (name, value) => {
    try {
      // Intentar parsear como JSON si es una cadena
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      setEditedProduct(prev => ({
        ...prev,
        [name]: jsonValue
      }));
    } catch (error) {
      // Si no es JSON válido, guardar como string
      setEditedProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultimediaChange = (multimedia) => {
    setEditedProduct(prev => ({
      ...prev,
      multimedia: multimedia.map((m, index) => ({
        ...m,
        displayOrder: index + 1
      }))
    }));
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
        <Button
          className="bg-blue-500 rounded-b-2xl hover:bg-blue-700 mb-3"
          onClick={handleBack}
          disabled={isLoading}
        >
          Regresar al Dashboard
        </Button>
        {isEditing ? (
          <>
            <Button
              className="bg-red-500 rounded-b-2xl hover:bg-red-700 mb-3 ml-2"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-500 rounded-b-2xl hover:bg-green-700 mb-3 ml-2"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        ) : (
          <Button
            className="bg-blue-500 rounded-b-2xl hover:bg-blue-700 mb-3 ml-2"
            onClick={handleEdit}
            disabled={isLoading}
          >
            Editar
          </Button>
        )}
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
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedProduct.name}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{producto.name}</h1>
          )}
          {isEditing ? (
            <input
              type="text"
              name="externalId"
              value={editedProduct.externalId}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
          ) : (
            <p className="text-md sm:text-lg text-gray-700 font-bold my-2">{producto.externalId}</p>
          )}
          {isEditing ? (
            <textarea
              name="shortDescription"
              value={editedProduct.shortDescription}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2"
            />
          ) : (
            <p className="text-gray-600 text-md sm:text-lg font-semibold">{producto.shortDescription}</p>
          )}

          {/* Descripción completa */}
          {producto.description && (
            <div className="mt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Descripción completa</h3>
              <div className="space-y-4">
                {producto.description.caracteristicas && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Características</h4>
                    {isEditing ? (
                      <textarea
                        name="caracteristicas"
                        value={editedProduct.description.caracteristicas}
                        onChange={(e) =>
                          setEditedProduct((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              caracteristicas: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-2"
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-line">{producto.description.caracteristicas}</p>
                    )}
                  </div>
                )}
                {producto.description.details && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Detalles</h4>
                    {isEditing ? (
                      <textarea
                        name="details"
                        value={editedProduct.description.details}
                        onChange={(e) =>
                          setEditedProduct((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              details: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-2"
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-line">{producto.description.details}</p>
                    )}
                  </div>
                )}
                {producto.description.aplicaciones && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Aplicaciones</h4>
                    {isEditing ? (
                      <textarea
                        name="aplicaciones"
                        value={editedProduct.description.aplicaciones}
                        onChange={(e) =>
                          setEditedProduct((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              aplicaciones: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-2"
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-line">{producto.description.aplicaciones}</p>
                    )}
                  </div>
                )}
                {producto.description.destacados && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Destacados</h4>
                    {isEditing ? (
                      <textarea
                        name="destacados"
                        value={editedProduct.description.destacados}
                        onChange={(e) =>
                          setEditedProduct((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              destacados: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-2"
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-line">{producto.description.destacados}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Características técnicas */}
          {producto.technicalData && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Características técnicas</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {Object.entries(producto.technicalData).map(([key, value]) => (
                  <li key={key}>
                    {isEditing ? (
                      <input
                        type="text"
                        name={key}
                        value={editedProduct.technicalData[key]}
                        onChange={(e) =>
                          setEditedProduct((prev) => ({
                            ...prev,
                            technicalData: {
                              ...prev.technicalData,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-2"
                      />
                    ) : (
                      value
                    )}
                  </li>
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
                  <li key={key}>
                    {isEditing ? (
                      <input
                        type="text"
                        name={key}
                        value={editedProduct.functionalities[key]}
                        onChange={(e) =>
                          setEditedProduct((prev) => ({
                            ...prev,
                            functionalities: {
                              ...prev.functionalities,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-2"
                      />
                    ) : (
                      value
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Información del Producto */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-blue-950">Información del producto</h2>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={editedProduct?.name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción Corta</label>
              <input
                type="text"
                name="shortDescription"
                value={editedProduct?.shortDescription || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              />
            </div>

            {/* Detalles del producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <input
                type="text"
                name="type"
                value={editedProduct?.type || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Uso del Producto</label>
              <input
                type="text"
                name="productUsage"
                value={editedProduct?.productUsage || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              />
            </div>

            {/* Información de precios */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                name="price"
                value={editedProduct?.price || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo</label>
              <input
                type="number"
                name="cost"
                value={editedProduct?.cost || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock y descuento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                name="stock"
                value={editedProduct?.stock || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
              <input
                type="number"
                name="discount"
                value={editedProduct?.discount || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                min="0"
                max="100"
              />
            </div>

            {/* Características adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Garantía</label>
              <input
                type="text"
                name="garanty"
                value={editedProduct?.garanty || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                name="color"
                value={editedProduct?.color || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                name="status"
                value={editedProduct?.status || "ACTIVE"}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Campos de texto largo */}
          <div className="space-y-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción Completa</label>
              <textarea
                name="description"
                value={typeof editedProduct?.description === 'object' ? JSON.stringify(editedProduct.description, null, 2) : editedProduct?.description || ""}
                onChange={(e) => handleJsonInputChange('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Datos Técnicos</label>
              <textarea
                name="technicalData"
                value={typeof editedProduct?.technicalData === 'object' ? JSON.stringify(editedProduct.technicalData, null, 2) : editedProduct?.technicalData || ""}
                onChange={(e) => handleJsonInputChange('technicalData', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Funcionalidades</label>
              <textarea
                name="functionalities"
                value={typeof editedProduct?.functionalities === 'object' ? JSON.stringify(editedProduct.functionalities, null, 2) : editedProduct?.functionalities || ""}
                onChange={(e) => handleJsonInputChange('functionalities', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descargas</label>
              <textarea
                name="downloads"
                value={typeof editedProduct?.downloads === 'object' ? JSON.stringify(editedProduct.downloads, null, 2) : editedProduct?.downloads || ""}
                onChange={(e) => handleJsonInputChange('downloads', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </div>
        </form>
        {/* Botones de acción */}
        <div className="mt-6 flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
              disabled={isLoading}
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Sección destacada con color del producto */}
      <div
        className="mt-12 p-6 text-center rounded-md"
        style={{
          backgroundColor: producto.color || '#1C398E',
          color: 'white'
        }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">INFORMACIÓN DESTACADA</h2>
        {producto.description && (
          <div className="space-y-4 text-left">
            {producto.description.destacados && (
              <div className="text-lg">
                {isEditing ? (
                  <textarea
                    name="destacados"
                    value={editedProduct.description.destacados}
                    onChange={(e) =>
                      setEditedProduct((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          destacados: e.target.value,
                        },
                      }))
                    }
                    className="w-full border p-2"
                  />
                ) : (
                  producto.description.destacados
                )}
              </div>
            )}
            {producto.description.caracteristicas && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Características principales</h3>
                <ul className="list-disc list-inside space-y-1">
                  {producto.description.caracteristicas.split('\n').map((item, index) => (
                    <li key={index}>
                      {isEditing ? (
                        <input
                          type="text"
                          name={`caracteristicas-${index}`}
                          value={item}
                          onChange={(e) => {
                            const caracteristicas = editedProduct.description.caracteristicas.split('\n');
                            caracteristicas[index] = e.target.value;
                            setEditedProduct((prev) => ({
                              ...prev,
                              description: {
                                ...prev.description,
                                caracteristicas: caracteristicas.join('\n'),
                              },
                            }));
                          }}
                          className="w-full border p-2"
                        />
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {producto.description.aplicaciones && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Aplicaciones</h3>
                {isEditing ? (
                  <textarea
                    name="aplicaciones"
                    value={editedProduct.description.aplicaciones}
                    onChange={(e) =>
                      setEditedProduct((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          aplicaciones: e.target.value,
                        },
                      }))
                    }
                    className="w-full border p-2"
                  />
                ) : (
                  <p>{producto.description.aplicaciones}</p>
                )}
              </div>
            )}
          </div>
        )}
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
                <span className="text-gray-600">
                  {isEditing ? (
                    <input
                      type="text"
                      name={key}
                      value={editedProduct.technicalData[key]}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          technicalData: {
                            ...prev.technicalData,
                            [key]: e.target.value,
                          },
                        }))
                      }
                      className="w-full border p-2"
                    />
                  ) : (
                    value
                  )}
                </span>
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
