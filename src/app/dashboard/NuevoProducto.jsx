import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { defineStepper } from '@/components/ui/stepper';
import { Loader2, Plus, X, ArrowLeft, Droplet, Palette, Check, Trash2, Upload } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Services
import { createProduct, createProductWithImages } from '@/services/admin/productService';
import { getActiveCategories } from '@/services/admin/categoryService';
import { getAllActiveBrands, getCategoriesByBrand } from '@/services/admin/brandService';
import { uploadMedia, deleteMedia } from '@/services/admin/mediaService';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import KeyValueInput from '@/components/common/KeyValueInput';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';



// Definir los pasos del formulario
const { Stepper, useStepper } = defineStepper(
  { id: "info-basica", title: "Información Básica" },
  { id: "precios-inventario", title: "Precios e Inventario" },
  { id: "tipo-uso", title: "Tipo y Uso" },
  { id: "descripciones", title: "Descripciones" },
  { id: "imagenes", title: "Imágenes" }
);

const NuevoProducto = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  
  // Definir el estado inicial del producto
  const [producto, setProducto] = useState({
    name: '',
    externalId: '',
    brandId: '',
    categoryId: '',
    type: '',
    productUsage: '',
    shortDescription: '',
    description: '',
    price: '',
    cost: '',
    discount: 0,
    stock: 0,
    garanty: 0,
    color: '#000000',
    rentable: false,
    status: 'ACTIVE',
    technicalData: [],
    functionalities: [],
    downloads: []
  });
  
  // Consulta para obtener marcas
  const { 
    data: brands = [], 
    isLoading: isLoadingBrands 
  } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await getAllActiveBrands();
      return Array.isArray(response) ? response : (response?.result || response?.data || []);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Consulta para obtener categorías por marca
  const { 
    data: filteredCategories = [], 
    isLoading: isLoadingCategories,
    refetch: refetchCategories 
  } = useQuery({
    queryKey: ['categories', producto.brandId],
    queryFn: async () => {
      if (!producto.brandId) return [];
      const response = await getCategoriesByBrand(producto.brandId);
      return response?.data || [];
    },
    enabled: !!producto.brandId, // Solo se ejecuta si hay un brandId
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Obtener métodos del stepper
  const methods = useStepper();

  // Estado de carga combinado
  const isLoading = isLoadingBrands || (producto.brandId && isLoadingCategories);

  // Manejar selección de imagen
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // Subir imagen al servidor
  const handleImageUpload = useCallback(async () => {
    if (!selectedImage) return;
    
    try {
      setIsUploading(true);
      console.log('Subiendo imagen:', selectedImage.name);
      
      // Subir la imagen usando el servicio de media
      const response = await uploadMedia(selectedImage);
      
      console.log('Respuesta de subida de imagen:', response);
      
      // Extraer la URL de la respuesta
      let imageUrl = '';
      let imageId = 0;
      
      // Manejar la respuesta según la estructura esperada
      if (Array.isArray(response) && response.length > 0) {
        // Estructura: [{ url: '...', id: 1, ... }]
        imageUrl = response[0].url;
        imageId = response[0].id || 0;
      } else if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        // Estructura: { data: [{ url: '...', id: 1, ... }] }
        imageUrl = response.data[0].url;
        imageId = response.data[0].id || 0;
      } else if (response?.url) {
        // Estructura: { url: '...', id: 1, ... }
        imageUrl = response.url;
        imageId = response.id || 0;
      }
      
      if (!imageUrl) {
        console.error('No se pudo extraer la URL de la imagen de la respuesta:', response);
        throw new Error('No se pudo obtener la URL de la imagen subida');
      }
      
      // Crear objeto de imagen con la estructura esperada
      const newImage = {
        id: imageId,
        url: imageUrl,
        previewUrl: URL.createObjectURL(selectedImage),
        fileType: 'IMAGE',
        entityType: 'PRODUCT',
        displayOrder: uploadedImages.length
      };
      
      // Actualizar estado
      setUploadedImages(prev => [...prev, newImage]);
      setSelectedImage(null);
      
      // Limpiar input de archivo
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
      
      toast.success("Imagen subida correctamente");
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast.error("Error al subir la imagen: " + (error.response?.data?.message || error.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, uploadedImages]);

  // Efecto para subir la imagen cuando se selecciona
  useEffect(() => {
    if (selectedImage) {
      handleImageUpload();
    }
  }, [selectedImage, handleImageUpload]);

  // Manejar carga de imagen por URL
  const handleImageUrlSubmit = useCallback(async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      setIsUploading(true);
      
      // Validar que sea una URL de imagen válida
      try {
        new URL(imageUrl);
      } catch (e) {
        throw new Error('Por favor ingresa una URL válida');
      }
      
      // Crear un objeto de imagen temporal
      const tempId = 'temp-' + Date.now();
      const newImage = {
        id: tempId,
        url: imageUrl,
        previewUrl: imageUrl,
        fileType: 'IMAGE',
        entityType: 'PRODUCT',
        displayOrder: uploadedImages.length,
        isFromUrl: true
      };
      
      // Verificar si la imagen es accesible
      const img = new Image();
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('No se pudo cargar la imagen desde la URL proporcionada'));
      });
      
      // Si llegamos aquí, la imagen es válida
      setUploadedImages(prev => [...prev, newImage]);
      toast.success("Imagen agregada correctamente");
      
    } catch (error) {
      console.error('Error al cargar imagen desde URL:', error);
      toast.error(error.message || 'Error al cargar la imagen desde la URL');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages]);

  // Manejar eliminación de imagen
  const handleRemoveImage = useCallback(async (imageId, index) => {
    try {
      // Confirmar con el usuario antes de eliminar
      if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
        // Si la imagen ya está guardada en el servidor y no es una URL externa, eliminarla
        if (imageId && !imageId.startsWith('temp-') && !uploadedImages[index]?.isFromUrl) {
          await deleteMedia([imageId]);
          toast.success("Imagen eliminada correctamente");
        }
        
        // Actualizar el estado local
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast.error("Error al eliminar la imagen: " + (error.message || "Error desconocido"));
    }
  }, []);

    // Manejar cambio de marca
  const handleBrandChange = (brandId) => {
    // Encontrar la marca seleccionada
    const marcaSeleccionada = brands.find(brand => brand.id.toString() === brandId);
    
    // Actualizar el estado del producto con la nueva marca y reiniciar la categoría
    setProducto(prev => ({
      ...prev,
      brandId,
      categoryId: '',
      // Actualizar el color con el de la marca seleccionada, si tiene
      color: marcaSeleccionada?.color || prev.color || '#000000'
    }));

    // Invalidar la consulta de categorías para forzar una nueva carga
    if (brandId) {
      queryClient.invalidateQueries({ queryKey: ['categories', brandId] });
    }
  };

  // Función para formatear arrays a strings para la API
  const formatArrayForApi = (array) => {
    if (!array || !Array.isArray(array)) return '';
    return array.map(item => `${item.key}: ${item.value}`).join(', ');
  };

  // Función para validar el formulario al guardar
  const validateForm = () => {
    // Validaciones básicas
    if (!producto.name) {
      toast.error('El nombre del producto es obligatorio');
      return false;
    }
    if (!producto.brandId) {
      toast.error('Debe seleccionar una marca');
      return false;
    }
    if (!producto.categoryId) {
      toast.error('Debe seleccionar una categoría');
      return false;
    }
    if (parseFloat(producto.price) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return false;
    }
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Evitar múltiples envíos
    if (isSubmitting || isUploading) {
      toast.warning('Por favor espera a que terminen las cargas en curso');
      return;
    }
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    // Validar que haya al menos una imagen
    if (uploadedImages.length === 0) {
      toast.error('Por favor sube al menos una imagen del producto');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Creando producto...');
    
    try {
      // Formatear los campos de array a strings
      const formattedFunctionalities = formatArrayForApi(producto.functionalities);
      const formattedTechnicalData = formatArrayForApi(producto.technicalData);
      const formattedDownloads = Array.isArray(producto.downloads) 
        ? producto.downloads.map(d => d.value).join(', ')
        : producto.downloads || '';
      
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
        // Formatear campos de array a strings
        functionalities: formattedFunctionalities,
        technicalData: formattedTechnicalData,
        type: producto.type || '',
        productUsage: producto.productUsage || '',
        downloads: formattedDownloads,
        // Asignar el estado activo
        status: 'ACTIVE',
        // Asignar la fecha de creación
        createdAt: new Date().toISOString(),
        // Creado por (puedes ajustar esto según tu sistema de autenticación)
        createdBy: '1',
        // Incluir las imágenes ya subidas
        media: uploadedImages.map((img, index) => ({
          id: img.id || 0,
          url: img.url,
          fileType: 'IMAGE',
          entityType: 'PRODUCT',
          displayOrder: index
        }))
      };
      
      console.log('Enviando datos para crear producto:', datos);
      
      // Llamar al servicio para crear el producto con las imágenes ya subidas
      const response = await createProductWithImages(datos, []);
      
      console.log('Respuesta completa del servidor:', response);
      
      // Verificar la estructura de la respuesta
      const productoCreado = response?.data || response;
      
      if (productoCreado && (productoCreado.id || (productoCreado.data && productoCreado.data.id))) {
        toast.dismiss(loadingToast);
        toast.success('Producto creado exitosamente');
        
        // Esperar un momento antes de navegar para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          navigate('/dashboard/productos');
        }, 1500);
      } else {
        throw new Error('La respuesta del servidor no contiene el ID del producto creado');
      }
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || error.message || 'Error al crear el producto');
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


  

  

  // Dentro del componente NuevoProducto, reemplaza el return existente con esto:
return (
  <div className="p-6 max-w-6xl mx-auto">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      <Button 
        variant="outline" 
        onClick={() => navigate('/dashboard')}
        disabled={isSubmitting}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
    </div>

    <Stepper.Provider initialStep="info-basica" className="space-y-6">
      {({ methods }) => (
        <form onSubmit={handleSubmit}>
          <Stepper.Navigation className="mb-6">
            <Stepper.Step of="info-basica">
              <Stepper.Title>Información Básica</Stepper.Title>
              <Stepper.Description>Datos principales del producto</Stepper.Description>
            </Stepper.Step>
            
            <Stepper.Step of="precios-inventario">
              <Stepper.Title>Precios e Inventario</Stepper.Title>
              <Stepper.Description>Precios, stock y garantía</Stepper.Description>
            </Stepper.Step>
            
            <Stepper.Step of="tipo-uso">
              <Stepper.Title>Tipo y Uso</Stepper.Title>
              <Stepper.Description>Clasificación del producto</Stepper.Description>
            </Stepper.Step>
            
            <Stepper.Step of="descripciones">
              <Stepper.Title>Descripciones</Stepper.Title>
              <Stepper.Description>Detalles y especificaciones</Stepper.Description>
            </Stepper.Step>
            
            <Stepper.Step of="imagenes">
              <Stepper.Title>Imágenes</Stepper.Title>
              <Stepper.Description>Fotos del producto</Stepper.Description>
            </Stepper.Step>
          </Stepper.Navigation>

          {/* Contenido de cada paso */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            {methods.current.id === "info-basica" && (
              <Stepper.Panel>
                {/* Contenido del paso 1: Información Básica */}
                <h2 className="text-lg font-medium mb-4">Información Básica</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aquí van los campos de Información Básica */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nombre del Producto <span className="text-red-500">*</span>
                      {!producto.name && <span className="ml-2 text-xs text-red-500">(Requerido)</span>}
                    </Label>
                    <Input
                      id="name"
                      value={producto.name}
                      onChange={(e) => setProducto({ ...producto, name: e.target.value })}
                      placeholder="Ej: Taladro inalámbrico 1/2 pulgada"
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
                    <Label htmlFor="brandId">
                      Marca <span className="text-red-500">*</span>
                      {!producto.brandId && <span className="ml-2 text-xs text-red-500">(Requerido)</span>}
                    </Label>
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
                    <Label htmlFor="categoryId">
                      Categoría <span className="text-red-500">*</span>
                      {!producto.categoryId && <span className="ml-2 text-xs text-red-500">(Requerido)</span>}
                    </Label>
                    <Select
                      value={producto.categoryId}
                      onValueChange={(value) => setProducto(prev => ({ ...prev, categoryId: value }))}
                      required
                      disabled={!producto.brandId || isLoadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            isLoadingCategories 
                              ? 'Cargando categorías...' 
                              : !producto.brandId 
                                ? 'Seleccione una marca primero' 
                                : 'Seleccione una categoría'
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {isLoadingCategories ? 'Cargando...' : 'No hay categorías disponibles para esta marca'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {!isLoadingCategories && filteredCategories.length === 0 && producto.brandId && (
                      <p className="text-xs text-muted-foreground">
                        No se encontraron categorías para esta marca.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="color" className="text-sm font-medium text-gray-700">Color</Label>
                      {producto.color && producto.brandId && (
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
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
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
                          className="font-mono pr-10 w-full text-sm"
                        />
                        <div 
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                          style={{ backgroundColor: producto.color || '#ffffff' }}
                        />
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            className="h-10 w-10 p-0 flex-shrink-0"
                          >
                            <Palette className="h-4 w-4 text-gray-600" />
                            <span className="sr-only">Abrir selector de color</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 border border-gray-200 shadow-lg rounded-lg bg-white">
                          <HexColorPicker 
                            color={producto.color || '#000000'} 
                            onChange={(color) => setProducto(prev => ({ ...prev, color }))} 
                            style={{ width: '200px' }}
                          />
                          <div className="mt-3 text-sm text-center text-gray-600 font-mono">
                            {producto.color || '#000000'}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <div className="flex flex-col items-end space-y-1 max-w-xs">
                      <div className="flex items-center">
                        <Label htmlFor="rentable" className="font-medium text-gray-700 mr-3">
                          Disponible para renta
                        </Label>
                        <Switch
                          id="rentable"
                          checked={producto.rentable || false}
                          onCheckedChange={(checked) => setProducto(prev => ({ ...prev, rentable: checked }))}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        Marca este producto como disponible para alquiler
                      </p>
                    </div>
                  </div>
                </div>
              </Stepper.Panel>
            )}

            {methods.current.id === "precios-inventario" && (
              <Stepper.Panel>
                {/* Contenido del paso 2: Precios e Inventario */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Información de Precios</h2>
                    <p className="text-sm text-gray-500 mb-6">Configura los precios y descuentos del producto</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="flex items-center gap-1">
                          <span>Precio de Venta</span>
                          <span className="text-red-500">*</span>
                          {(parseFloat(producto.price) <= 0 || isNaN(parseFloat(producto.price))) && (
                            <span className="ml-2 text-xs text-red-500">Debe ser mayor a 0</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={producto.price}
                            onChange={(e) => setProducto({ ...producto, price: e.target.value })}
                            className={`h-11 ${(parseFloat(producto.price) <= 0 || isNaN(parseFloat(producto.price))) ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            required
                            aria-invalid={parseFloat(producto.price) <= 0 || isNaN(parseFloat(producto.price))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">MXN</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cost" className="flex items-center gap-1">
                          <span>Costo</span>
                          <span className="text-xs text-gray-400">(Opcional)</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={producto.cost || ''}
                            onChange={(e) => setProducto({ ...producto, cost: e.target.value })}
                            className="h-11"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">MXN</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount" className="flex items-center gap-1">
                          <span>Descuento</span>
                          <span className="text-xs text-gray-400">(Opcional)</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="discount"
                            type="number"
                            min="0"
                            max="100"
                            value={producto.discount || ''}
                            onChange={(e) => setProducto({ ...producto, discount: e.target.value })}
                            className="pr-16 h-11"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">%</span>
                          </div>
                        </div>
                        {producto.discount > 0 && producto.price > 0 && (
                          <p className="text-xs text-green-600">
                            Precio con descuento: ${(producto.price * (1 - (producto.discount/100))).toFixed(2)} MXN
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Inventario y Garantía</h2>
                    <p className="text-sm text-gray-500 mb-6">Gestiona el stock y la garantía del producto</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Inicial</Label>
                        <div className="relative">
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={producto.stock || ''}
                            onChange={(e) => setProducto({ ...producto, stock: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Cantidad disponible en inventario</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="garanty">Período de Garantía</Label>
                        <div className="relative">
                          <Input
                            id="garanty"
                            type="number"
                            min="0"
                            value={producto.garanty || ''}
                            onChange={(e) => setProducto({ ...producto, garanty: e.target.value })}
                            className="pr-16 h-11"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">meses</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Déjalo en 0 si no aplica garantía</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Stepper.Panel>
            )}

            {methods.current.id === "tipo-uso" && (
              <Stepper.Panel>
                {/* Contenido del paso 3: Tipo y Uso */}
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
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Documentos y Descargas</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDownload = { key: '', value: '' };
                        setProducto(prev => ({
                          ...prev,
                          downloads: [...(Array.isArray(prev.downloads) ? prev.downloads : []), newDownload]
                        }));
                      }}
                      className="flex items-center gap-1 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar enlace
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {Array.isArray(producto.downloads) && producto.downloads.length > 0 ? (
                      producto.downloads.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 flex-1">
                            <div className="md:col-span-2">
                              <Input
                                placeholder="Ej: Manual de Usuario"
                                value={item.key || ''}
                                onChange={(e) => {
                                  const newDownloads = [...producto.downloads];
                                  newDownloads[index].key = e.target.value;
                                  setProducto(prev => ({
                                    ...prev,
                                    downloads: newDownloads
                                  }));
                                }}
                              />
                            </div>
                            <div className="md:col-span-3 flex gap-2">
                              <Input
                                placeholder="https://ejemplo.com/documento.pdf"
                                value={item.value || ''}
                                onChange={(e) => {
                                  const newDownloads = [...producto.downloads];
                                  newDownloads[index].value = e.target.value;
                                  setProducto(prev => ({
                                    ...prev,
                                    downloads: newDownloads
                                  }));
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  const newDownloads = producto.downloads.filter((_, i) => i !== index);
                                  setProducto(prev => ({
                                    ...prev,
                                    downloads: newDownloads
                                  }));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No se han agregado enlaces de descarga
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Agrega enlaces a documentos como manuales, fichas técnicas o catálogos relacionados con el producto.
                  </p>
                </div>
              </Stepper.Panel>
            )}

            {methods.current.id === "descripciones" && (
              <Stepper.Panel>
                {/* Contenido del paso 4: Descripciones */}
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Características y Funcionalidades</Label>
                      <KeyValueInput
                        values={Array.isArray(producto.functionalities) ? producto.functionalities : []}
                        onChange={(newValues) => setProducto({ ...producto, functionalities: newValues })}
                        placeholderKey="Característica"
                        placeholderValue="Valor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Especificaciones Técnicas</Label>
                      <KeyValueInput
                        values={Array.isArray(producto.technicalData) ? producto.technicalData : []}
                        onChange={(newValues) => setProducto({ ...producto, technicalData: newValues })}
                        placeholderKey="Especificación"
                        placeholderValue="Detalle"
                      />
                    </div>
                  </div>
                </div>
              </Stepper.Panel>
            )}

            {methods.current.id === "imagenes" && (
              <Stepper.Panel>
                {/* Contenido del paso 5: Imágenes del Producto */}
                <h2 className="text-lg font-medium mb-4">Imágenes del Producto</h2>
                <div className="space-y-4">
                    <div className="space-y-4">
                      {/* Sección de arrastrar y soltar */}
                      <div 
                        className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const file = e.dataTransfer.files[0];
                            if (file.type.startsWith('image/')) {
                              setSelectedImage(file);
                            } else {
                              toast.error('Por favor, sube solo archivos de imagen');
                            }
                          }
                        }}
                      >
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <div className="space-y-2">
                            <Upload className="h-10 w-10 mx-auto text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium text-primary">Haz clic para cargar</span> o arrastra y suelta
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, WEBP (Máx. 5MB por imagen)
                              </p>
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading || isSubmitting}
                              onChange={handleImageSelect}
                            />
                          </div>
                        </label>
                      </div>

                      {/* Sección de URL de imagen */}
                      <div className="space-y-2">
                        <Label htmlFor="image-url">O pega una URL de imagen</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="image-url"
                            type="url"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                e.preventDefault();
                                handleImageUrlSubmit(e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById('image-url');
                              if (input.value) {
                                handleImageUrlSubmit(input.value);
                                input.value = '';
                              }
                            }}
                            disabled={isUploading || isSubmitting}
                          >
                            Agregar
                          </Button>
                        </div>
                      </div>
                      
                      {/* Vista previa de imágenes */}
                      {uploadedImages.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-3">Imágenes del producto</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {uploadedImages.map((img, idx) => (
                              <div 
                                key={img.id || idx} 
                                className="relative aspect-square rounded-md overflow-hidden border group"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', idx.toString());
                                  e.currentTarget.classList.add('ring-2', 'ring-primary');
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.add('ring-2', 'ring-blue-500');
                                }}
                                onDragLeave={(e) => {
                                  e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
                                  
                                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                  const toIndex = idx;
                                  
                                  if (fromIndex !== toIndex) {
                                    const newImages = [...uploadedImages];
                                    const [movedImage] = newImages.splice(fromIndex, 1);
                                    newImages.splice(toIndex, 0, movedImage);
                                    setUploadedImages(newImages);
                                  }
                                }}
                                onClick={() => {
                                  // Hacer clic en una imagen la convierte en la principal
                                  if (idx > 0) {
                                    const newImages = [...uploadedImages];
                                    const [movedImage] = newImages.splice(idx, 1);
                                    newImages.unshift(movedImage);
                                    setUploadedImages(newImages);
                                  }
                                }}
                              >
                                <div className="w-full h-full bg-gray-100">
                                  <img 
                                    src={img.previewUrl || img.url} 
                                    alt={`Imagen ${idx + 1}`} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(img.id, idx);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  aria-label="Eliminar imagen"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                {img === uploadedImages[0] && (
                                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                                    Principal
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sube hasta 10 imágenes. La primera imagen será la principal.
                  </p>
                </div>
              </Stepper.Panel>
            )}
          </div>

          {/* Controles de navegación */}
          <Stepper.Controls className="flex justify-between">
            <div>
              {methods.current.id !== "info-basica" && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={methods.prev}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              
              {methods.current.id !== "imagenes" ? (
                <Button 
                  type="button" 
                  onClick={methods.next}
                  disabled={isSubmitting}
                >
                  Siguiente
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Guardar Producto
                    </>
                  )}
                </Button>
              )}
            </div>
          </Stepper.Controls>
        </form>
      )}
    </Stepper.Provider>
  </div>
);
  
};

export default NuevoProducto;
