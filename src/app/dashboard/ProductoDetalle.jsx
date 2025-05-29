import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadMedia, deleteMedia } from '@/services/admin/mediaService';
import { getProductById, updateProduct, uploadImage } from "@/services/admin/productService";
import { getAllActiveBrands, getCategoriesByBrand } from "@/services/admin/brandService";
import { getAllCategories } from "@/services/admin/categoryService";
import { createMultimedia } from "@/services/admin/multimediaService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import KeyValueInput from "@/components/common/KeyValueInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function isLightColor(hexColor) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186;
}

export default function ProductoDetalle() {
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    cost: 0,
    stock: 0,
    status: 'ACTIVE',
    brandId: 0,
    categoryId: 0,
    media: [],
    technicalData: [],
    functionalities: [],
    downloads: {}
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Consulta para obtener marcas activas
  const { 
    data: brands = [], 
    isLoading: isLoadingBrands 
  } = useQuery({
    queryKey: ['activeBrands'],
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
    queryKey: ['categories', editedProduct?.brandId],
    queryFn: async () => {
      if (!editedProduct?.brandId) return [];
      const response = await getCategoriesByBrand(editedProduct.brandId);
      return response?.data || [];
    },
    enabled: !!editedProduct?.brandId, // Solo se ejecuta si hay un brandId
  });

  // Estado de carga combinado
  const isLoadingData = isLoading || isLoadingBrands || (editedProduct?.brandId && isLoadingCategories);

  // Función para cargar los datos del producto
  const loadProductData = async (id) => {
    try {
      setIsLoading(true);

      console.log(`Cargando datos del producto con ID ${id}...`);

      // Forzar una recarga completa desde el servidor
      const response = await getProductById(id);
      console.log('Respuesta completa del servidor:', response);

      // Verificar el formato de la respuesta (puede ser el formato anterior o el nuevo)
      let product;
      
      if (response.data) {
        // Nuevo formato de API: { data: {...}, status: 200, message: 'success' }
        console.log('Detectado nuevo formato de API');
        product = response.data;
      } else if (response.type === "SUCCESS" && response.result) {
        // Formato anterior: { type: "SUCCESS", result: {...} }
        console.log('Detectado formato anterior de API');
        product = response.result;
      } else {
        throw new Error('Formato de respuesta no reconocido');
      }

      console.log('Datos del producto extraídos:', product);

      // Asegurarse de que los campos dinámicos estén inicializados correctamente
      if (!product.technicalData) product.technicalData = [];
      if (!product.functionalities) product.functionalities = [];
      if (!product.downloads) product.downloads = [];
      if (!product.description) product.description = '';

      // Función para convertir string de pares clave-valor a array de objetos
      const stringToKeyValueArray = (str) => {
        if (!str) return [];
        
        // Si es un array, devolverlo directamente
        if (Array.isArray(str)) {
          return str;
        }
        
        // Si es un objeto, convertirlo a array de pares clave-valor
        if (typeof str === 'object' && str !== null) {
          return Object.entries(str).map(([key, value]) => ({
            key: key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value)
          }));
        }
        
        // Si es string, intentar parsear como JSON
        if (typeof str === 'string') {
          try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) {
              return parsed;
            } else if (typeof parsed === 'object' && parsed !== null) {
              return Object.entries(parsed).map(([key, value]) => ({
                key,
                value: typeof value === 'object' ? JSON.stringify(value) : String(value)
              }));
            }
          } catch (e) {
            console.log('No es un JSON válido, intentando parsear como texto plano');
            
            // Intentar dividir por comas para pares clave:valor
            try {
              const lines = str.split('\n').filter(line => line.trim() !== '');
              return lines.map(line => {
                const [key, ...valueParts] = line.split(':');
                return {
                  key: key ? key.trim() : '',
                  value: valueParts.length > 0 ? valueParts.join(':').trim() : ''
                };
              });
            } catch (e) {
              console.error('Error al parsear texto plano:', e);
            }
          }
        }
        
        return [];
      };

      // Procesar campos según su tipo
      product.technicalData = stringToKeyValueArray(product.technicalData);
      product.functionalities = stringToKeyValueArray(product.functionalities);
      
      // Asegurarse de que siempre sean arrays
      if (!Array.isArray(product.technicalData)) {
        product.technicalData = [];
      }
      
      if (!Array.isArray(product.functionalities)) {
        product.functionalities = [];
      }

      // Procesar descargas
      if (typeof product.downloads === 'string') {
        try {
          // Intentar parsear como JSON
          if (product.downloads.trim().startsWith('{') || product.downloads.trim().startsWith('[')) {
            product.downloads = JSON.parse(product.downloads);
          } else {
            // Si no es un JSON, intentar parsear como texto plano
            const lines = product.downloads.split('\n').filter(line => line.trim() !== '');
            const downloadsObj = {};
            
            lines.forEach((line, index) => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                downloadsObj[key.trim()] = valueParts.join(':').trim();
              } else if (line.trim()) {
                // Si no hay dos partes, usamos el índice como clave
                downloadsObj[`enlace_${index + 1}`] = line.trim();
              }
            });
            
            product.downloads = downloadsObj;
          }
        } catch (e) {
          console.error('Error al procesar descargas:', e);
          product.downloads = {}; // Valor por defecto en caso de error
        }
      } else if (!product.downloads || typeof product.downloads !== 'object') {
        product.downloads = {}; // Asegurar que siempre sea un objeto
      }

      if (typeof product.description === 'string' && product.description.trim().startsWith('{')) {
        try {
          product.description = JSON.parse(product.description);
        } catch (e) {
          console.error('Error al parsear description:', e);
          // Mantener como string si no es JSON válido
        }
      }

      // Asegurarse de que brandId y categoryId estén presentes
      product.brandId = product.brandId || product.brand_id;
      product.categoryId = product.categoryId || product.category_id;
      product.brand_id = product.brandId;
      product.category_id = product.categoryId;

      console.log('Producto cargado (procesado):', product);
      console.log('Datos técnicos:', product.technicalData);

      // Asegurarse de que el producto tenga un array de media
      const productWithMedia = {
        ...product,
        media: Array.isArray(product.media) ? product.media : []
      };

      // Actualizar el estado con los datos procesados
      setProducto(productWithMedia);
      setEditedProduct(prev => ({
        ...prev,
        ...productWithMedia,
        media: productWithMedia.media || []
      }));
      
      // Actualizar imágenes cargadas
      setUploadedImages(productWithMedia.media || []);
      
      // Establecer la imagen principal si hay imágenes
      if (productWithMedia.media && productWithMedia.media.length > 0) {
        setMainImage(productWithMedia.media[0]?.url || '');
      } else {
        setMainImage('');
      }

      return product;
    } catch (error) {
      console.error('Error loading product data:', error);
      toast.error("Error al cargar el producto: " + (error.message || 'Error desconocido'));
      navigate("/dashboard");
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

  // Función para manejar la selección de imagen
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Si solo hay un archivo, usamos la lógica existente
      if (e.target.files.length === 1) {
        setSelectedImage(e.target.files[0]);
      } else {
        // Si hay múltiples archivos, los procesamos directamente
        handleImageUpload(e);
      }
    }
  };

  // Función para subir imágenes al servidor (maneja tanto archivo único como múltiples)
  const handleImageUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      // Convertir a array si es necesario
      const fileList = Array.isArray(files) ? files : [files];
      
      // Subir cada archivo individualmente
      const uploadPromises = fileList.map(file => {
        console.log('Subiendo archivo:', file.name);
        return uploadMedia(file);
      });
      
      // Esperar a que todas las subidas terminen
      const responses = await Promise.all(uploadPromises);
      console.log('Respuestas de subida de archivos:', responses);
      
      // Procesar las respuestas
      const newImages = [];
      
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const file = fileList[i];
        
        // Manejar diferentes formatos de respuesta
        let fileData;
        
        if (Array.isArray(response) && response.length > 0) {
          // Formato: [{ url: '...', id: 1, ... }]
          fileData = response[0];
        } else if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          // Formato: { data: [{ url: '...', id: 1, ... }] }
          fileData = response.data[0];
        } else if (response?.url) {
          // Formato: { url: '...', id: 1, ... }
          fileData = response;
        } else {
          console.error('Formato de respuesta no reconocido:', response);
          continue;
        }
        
        if (!fileData?.url) {
          console.error('No se pudo extraer la URL de la imagen de la respuesta:', response);
          continue;
        }
        
        const newImage = {
          id: fileData.id || `temp-${Date.now()}-${i}`,
          url: fileData.url,
          previewUrl: URL.createObjectURL(file),
          fileType: 'IMAGE',
          entityType: 'PRODUCT',
          displayOrder: 0, // Se actualizará más adelante
          isNew: true
        };
        
        newImages.push(newImage);
      }
      
      if (newImages.length === 0) {
        throw new Error('No se pudo subir ninguna imagen. Verifica los formatos soportados.');
      }
      
      // Actualizar el estado con las nuevas imágenes
      setEditedProduct(prev => {
        const currentMedia = Array.isArray(prev?.media) ? prev.media : [];
        const updatedMedia = [
          ...currentMedia,
          ...newImages.map((img, idx) => ({
            ...img,
            displayOrder: currentMedia.length + idx
          }))
        ];
        
        return {
          ...prev,
          media: updatedMedia
        };
      });
      
      // Establecer la primera imagen como principal si no hay una principal
      setMainImage(prevMainImage => {
        if (!prevMainImage && newImages.length > 0) {
          return newImages[0].url;
        }
        return prevMainImage;
      });
      
      // Actualizar también el estado de las imágenes cargadas
      setUploadedImages(prev => [...(prev || []), ...newImages]);
      
      // Limpiar input de archivo
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
      
      toast.success(`Se subieron ${newImages.length} imagen(es) correctamente`);
      
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error("Error al subir las imágenes: " + (error.response?.data?.message || error.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
    }
  }, [editedProduct.media, mainImage]);
  
  // Efecto para subir la imagen cuando se selecciona
  useEffect(() => {
    if (selectedImage) {
      handleImageUpload();
    }
  }, [selectedImage, handleImageUpload]);

  // Manejar carga de imagen por URL
  const handleImageUrlSubmit = useCallback(async (url) => {
    if (!url) return;
    
    try {
      setIsUploading(true);
      
      // Validar que sea una URL de imagen válida
      try {
        new URL(url);
      } catch (e) {
        throw new Error('Por favor ingresa una URL válida');
      }
      
      // Verificar si la URL termina con una extensión de imagen válida
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const hasValidExtension = validExtensions.some(ext => url.toLowerCase().endsWith(ext));
      
      if (!hasValidExtension) {
        throw new Error('La URL debe apuntar a una imagen (jpg, jpeg, png, webp o gif)');
      }
      
      // Crear un objeto de imagen temporal
      const tempId = `temp-${Date.now()}`;
      const newImage = {
        id: tempId,
        url: url,
        previewUrl: url,
        fileType: 'IMAGE',
        entityType: 'PRODUCT',
        displayOrder: editedProduct.media?.length || 0,
        isNew: true
      };
      
      // Actualizar el estado con la nueva imagen
      const updatedMedia = [...(editedProduct.media || []), newImage];
      setEditedProduct(prev => ({
        ...prev,
        media: updatedMedia
      }));
      
      // Establecer como imagen principal si es la primera
      if (!mainImage) {
        setMainImage(url);
      }
      
      // Limpiar el input
      setImageUrlInput('');
      toast.success('Imagen por URL agregada correctamente');
      
    } catch (error) {
      console.error('Error al cargar imagen por URL:', error);
      toast.error(error.message || 'Error al cargar la imagen por URL');
    } finally {
      setIsUploading(false);
    }
  }, [editedProduct.media, mainImage, setImageUrlInput]);

  // Manejar eliminación de imagen
  const handleRemoveImage = useCallback(async (imageId, index) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsUploading(true);
      
      // Determinar si es una imagen temporal o una guardada en el servidor
      const isTemporary = imageId.startsWith('temp-');
      const isFromUrl = uploadedImages[index]?.isFromUrl;
      
      // Si no es temporal ni de URL, eliminarla del servidor
      if (!isTemporary && !isFromUrl) {
        try {
          await deleteMedia([imageId]);
          toast.success("Imagen eliminada del servidor");
        } catch (error) {
          console.error('Error al eliminar la imagen del servidor:', error);
          // Continuar con la eliminación local aunque falle la eliminación en el servidor
        }
      }
      
      // Actualizar el estado local
      setEditedProduct(prev => {
        const currentMedia = Array.isArray(prev.media) ? [...prev.media] : [];
        const updatedMedia = currentMedia.filter((_, i) => i !== index);
        
        // Si la imagen eliminada era la principal, establecer la siguiente como principal
        const wasMainImage = mainImage === currentMedia[index]?.url;
        let newMainImage = mainImage;
        
        if (wasMainImage) {
          newMainImage = updatedMedia[0]?.url || '';
          setMainImage(newMainImage);
        }
        
        return {
          ...prev,
          media: updatedMedia
        };
      });
      
      // Actualizar también el estado de imágenes cargadas
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages.splice(index, 1);
        return newImages;
      });
      
      toast.success("Imagen eliminada correctamente");
      
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      toast.error("Error al eliminar la imagen: " + (error.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
    }
  }, [mainImage, uploadedImages]);

  // Función para manejar el cambio de marca y actualizar el color automáticamente
  const handleBrandChange = (brandId) => {
    const selectedBrand = brands.find(brand => brand.id.toString() === brandId);
    
    // Actualizar el estado del producto con la nueva marca y reiniciar la categoría
    setEditedProduct(prev => ({
      ...prev,
      brandId: brandId ? parseInt(brandId) : null,
      brand_id: brandId ? parseInt(brandId) : null, // Mantener ambos por compatibilidad
      categoryId: '',
      category_id: '',
      color: selectedBrand?.color || prev.color || '#000000'
    }));

    // Invalidar la consulta de categorías para forzar una nueva carga
    if (brandId) {
      queryClient.invalidateQueries({ queryKey: ['categories', brandId] });
    }
  };

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (categoryId) => {
    setEditedProduct(prev => ({
      ...prev,
      categoryId: categoryId ? parseInt(categoryId) : null,
      category_id: categoryId ? parseInt(categoryId) : null // Mantener ambos por compatibilidad
    }));
  };



  // La función handleImageUpload ya está definida arriba con useCallback

  // La función handleRemoveImage ya está definida arriba con useCallback

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
      if (!productToUpdate.functionalities) productToUpdate.functionalities = [];
      if (!productToUpdate.downloads) productToUpdate.downloads = {};
      if (!productToUpdate.description) productToUpdate.description = {};

      // Preparar los datos del producto para la actualización según el formato de Swagger
      const productData = {
        id: Number(productToUpdate.id),
        updatedBy: "1", // Asumiendo que el usuario actual tiene ID 1
        updatedAt: new Date().toISOString(),
        brandId: String(productToUpdate.brandId || productToUpdate.brand_id || "1"),
        categoryId: String(productToUpdate.categoryId || productToUpdate.category_id || "1"),
        externalId: productToUpdate.externalId || "",
        name: productToUpdate.name || "",
        shortDescription: productToUpdate.shortDescription || "",
        description: typeof productToUpdate.description === 'string' 
          ? productToUpdate.description 
          : (productToUpdate.description?.caracteristicas || ""),
        functionalities: Array.isArray(productToUpdate.functionalities) 
          ? productToUpdate.functionalities.map(f => f.value || f).join(", ") 
          : "",
        technicalData: typeof productToUpdate.technicalData === 'string'
          ? productToUpdate.technicalData
          : JSON.stringify(productToUpdate.technicalData, null, 2),
        type: productToUpdate.type || "",
        productUsage: productToUpdate.productUsage || "",
        price: Number(productToUpdate.price || 0),
        cost: Number(productToUpdate.cost || 0),
        discount: Number(productToUpdate.discount || 0),
        stock: Number(productToUpdate.stock || 0),
        garanty: Number(productToUpdate.garanty || 0),
        color: productToUpdate.color || "",
        downloads: typeof productToUpdate.downloads === 'string' 
          ? productToUpdate.downloads 
          : Object.values(productToUpdate.downloads).filter(Boolean).join("\n"),
        rentable: Boolean(productToUpdate.rentable || false),
        status: productToUpdate.status || 'ACTIVE',
        // Procesar multimedia según el formato esperado
        media: (productToUpdate.media || []).map((media, index) => ({
          id: media.id ? Number(media.id) : 0,
          url: media.url || "",
          fileType: "IMAGE", // Asumiendo que todas son imágenes
          entityId: Number(productToUpdate.id) || 0,
          entityType: "PRODUCT",
          displayOrder: index
        }))
      };

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

  const bgColor = producto.color || '#f3f4f6';
  const isLight = isLightColor(bgColor);
  const textColor = isLight ? 'text-black' : 'text-white';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-gray-50">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 w-full sm:w-auto" onClick={handleBack} disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
            Regresar al Dashboard
          </Button>
          {isEditing && (
            <div className="flex flex-row gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <Button
                className="bg-gray-400 hover:bg-gray-500 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 text-sm sm:text-base sm:px-4 sm:py-2"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                <span className="whitespace-nowrap">Cancelar</span>
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 text-sm sm:text-base sm:px-4 sm:py-2"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="whitespace-nowrap">Guardando...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                    <span className="whitespace-nowrap">Guardar</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  Visualización
                </span>
              </TabsTrigger>
              <TabsTrigger value="edit" onClick={handleEdit} className="font-medium text-blue-800 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                  Edición
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-0">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Galería de imágenes */}
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                  <div className="w-full max-w-md h-96 flex justify-center items-center bg-white rounded-lg shadow-md p-4">
                    {producto.media && producto.media.length > 0 ? (
                      <img 
                        src={mainImage || producto.media[0].url} 
                        alt={producto.name} 
                        className="w-full h-full object-contain transition-opacity duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x400?text=Imagen+no+disponible';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center p-6 rounded-lg border-2 border-dashed border-gray-300 w-full h-full flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No hay imágenes disponibles</p>
                        <p className="text-sm text-gray-400 mt-1">Agrega imágenes para mejorar la visibilidad</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Miniaturas de imágenes */}
                  {producto.media && producto.media.length > 0 && (
                    <div className="w-full mt-4">
                      <div className="flex space-x-2 overflow-x-auto py-2 px-1">
                        {producto.media.map((media, index) => (
                          <div 
                            key={`${media.id || index}-${index}`}
                            className={`flex-shrink-0 relative w-16 h-16 border-2 rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
                              (mainImage === media.url || (!mainImage && index === 0)) 
                                ? "border-blue-500 ring-2 ring-blue-200" 
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                            onClick={() => setMainImage(media.url)}
                          >
                            <img
                              src={media.url}
                              alt={`${producto.name} - ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/100?text=Imagen';
                              }}
                            />
                            {(mainImage === media.url || (!mainImage && index === 0)) && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Información básica del producto */}
                <div className="w-full lg:w-1/2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{producto.name}</h1>
                  <p className="text-md sm:text-lg text-gray-700 font-bold my-2">{producto.externalId}</p>
                  
                  <p className="text-gray-600 text-md sm:text-lg font-semibold mb-4">{producto.shortDescription}</p>

                  {/* Información básica y técnica del producto */}
                  <div className="grid grid-cols-2 gap-2">
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
                <div className={`mt-6 p-4 rounded-lg ${textColor}`} style={{ backgroundColor: bgColor }}>
                  <h3 className={`text-xl font-bold mb-2 ${textColor}`}>Características destacadas</h3>
                  <p className={`whitespace-pre-line ${textColor}`}>{producto.description.destacados}</p>
                </div>
              )}

              {/* Descripción del producto */}
              {producto.description && (
                <div 
                  className="p-5 rounded-lg my-6 shadow-sm transition-all duration-300 transform hover:shadow-md"
                  style={{ 
                    backgroundColor: bgColor,
                    color: isLight ? '#1f2937' : '#f9fafb',
                    borderLeft: `4px solid ${bgColor}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Descripción del Producto
                  </h3>
                  <div className="prose max-w-none">
                    {typeof producto.description === 'string' ? (
                      <p className="leading-relaxed">{producto.description}</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(producto.description).map(([key, value]) => (
                          <div key={key}>
                            <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                            <p className="text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Especificaciones técnicas */}
              <div className="mt-6" data-component-name="ProductoDetalle">
                <h3 className="text-xl font-bold text-gray-800 mb-4">ESPECIFICACIONES TÉCNICAS</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {producto.technicalData && producto.technicalData.length > 0 ? (
                        producto.technicalData.map((item, index) => (
                          <tr key={`tech-${index}`}>
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3 capitalize" data-component-name="ProductoDetalle">
                              {item.key}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500" data-component-name="ProductoDetalle">
                              {item.value}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-sm text-gray-500 text-center">
                            No hay especificaciones técnicas disponibles
                          </td>
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
                      {producto.functionalities && producto.functionalities.length > 0 ? (
                        producto.functionalities.map((item, index) => (
                          <tr key={`func-${index}`}>
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3 capitalize">
                              {item.key}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500">
                              {item.value}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-sm text-gray-500 text-center">
                            No hay funcionalidades disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


              {/* Sección de descargas */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Descargas</h3>
                {producto.downloads && Object.keys(producto.downloads).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(producto.downloads).map(([key, value], index) => {
                      // Verificar si la URL es válida
                      let url = value;
                      let displayText = key.replace(/_/g, ' ');
                      
                      // Si la URL no comienza con http, asumimos que no es una URL válida
                      if (typeof url === 'string' && !url.startsWith('http')) {
                        url = `#${key}`;
                      }
                      
                      // Si el texto es muy corto o parece ser un índice, usar un texto más descriptivo
                      if (displayText.length <= 2 || /^\d+$/.test(displayText) || /^enlace_\d+$/.test(key)) {
                        displayText = `Descargar ${index + 1}`;
                      }
                      
                      return (
                        <a
                          key={`download-${index}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <div className="truncate">
                            <span className="text-gray-700 font-medium capitalize">{displayText}</span>
                            {url && url.startsWith('http') && (
                              <p className="text-xs text-gray-500 truncate">{new URL(url).hostname}</p>
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    No hay archivos disponibles para descargar
                  </div>
                )}
              </div>
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
                          onValueChange={handleBrandChange}
                          disabled={isLoadingBrands}
                        >
                          <SelectTrigger id="brand" className={isLoadingBrands ? 'opacity-70' : ''}>
                            <SelectValue placeholder={
                              isLoadingBrands ? 'Cargando marcas...' : 'Seleccionar marca'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingBrands ? (
                              <div className="py-2 text-center text-sm text-gray-500">
                                Cargando marcas...
                              </div>
                            ) : (
                              brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                  <div className="flex items-center">
                                    {brand.color && (
                                      <div
                                        className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                                        style={{ backgroundColor: brand.color }}
                                      />
                                    )}
                                    {brand.name}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">Categoría</Label>
                        <Select
                          value={editedProduct.categoryId ? editedProduct.categoryId.toString() : ""}
                          onValueChange={handleCategoryChange}
                          disabled={!editedProduct.brandId || isLoadingCategories}
                        >
                          <SelectTrigger 
                            id="category" 
                            className={!editedProduct.brandId || isLoadingCategories ? 'opacity-70' : ''}
                          >
                            <SelectValue 
                              placeholder={
                                !editedProduct.brandId 
                                  ? 'Selecciona una marca primero' 
                                  : isLoadingCategories 
                                    ? 'Cargando categorías...' 
                                    : 'Seleccionar categoría'
                              } 
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {!editedProduct.brandId ? (
                              <div className="py-2 text-center text-sm text-gray-500">
                                Selecciona una marca primero
                              </div>
                            ) : isLoadingCategories ? (
                              <div className="py-2 text-center text-sm text-gray-500">
                                Cargando categorías...
                              </div>
                            ) : filteredCategories.length === 0 ? (
                              <div className="py-2 text-center text-sm text-gray-500">
                                No hay categorías disponibles para esta marca
                              </div>
                            ) : (
                              filteredCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
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
                      {/* Precio */}
                      <div>
                        <Label htmlFor="price" className="text-sm font-medium text-gray-700">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          name="price"
                          value={editedProduct.price || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      {/* Costo */}
                      <div>
                        <Label htmlFor="cost" className="text-sm font-medium text-gray-700">Costo</Label>
                        <Input
                          id="cost"
                          type="number"
                          name="cost"
                          value={editedProduct.cost || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      {/* Descuento */}
                      <div>
                        <Label htmlFor="discount" className="text-sm font-medium text-gray-700">Descuento (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          name="discount"
                          value={editedProduct.discount || 0}
                          onChange={handleInputChange}
                          className="mt-1"
                          min="0"
                          max="100"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          name="stock"
                          value={editedProduct.stock || 0}
                          onChange={handleInputChange}
                          className="mt-1"
                          min="0"
                        />
                      </div>

                      {/* Garantía */}
                      <div>
                        <Label htmlFor="garanty" className="text-sm font-medium text-gray-700">Garantía (meses)</Label>
                        <Input
                          id="garanty"
                          type="number"
                          name="garanty"
                          value={editedProduct.garanty || 0}
                          onChange={handleInputChange}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                      
                      {/* Tipo */}
                      <div>
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700">Tipo</Label>
                        <Input
                          id="type"
                          name="type"
                          value={editedProduct.type || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="Ej: Smartphone, Laptop, etc."
                        />
                      </div>
                      
                      {/* Estado */}
                      <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
                        <Select
                          value={editedProduct.status || 'ACTIVE'}
                          onValueChange={(value) => setEditedProduct({ ...editedProduct, status: value })}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Activo</SelectItem>
                            <SelectItem value="INACTIVE">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* ¿Es rentable? */}
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="rentable"
                          name="rentable"
                          checked={editedProduct.rentable || false}
                          onChange={(e) => setEditedProduct({ ...editedProduct, rentable: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="rentable" className="text-sm font-medium text-gray-700">¿Es rentable?</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="productUsage" className="text-sm font-medium text-gray-700">Uso del producto</Label>
                      <textarea
                        id="productUsage"
                        name="productUsage"
                        value={editedProduct.productUsage || ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Ej: Uso personal, profesional, industrial, etc."
                      />
                    </div>
                    
                    {/* Campos ocultos para auditoría */}
                    <input type="hidden" name="id" value={editedProduct.id} />
                    <input type="hidden" name="createdBy" value={editedProduct.createdBy || '1'} />
                    <input type="hidden" name="createdAt" value={editedProduct.createdAt || new Date().toISOString()} />
                    <input type="hidden" name="updatedBy" value={editedProduct.updatedBy || '1'} />
                    <input type="hidden" name="updatedAt" value={new Date().toISOString()} />
                  </div>

                  {/* Galería de imágenes */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Galería de imágenes</h3>
                    <div className="w-full h-64 flex justify-center items-center border border-gray-300 rounded-md mb-4">
                      <img src={mainImage} alt={editedProduct.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="space-y-4">
                      {/* Sección de arrastrar y soltar */}
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const files = Array.from(e.dataTransfer.files);
                            handleImageUpload(files);
                          }
                        }}
                      >
                        <label htmlFor="image-upload" className="cursor-pointer block">
                          <div className="space-y-2">
                            <Upload className={`h-10 w-10 mx-auto ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-700">Haz clic para cargar</span> o arrastra y suelta
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
                              onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                              multiple
                              disabled={isUploading}
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
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleImageUrlSubmit(imageUrlInput);
                              }
                            }}
                            disabled={isUploading}
                          />
                          <Button
                            type="button"
                            onClick={() => handleImageUrlSubmit(imageUrlInput)}
                            disabled={!imageUrlInput || isUploading}
                            className="whitespace-nowrap"
                          >
                            {isUploading ? 'Cargando...' : 'Agregar'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Estado de carga de imágenes */}
                      {isUploading && (
                        <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Subiendo imágenes...
                        </div>
                      )}
                      
                      {/* Mostrar miniaturas de las imágenes subidas */}
                      {editedProduct.media && editedProduct.media.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Imágenes del producto:</p>
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                            {editedProduct.media.map((media, index) => (
                              <div 
                                key={media.id || `img-${index}`} 
                                className={`relative group rounded-md overflow-hidden border-2 ${index === 0 ? 'border-blue-500' : 'border-gray-200'}`}
                              >
                                <img 
                                  src={media.url} 
                                  alt={`Imagen ${index + 1}`} 
                                  className="w-full h-20 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(media.id || media.url, index);
                                    }}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    title="Eliminar imagen"
                                    disabled={isUploading}
                                  >
                                    {isUploading ? (
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                                {index === 0 && (
                                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1" title="Imagen principal">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            La primera imagen será mostrada como principal
                          </p>
                        </div>
                      )}
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
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Descripción completa</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del producto</label>
                    <textarea
                      value={typeof editedProduct.description === 'string' 
                        ? editedProduct.description 
                        : JSON.stringify(editedProduct.description, null, 2)}
                      onChange={(e) => {
                        try {
                          // Intentar analizar como JSON si parece ser un objeto
                          if (e.target.value.trim().startsWith('{') && e.target.value.trim().endsWith('}')) {
                            const parsed = JSON.parse(e.target.value);
                            setEditedProduct({ ...editedProduct, description: parsed });
                          } else {
                            setEditedProduct({ ...editedProduct, description: e.target.value });
                          }
                        } catch (error) {
                          // Si hay un error al parsear, guardar como texto plano
                          setEditedProduct({ ...editedProduct, description: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      rows="10"
                      placeholder="Escribe la descripción completa del producto aquí..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Puedes escribir texto plano o pegar un objeto JSON con la estructura deseada.
                    </p>
                  </div>
                </div>

                {/* Especificaciones técnicas */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Características técnicas */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Características técnicas</h3>
                    <KeyValueInput
                      values={Array.isArray(editedProduct.technicalData) 
                        ? editedProduct.technicalData 
                        : Object.entries(editedProduct.technicalData || {}).map(([key, value]) => ({
                            key,
                            value: typeof value === 'string' ? value : JSON.stringify(value)
                          }))}
                      onChange={(newValues) => {
                        // Si technicalData era originalmente un objeto, lo mantenemos como objeto
                        const wasObject = !Array.isArray(editedProduct.technicalData) && editedProduct.technicalData !== null;
                        
                        if (wasObject) {
                          const newData = {};
                          newValues.forEach(({ key, value }) => {
                            if (key) newData[key] = value;
                          });
                          setEditedProduct({ ...editedProduct, technicalData: newData });
                        } else {
                          setEditedProduct({ ...editedProduct, technicalData: newValues });
                        }
                      }}
                      placeholderKey="Nombre del campo"
                      placeholderValue="Valor"
                    />
                  </div>

                  {/* Funcionalidades */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Funcionalidades</h3>
                    <KeyValueInput
                      values={Array.isArray(editedProduct.functionalities) 
                        ? editedProduct.functionalities 
                        : []}
                      onChange={(newValues) => {
                        setEditedProduct({ ...editedProduct, functionalities: newValues });
                      }}
                      placeholderKey="Nombre del campo"
                      placeholderValue="Descripción"
                    />
                  </div>
                </div>

                {/* Descargas */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Descargas</h3>
                  <KeyValueInput
                    values={Object.entries(editedProduct.downloads || {}).map(([key, value]) => ({ key, value }))}
                    onChange={(newValues) => {
                      const downloadsObj = {};
                      newValues.forEach(({ key, value }) => {
                        if (key && value) downloadsObj[key] = value;
                      });
                      setEditedProduct({ ...editedProduct, downloads: downloadsObj });
                    }}
                    placeholderKey="Nombre del archivo"
                    placeholderValue="URL"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
