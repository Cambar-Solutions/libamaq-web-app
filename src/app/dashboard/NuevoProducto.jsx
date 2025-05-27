import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Plus, X, ArrowLeft, Droplet, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

// Services
import { createProduct } from '@/services/admin/productService';
import { getActiveCategories } from '@/services/admin/categoryService';
import { getAllActiveBrands } from '@/services/admin/brandService';
import { createMultimedia } from '@/services/admin/multimediaService';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const NuevoProducto = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Initial product state
  const [producto, setProducto] = useState({
    externalId: '',
    name: '',
    shortDescription: '',
    description: '',
    type: '',
    productUsage: '',
    price: 0,
    cost: 0,
    discount: 0,
    stock: 0,
    garanty: 12, // 12 months default warranty
    technicalData: '',
    functionalities: '',
    downloads: '',
    brandId: '',
    categoryId: '',
    media: []
  });

    // Cargar marcas y categorías al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const [respuestaMarcas, respuestaCategorias] = await Promise.all([
          getAllActiveBrands(),
          getActiveCategories()
        ]);
        
        // Manejar la respuesta según la estructura de la API
        const datosMarcas = Array.isArray(respuestaMarcas) ? respuestaMarcas : 
                         (respuestaMarcas?.result || respuestaMarcas?.data || []);
        const datosCategorias = Array.isArray(respuestaCategorias) ? respuestaCategorias : 
                             (respuestaCategorias?.result || respuestaCategorias?.data || []);
        
        setBrands(datosMarcas);
        setCategories(datosCategorias);
        
        // Si hay una marca seleccionada, actualizar el color
        if (producto.brandId) {
          const marcaSeleccionada = datosMarcas.find(brand => brand.id.toString() === producto.brandId);
          if (marcaSeleccionada?.color) {
            setProducto(prev => ({
              ...prev,
              color: marcaSeleccionada.color
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar marcas y categorías');
        // Inicializar con arreglos vacíos para evitar errores
        setBrands([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Manejar carga de imágenes
  const handleImageUpload = async (e) => {
    const archivos = Array.from(e.target.files);
    if (!archivos.length) return;

    setIsLoading(true);
    try {
      const promesasCarga = archivos.map(archivo => createMultimedia(archivo));
      const resultados = await Promise.all(promesasCarga);
      
      const nuevosMedios = resultados.map((resultado, indice) => ({
        id: 0,
        url: resultado.url,
        fileType: 'IMAGE',
        entityId: 0,
        entityType: 'PRODUCT',
        displayOrder: uploadedImages.length + indice + 1
      }));

      setUploadedImages(prev => [...prev, ...resultados]);
      setProducto(prev => ({
        ...prev,
        media: [...prev.media, ...nuevosMedios]
      }));

      toast.success('Imágenes cargadas correctamente');
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      toast.error('Error al cargar las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar eliminación de imagen
  const handleRemoveImage = (indice) => {
    setProducto(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indice)
    }));
    setUploadedImages(prev => prev.filter((_, i) => i !== indice));
  };

    // Manejar cambio de marca
  const handleBrandChange = (value) => {
    const marcaSeleccionada = brands.find(brand => brand.id.toString() === value);
    
    setProducto(prev => ({
      ...prev,
      brandId: value,
      // Actualizar el color con el de la marca seleccionada, si tiene
      color: marcaSeleccionada?.color || prev.color || '#000000'
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validaciones básicas
      if (!producto.name || !producto.brandId || !producto.categoryId) {
        toast.error('Por favor complete todos los campos obligatorios');
        return;
      }

      // Preparar datos para la API
      const datos = {
        ...producto,
        price: parseFloat(producto.price) || 0,
        cost: parseFloat(producto.cost) || 0,
        discount: parseFloat(producto.discount) || 0,
        stock: parseInt(producto.stock) || 0,
        garanty: parseInt(producto.garanty) || 0,
        brandId: parseInt(producto.brandId),
        categoryId: parseInt(producto.categoryId),
        // Asegurar que los campos de texto no sean undefined
        shortDescription: producto.shortDescription || '',
        description: producto.description || '',
        functionalities: producto.functionalities || '',
        technicalData: producto.technicalData || '',
        type: producto.type || '',
        productUsage: producto.productUsage || '',
        downloads: producto.downloads || '',
        // Ordenar imágenes por displayOrder
        media: [...producto.media].sort((a, b) => a.displayOrder - b.displayOrder)
      };

      // Llamar al servicio para crear el producto
      const respuesta = await createProduct(datos);
      
      if (respuesta && respuesta.id) {
        toast.success('Producto creado exitosamente');
        navigate('/dashboard/productos');
      } else {
        throw new Error('Error al crear el producto');
      }
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error(error.response?.data?.message || 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/productos')}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={producto.name}
                onChange={(e) => setProducto({ ...producto, name: e.target.value })}
                placeholder="Ej: Taladro inalámbrico 1/2 pulgada"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalId">ID Externo</Label>
              <Input
                id="externalId"
                value={producto.externalId}
                onChange={(e) => setProducto({ ...producto, externalId: e.target.value })}
                placeholder="Ej: PROD-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandId">Marca *</Label>
              <Select
                value={producto.brandId}
                onValueChange={handleBrandChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría *</Label>
              <Select
                value={producto.categoryId}
                onValueChange={(value) => setProducto({ ...producto, categoryId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
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
        </div>

        {/* Precios e Inventario */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Precios e Inventario</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">S/</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={producto.price}
                  onChange={(e) => setProducto({ ...producto, price: e.target.value })}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">S/</span>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={producto.cost}
                  onChange={(e) => setProducto({ ...producto, cost: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={producto.discount}
                onChange={(e) => setProducto({ ...producto, discount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Inicial</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={producto.stock}
                onChange={(e) => setProducto({ ...producto, stock: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="garanty">Garantía (meses)</Label>
              <Input
                id="garanty"
                type="number"
                min="0"
                value={producto.garanty}
                onChange={(e) => setProducto({ ...producto, garanty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="color">Color</Label>
                {producto.color && (
                  <button
                    type="button"
                    onClick={() => {
                      const brand = brands.find(b => b.id.toString() === producto.brandId);
                      if (brand?.color) {
                        setProducto(prev => ({
                          ...prev,
                          color: brand.color
                        }));
                      }
                    }}
                    className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Usar color de la marca"
                  >
                    <Droplet className="h-3 w-3 mr-1" />
                    Usar color de la marca
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="color"
                    type="text"
                    value={producto.color || ''}
                    onChange={(e) => setProducto(prev => ({
                      ...prev,
                      color: e.target.value
                    }))}
                    placeholder="#RRGGBB"
                    className="font-mono pr-10 w-full"
                  />
                  <div 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border"
                    style={{ backgroundColor: producto.color || '#ffffff' }}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-10 h-10 p-0 flex items-center justify-center"
                      style={{ backgroundColor: producto.color || '#ffffff' }}
                    >
                      <Palette className="h-4 w-4 text-gray-600" />
                      <span className="sr-only">Abrir selector de color</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 border-0 shadow-lg bg-white rounded-lg">
                    <HexColorPicker 
                      color={producto.color || '#000000'} 
                      onChange={(color) => setProducto(prev => ({ ...prev, color }))} 
                      style={{ width: '200px' }}
                    />
                    <div className="mt-2 text-xs text-center text-gray-500">
                      {producto.color || '#000000'}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2 flex items-center pt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rentable"
                  checked={producto.rentable || false}
                  onChange={(e) => setProducto({ ...producto, rentable: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="rentable" className="text-sm font-medium text-gray-700">
                  Disponible para renta
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Tipo y Uso */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Tipo y Uso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Producto</Label>
              <Input
                id="type"
                value={producto.type || ''}
                onChange={(e) => setProducto({ ...producto, type: e.target.value })}
                placeholder="Ej: Herramienta eléctrica, Insumo, Repuesto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productUsage">Uso Recomendado</Label>
              <Input
                id="productUsage"
                value={producto.productUsage || ''}
                onChange={(e) => setProducto({ ...producto, productUsage: e.target.value })}
                placeholder="Ej: Profesional, Industrial, Doméstico"
              />
            </div>
          </div>
          
          {/* Enlaces de descarga */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="downloads">Enlaces de Descarga</Label>
            <Textarea
              id="downloads"
              value={producto.downloads || ''}
              onChange={(e) => setProducto({ ...producto, downloads: e.target.value })}
              placeholder="Incluya enlaces a manuales, drivers u otros archivos (separados por comas)"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Separe múltiples enlaces con comas
            </p>
          </div>
        </div>

        {/* Sección de Descripciones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Descripciones</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripción Corta</Label>
              <Textarea
                id="shortDescription"
                value={producto.shortDescription}
                onChange={(e) => setProducto({ ...producto, shortDescription: e.target.value })}
                placeholder="Aparece en listados y tarjetas de producto (máx. 160 caracteres)"
                maxLength={160}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {producto.shortDescription?.length || 0}/160 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción Larga</Label>
              <Textarea
                id="description"
                value={producto.description}
                onChange={(e) => setProducto({ ...producto, description: e.target.value })}
                placeholder="Describa el producto en detalle..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="functionalities">Características y Funcionalidades</Label>
              <Textarea
                id="functionalities"
                value={producto.functionalities}
                onChange={(e) => setProducto({ ...producto, functionalities: e.target.value })}
                placeholder="Enumere las principales características del producto"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Separe cada característica con una nueva línea
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalData">Especificaciones Técnicas</Label>
              <Textarea
                id="technicalData"
                value={producto.technicalData}
                onChange={(e) => setProducto({ ...producto, technicalData: e.target.value })}
                placeholder="Incluya las especificaciones técnicas del producto"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Sección de Imágenes del Producto */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Imágenes del Producto</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden border">
                    <img
                      src={img.url}
                      alt={`Producto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <label
                htmlFor="image-upload"
                className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">Agregar Imagen</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Sube hasta 10 imágenes. La primera imagen será la principal.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/productos')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Producto'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NuevoProducto;
