import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { 
  getAllSpareParts, 
  getSparePartById, 
  createSparePart, 
  updateSparePart, 
  createSparePartWithImages,
  updateSparePartWithImages,
  deleteSparePart,
  getSparePartImages,
  uploadMediaFile,
  deleteSparePartMedia
} from "@/services/admin/sparePartService";
import { createMultimedia } from "@/services/admin/multimediaService";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SparePartCard = ({ sparePart, onClick }) => {
  // Estado local para almacenar los detalles completos del repuesto
  const [detailedSparePart, setDetailedSparePart] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Obtener detalles completos del repuesto al montar el componente
  useEffect(() => {
    const fetchDetails = async () => {
      if (sparePart && sparePart.id) {
        try {
          setIsLoadingDetails(true);
          const response = await getSparePartById(sparePart.id);
          if (response && response.result) {
            setDetailedSparePart(response.result);
          }
        } catch (error) {
          console.error(`Error al obtener detalles del repuesto ${sparePart.id}:`, error);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchDetails();
  }, [sparePart.id]);

  // Determinar si hay imágenes disponibles
  const hasImages = sparePart?.media && 
                   Array.isArray(sparePart.media) && 
                   sparePart.media.length > 0;

  // Obtener la URL de la primera imagen si existe
  const firstImageUrl = hasImages ? sparePart.media[0].url : null;

  return (
    <Card
      onClick={(e) => {
        // Solo abrir el modal de edición si el clic no viene de un botón dentro de la tarjeta
        if (e.target.closest('button') === null) {
          onClick(e);
        }
      }}
      className="
        cursor-pointer
        filter grayscale-[40%] hover:grayscale-0
        transition-filter duration-500
        flex flex-col h-full
        shadow-md hover:shadow-lg
      "
    >
      <CardHeader>
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
          {isLoadingDetails ? (
            <div className="animate-pulse w-full h-full bg-gray-200"></div>
          ) : firstImageUrl ? (
            <img
              src={firstImageUrl}
              alt={sparePart.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Si hay más imágenes, intentar con la siguiente
                const currentIndex = sparePart.media.findIndex(img => img.url === e.target.src);
                if (currentIndex < sparePart.media.length - 1) {
                  e.target.src = sparePart.media[currentIndex + 1].url;
                } else {
                  // No hay más imágenes, mostrar placeholder
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'flex flex-col items-center justify-center w-full h-full';
                  placeholder.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span class="text-sm text-gray-400 mt-2">Error al cargar la imagen</span>
                  `;
                  e.target.parentNode.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span className="text-sm text-gray-400 mt-2">Sin imagen</span>
            </div>
          )}
        </div>
      </CardHeader>
      <div
        className="rounded-b-xl w-full px-6 py-3 bg-blue-600 text-white relative"
      >
        <CardTitle className="truncate whitespace-nowrap overflow-hidden text-sm md:text-base" title={sparePart.name}>
          {sparePart.name}
        </CardTitle>
        <CardDescription>
          <div className="flex flex-col text-white">
            <span>Código: {sparePart.code}</span>
            <span>Precio: ${sparePart.price}</span>
            <span>Stock: {sparePart.stock}</span>
          </div>
        </CardDescription>
        
        {/* Botón de eliminar en la esquina inferior derecha */}
        <div className="absolute bottom-2 right-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                onClick={(e) => e.stopPropagation()} // Evitar que se abra el modal de edición
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogDescription>
                  Esta acción eliminará el repuesto "{sparePart.name}". Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button 
                    variant="destructive"
                    onClick={async (e) => {
                      // Evitar que el evento se propague y abra el modal de edición
                      e.preventDefault();
                      e.stopPropagation();
                      
                      try {
                        // Preparar datos para el soft delete (cambiar estado a INACTIVE)
                        const deleteData = {
                          ...sparePart,
                          status: "INACTIVE"
                        };
                        
                        // Llamar directamente al servicio de actualización
                        const response = await updateSparePart(deleteData);
                        
                        if (response && (response.type === 'SUCCESS' || response.result)) {
                          toast.success("Repuesto eliminado correctamente");
                          // Recargar la página para ver los cambios
                          window.location.reload();
                          return false; // Evitar comportamiento por defecto
                        } else {
                          throw new Error(response?.text || 'No se recibió una respuesta válida del servidor');
                        }
                      } catch (error) {
                        console.error('Error al eliminar repuesto:', error);
                        toast.error("Error al eliminar el repuesto: " + (error.message || "Error desconocido"));
                      }
                      
                      return false; // Evitar comportamiento por defecto
                    }}
                  >
                    Eliminar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

const SparePartDetailDialog = ({ isOpen, onClose, sparePartId, onSave }) => {
  const [sparePart, setSparePart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: 0,
    externalId: "",
    name: "",
    code: "",
    description: "",
    price: 0,
    stock: 0,
    material: "",
    variant: 0,
    status: "ACTIVE",
    sparePartMultimediaDto: []
  });
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [compatibilityNotes, setCompatibilityNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sparePartToDelete, setSparePartToDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Siempre cargar productos cuando se abre el diálogo
      fetchProducts();
      
      if (sparePartId) {
        fetchSparePartDetails();
      } else {
        setIsLoading(false);
        setFormData({
          id: 0,
          externalId: "",
          name: "",
          code: "",
          description: "",
          price: 0,
          stock: 0,
          material: "",
          variant: 0,
          status: "ACTIVE"
        });
      }
    }
  }, [isOpen, sparePartId]);

  const fetchSparePartDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Obteniendo detalles del repuesto con ID:', sparePartId);
      
      // Verificar que sparePartId tenga un valor válido
      if (!sparePartId) {
        console.error('ID de repuesto no válido:', sparePartId);
        toast.error('ID de repuesto no válido');
        return;
      }
      
      const response = await getSparePartById(sparePartId);
      console.log('Respuesta completa del servidor:', response);
      
      // Extraer los datos del repuesto de la respuesta
      // La respuesta puede estar en response.data, response.result o response.result.data
      let sparePartData = null;
      
      // Primero intentamos obtener los datos de response.result.data
      if (response?.result?.data) {
        sparePartData = response.result.data;
      } 
      // Luego de response.data.data
      else if (response?.data?.data) {
        sparePartData = response.data.data;
      } 
      // Luego de response.result
      else if (response?.result) {
        sparePartData = response.result;
      } 
      // Finalmente de response.data
      else if (response?.data) {
        sparePartData = response.data;
      }
      
      if (!sparePartData || Object.keys(sparePartData).length === 0) {
        console.error('No se encontraron datos del repuesto en la respuesta:', response);
        toast.error('No se pudieron cargar los datos del repuesto');
        return;
      }
      
      console.log('Detalles del repuesto obtenidos:', sparePartData);
      
      // Crear un objeto con los datos actualizados del formulario
      const updatedFormData = {
        id: sparePartData.id || sparePartData.id === 0 ? sparePartData.id : 0,
        externalId: sparePartData.externalId || "",
        name: sparePartData.name || "",
        code: sparePartData.code || "",
        description: sparePartData.description || "",
        price: sparePartData.price || 0,
        stock: sparePartData.stock || 0,
        material: sparePartData.material || "",
        variant: sparePartData.variant || 0,
        status: sparePartData.status || "ACTIVE"
      };
      
      console.log('Datos del formulario actualizados:', updatedFormData);
      
      // Actualizar el estado
      setSparePart(sparePartData);
      setFormData(prevState => ({
        ...prevState,  // Mantener el estado anterior
        ...updatedFormData  // Sobrescribir con los nuevos valores
      }));

      // Intentar cargar imágenes solo si hay un ID válido
      if (sparePartData.id) {
        try {
          const imagesResponse = await getSparePartImages(sparePartData.id);
          console.log('Imágenes del repuesto:', imagesResponse);
          if (imagesResponse && Array.isArray(imagesResponse)) {
            setUploadedImages(imagesResponse);
          }
        } catch (imageError) {
          console.error('Error al cargar las imágenes del repuesto:', imageError);
          // No mostramos error al usuario si falla la carga de imágenes
          setUploadedImages([]);
        }
      }

      // Verificar si hay productos asociados
      if (sparePartData.productSparePartDto) {
        const productId = sparePartData.productSparePartDto.productId?.toString() || "";
        const notes = sparePartData.productSparePartDto.compatibilityNotes || "";
        
        console.log('Producto asociado encontrado:', { productId, notes });
        setSelectedProductId(productId);
        setCompatibilityNotes(notes);
      } else {
        console.log('No se encontró ningún producto asociado');
        setSelectedProductId("");
        setCompatibilityNotes("");
      }

      // Verificar si hay imágenes en la respuesta principal
      if (sparePartData.sparePartMultimediaDto && Array.isArray(sparePartData.sparePartMultimediaDto) && sparePartData.sparePartMultimediaDto.length > 0) {
        // Si hay imágenes en la respuesta principal, usarlas
        const imageUrls = sparePartData.sparePartMultimediaDto.map(item => ({
          url: item.multimedia?.url || '',
          id: item.multimedia?.id || 0,
          name: item.multimedia?.name || 'Imagen',
          displayOrder: item.displayOrder || 0
        }));
        setUploadedImages(imageUrls);
        console.log('Imágenes encontradas en la respuesta principal:', imageUrls);
      } else {
        // Si no hay imágenes en la respuesta principal, intentar obtenerlas por separado
        console.log('No se encontraron imágenes en la respuesta principal, intentando obtenerlas por separado...');
        try {
          const imagesData = await getSparePartImages(sparePartId);
          if (imagesData && imagesData.length > 0) {
            const imageUrls = imagesData.map(item => ({
              url: item.url || item.multimedia?.url || '',
              id: item.id || item.multimediaId || item.multimedia?.id || null,
              displayOrder: item.displayOrder || 0
            }));
            setUploadedImages(imageUrls);
            console.log('Imágenes obtenidas por separado:', imageUrls);
          } else {
            console.log('No se encontraron imágenes asociadas al repuesto');
            setUploadedImages([]);
          }
        } catch (imageError) {
          console.error('Error al obtener imágenes del repuesto:', imageError);
          setUploadedImages([]);
        }
      }
    } catch (error) {
      console.error('Error al cargar detalles del repuesto:', error);
      toast.error("Error al cargar los detalles del repuesto: " + (error.message || "Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Usar getAllProducts en lugar de getProductPreviews para obtener datos más completos
      const response = await getAllProducts();
      console.log('Respuesta completa de productos:', response);
      
      // Extraer datos de la respuesta, manejando diferentes formatos posibles
      let data = [];
      if (response && response.result && Array.isArray(response.result)) {
        data = response.result;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === 'object') {
        // Intentar extraer datos de otras propiedades si existen
        data = response.data || response.items || [];
      }
      
      console.log('Datos de productos extraídos:', data);
      
      // Filtrar productos nulos o indefinidos
      const validProducts = data.filter(product => product && product.id);
      
      // Ordenar productos por nombre para facilitar la búsqueda
      const sortedProducts = [...validProducts].sort((a, b) => {
        return (a.name || '').localeCompare(b.name || '') || 0;
      });
      
      console.log('Productos procesados y ordenados:', sortedProducts);
      setProducts(sortedProducts);
      
      // Si no hay productos, mostrar un mensaje
      if (sortedProducts.length === 0) {
        console.warn('No se encontraron productos válidos en la respuesta');
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      toast.error("Error al cargar los productos: " + (error.message || "Error desconocido"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Manejo especial para campos numéricos
    if (type === "number") {
      // Si el campo está vacío o es solo un cero, permitir que sea vacío o cero
      if (value === "" || value === "0") {
        setFormData({
          ...formData,
          [name]: value === "" ? "" : 0
        });
      } else {
        // Convertir a número para otros valores
        const numValue = name === "price" ? parseFloat(value) : parseInt(value, 10);
        setFormData({
          ...formData,
          [name]: numValue
        });
      }
    } else {
      // Manejo normal para campos de texto
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    try {
      setIsUploading(true);
      console.log('Subiendo imagen:', selectedImage.name);
      
      // Crear un FormData
      const formData = new FormData();
      formData.append('files', selectedImage); // Usar 'files' como nombre del campo
      
      // Hacer la petición al endpoint correcto
      const response = await apiClient.post(
        "/l/media/upload",  // Endpoint corregido
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Respuesta de subida de imagen:', response.data);
      
      // Extraer la URL de la respuesta
      let imageUrl = '';
      let imageId = 0;
      
      // Manejar la respuesta según la estructura esperada
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Estructura: { data: [{ url: '...', id: 1, ... }] }
        imageUrl = response.data[0].url;
        imageId = response.data[0].id || 0;
      } else if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        // Estructura: { data: { data: [{ url: '...', id: 1, ... }] } }
        imageUrl = response.data.data[0].url;
        imageId = response.data.data[0].id || 0;
      } else if (response.data?.url) {
        // Estructura: { url: '...', id: 1, ... }
        imageUrl = response.data.url;
        imageId = response.data.id || 0;
      }
      
      if (!imageUrl) {
        console.error('No se pudo extraer la URL de la imagen de la respuesta:', response.data);
        throw new Error('No se pudo obtener la URL de la imagen subida');
      }
      
      // Crear objeto de imagen con la estructura esperada
      const newImage = {
        id: imageId,
        url: imageUrl,
        previewUrl: URL.createObjectURL(selectedImage),
        fileType: 'IMAGE',
        entityType: 'SPARE_PART',
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
  };

  const handleRemoveImage = async (imageId) => {
    try {
      // Confirmar con el usuario antes de eliminar
      if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
        // Si la imagen ya está guardada en el servidor, eliminarla
        if (imageId && sparePartId) {
          await deleteSparePartMedia(imageId);
          toast.success("Imagen eliminada correctamente");
        }
        
        // Actualizar el estado local
        const updatedImages = uploadedImages.filter(img => img.id !== imageId);
        setUploadedImages(updatedImages);
        
        // Actualizar el formData sin la imagen eliminada
        setFormData(prev => ({
          ...prev,
          media: updatedImages.map((img, index) => ({
            id: img.id,
            url: img.url,
            fileType: img.fileType || 'IMAGE',
            entityType: 'SPARE_PART',
            displayOrder: index
          }))
        }));
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast.error("Error al eliminar la imagen: " + (error.message || "Error desconocido"));
    }
  };

  const handleDelete = (sparePart, e) => {
    if (e) e.stopPropagation(); // Evitar que se abra el modal de edición
    setSparePartToDelete(sparePart);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Preparar datos para el soft delete (cambiar estado a INACTIVE)
      const deleteData = {
        ...sparePartToDelete,
        status: "INACTIVE"
      };

      // Llamar directamente al servicio de actualización
      const response = await updateSparePart(deleteData);
      
      if (response && (response.type === 'SUCCESS' || response.result)) {
        toast.success("Repuesto eliminado correctamente");
        await fetchSpareParts();
      } else {
        throw new Error(response?.text || 'No se recibió una respuesta válida del servidor');
      }
    } catch (error) {
      console.error('Error al eliminar repuesto:', error);
      toast.error("Error al eliminar el repuesto: " + (error.message || "Error desconocido"));
    } finally {
      setIsDeleteDialogOpen(false);
      setSparePartToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Iniciando guardado de repuesto...');
      
      // Preparar datos básicos del repuesto según la estructura esperada por el backend
      const saveData = {
        ...formData,
        // Asegurar que el estado siempre sea ACTIVE al crear o actualizar
        status: "ACTIVE",
        // Inicializar el array de medios vacío
        media: []
      };
      
      // Asegurarse de que el ID esté presente si estamos actualizando
      if (sparePartId) {
        saveData.id = sparePartId;
      }
      
      console.log('Datos básicos del repuesto:', saveData);

      // Preparar información de asignación a producto si existe
      let productAssignment = null;
      if (selectedProductId && selectedProductId !== "none") {
        productAssignment = {
          productId: parseInt(selectedProductId, 10),
          compatibilityNotes
        };
        
        // Si estamos editando y ya existe un ID para la relación
        if (sparePart?.productSparePartDto?.id) {
          productAssignment.id = sparePart.productSparePartDto.id;
        }
        
        console.log('Asignación a producto:', productAssignment);
      }
      
      // Preparar las imágenes para guardar (eliminar campos de previsualización)
      const cleanedImages = uploadedImages.map((img, index) => ({
        id: img.id,
        url: img.url,
        fileType: img.fileType || 'IMAGE',
        entityType: 'SPARE_PART',
        displayOrder: index
      }));
      
      console.log('Imágenes preparadas para guardar:', cleanedImages);
      
      let success = false;
      let response;
      
      // Usar las nuevas funciones mejoradas según sea creación o actualización
      if (sparePartId) {
        console.log('Actualizando repuesto existente con ID:', sparePartId);
        
        // Asegurarnos de que el ID esté en el objeto saveData
        saveData.id = sparePartId;
        
        // Preparar las imágenes en el formato esperado por el backend
        saveData.media = cleanedImages.map((img, index) => ({
          id: img.id ? parseInt(img.id, 10) : 0,  // Asegurar que el ID sea un número
          url: img.url,
          fileType: 'IMAGE',
          entityId: parseInt(sparePartId, 10),  // Asegurar que sea un número
          entityType: 'SPARE_PART',
          displayOrder: index,
          status: 'ACTIVE'  // Asegurar que el estado esté incluido
        }));
        
        // Si hay asignación a producto, agregarla al payload
        if (productAssignment) {
          saveData.productSparePartDto = {
            id: productAssignment.id ? parseInt(productAssignment.id, 10) : 0,
            productId: parseInt(productAssignment.productId, 10),
            compatibilityNotes: productAssignment.compatibilityNotes || ''
          };
        }
        
        console.log('Datos completos para actualizar:', JSON.stringify(saveData, null, 2));
        
        // Llamar directamente a updateSparePart en lugar de updateSparePartWithImages
        // ya que ya hemos preparado los datos de las imágenes
        response = await updateSparePart(saveData);
        
        console.log('Respuesta de actualización:', response);
      } else {
        console.log('Creando nuevo repuesto');
        
        // Crear nuevo repuesto con imágenes
        if (cleanedImages.length > 0) {
          saveData.media = cleanedImages;
        }
        
        // Si hay asignación a producto, agregarla al payload
        if (productAssignment) {
          saveData.productSparePartDto = productAssignment;
        }
        
        console.log('Datos completos para crear:', JSON.stringify(saveData, null, 2));
        
        // Usar la función createSparePartWithImages para manejar correctamente las imágenes
        const onProgress = (index, progress, fileName) => {
          console.log(`Subiendo imagen ${index + 1}: ${fileName} - ${progress}%`);
        };
        
        // En este caso, todas las imágenes ya están subidas, así que no necesitamos pasar nuevos archivos
        response = await createSparePartWithImages(
          saveData,
          [], // No hay nuevos archivos para subir
          productAssignment,
          onProgress
        );
        
        console.log('Respuesta de creación:', response);
      }
      
      // Verificar si la respuesta fue exitosa
      success = response && (response.type === 'SUCCESS' || response.result);
      console.log('Operación exitosa:', success);
      
      // Solo cerrar el diálogo si el guardado fue exitoso
      if (success) {
        toast.success(sparePartId ? "Repuesto actualizado correctamente" : "Repuesto creado correctamente");
        
        // Refrescar la lista de repuestos antes de cerrar el diálogo
        if (typeof onSave === 'function') {
          await onSave(saveData);
        }
        
        onClose();
        return true;
      } else {
        throw new Error("No se recibió una respuesta válida del servidor");
      }
    } catch (error) {
      console.error('Error al guardar repuesto:', error);
      toast.error(
        "Error al " + 
        (sparePartId ? "actualizar" : "crear") + 
        " el repuesto: " + 
        (error.message || "Error desconocido")
      );
      return false;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="sticky top-0 z-10 pb-2 border-b">
          <DialogTitle>{sparePartId ? "Editar Repuesto" : "Nuevo Repuesto"}</DialogTitle>
          <DialogDescription>
            {sparePartId ? "Modifica los detalles del repuesto seleccionado." : "Completa los datos para crear un nuevo repuesto."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="externalId">ID Externo</Label>
              <Input
                id="externalId"
                name="externalId"
                value={formData.externalId}
                onChange={handleInputChange}
                placeholder="ID Externo"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Código del repuesto"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre del repuesto"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción detallada del repuesto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                onFocus={(e) => {
                  // Si el valor es 0, seleccionar todo el texto para facilitar su reemplazo
                  if (e.target.value === "0" || e.target.value === 0) {
                    e.target.select();
                  }
                }}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1"
                onFocus={(e) => {
                  // Si el valor es 0, seleccionar todo el texto para facilitar su reemplazo
                  if (e.target.value === "0" || e.target.value === 0) {
                    e.target.select();
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                placeholder="Material del repuesto"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="variant">Variante</Label>
              <Input
                id="variant"
                name="variant"
                type="number"
                value={formData.variant}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* El estado se maneja automáticamente, no se muestra en la interfaz */}

          <div className="flex flex-col space-y-4 mt-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Imágenes</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Previsualización de imágenes subidas */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative w-20 h-20 bg-gray-100 rounded border overflow-hidden flex items-center justify-center">
                        <img 
                          src={image.previewUrl || `https://libamaq.com/api/multimedia/${image.id}`}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Evitar bucle infinito estableciendo una bandera
                            if (!e.target.hasAttribute('data-error')) {
                              e.target.setAttribute('data-error', 'true');
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = `
                                <div class="flex flex-col items-center justify-center w-full h-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-400">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Selector de archivo */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm"
                >
                  Seleccionar imagen
                </label>
                {selectedImage && (
                  <div className="flex-1 truncate text-sm text-gray-500">
                    {selectedImage.name}
                  </div>
                )}
                <Button 
                  onClick={handleImageUpload} 
                  disabled={!selectedImage || isUploading}
                  size="sm"
                  variant={selectedImage ? "default" : "outline"}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-1">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Subiendo...
                    </span>
                  ) : (
                    "Subir"
                  )}
                </Button>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-4">Compatibilidad con Productos</h3>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="productId">Producto Compatible</Label>
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger id="productId" className="h-10">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-white border-b z-10">
                    <input
                      className="w-full px-3 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Buscar producto..."
                      onChange={(e) => {
                        // Implementar búsqueda en tiempo real aquí si es necesario
                        // Por ahora, la lista está ordenada alfabéticamente
                      }}
                    />
                  </div>
                  <SelectItem value="none" className="font-medium text-gray-500">-- Ninguno --</SelectItem>
                  <div className="pt-1">
                    {products.length === 0 ? (
                      <div className="py-2 px-2 text-sm text-gray-500 italic">Cargando productos...</div>
                    ) : (
                      products.map((product) => (
                        <SelectItem 
                          key={product.id} 
                          value={product.id.toString()}
                          className="py-2 flex items-center gap-2"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-gray-500">
                              ID: {product.externalId || product.id}
                              {product.brand?.name && ` | Marca: ${product.brand.name}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {selectedProductId && selectedProductId !== "none" && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="compatibilityNotes">Notas de Compatibilidad</Label>
                <Textarea
                  id="compatibilityNotes"
                  value={compatibilityNotes}
                  onChange={(e) => setCompatibilityNotes(e.target.value)}
                  placeholder="Detalles sobre la compatibilidad con el producto seleccionado"
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white z-10 pt-2 border-t mt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {sparePartId ? "Guardar Cambios" : "Crear Repuesto"}
            </Button>
          </div>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el repuesto "{sparePartToDelete?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export function SparePartsView() {
  const navigate = useNavigate();
  const [spareParts, setSpareParts] = useState([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSparePartId, setSelectedSparePartId] = useState(null);

  useEffect(() => {
    fetchSpareParts();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      const filtered = spareParts.filter(
        (part) =>
          part.name.toLowerCase().includes(lower) ||
          part.code.toLowerCase().includes(lower) ||
          part.externalId.toLowerCase().includes(lower)
      );
      setFilteredSpareParts(filtered);
    } else {
      setFilteredSpareParts(spareParts);
    }
  }, [spareParts, searchTerm]);

  const fetchSpareParts = async () => {
    try {
      setIsLoading(true);
      console.log(`Obteniendo repuestos: página ${currentPage}, tamaño ${pageSize}`);
      const response = await getAllSpareParts(currentPage, pageSize);
      console.log('Respuesta completa de repuestos:', response);
      
      // Extraer los datos de la respuesta, manejando el formato de paginación
      let data = [];
      let totalPagesCount = 1;
      
      // Verificar todos los posibles lugares donde podrían estar los datos
      if (response.data && Array.isArray(response.data)) {
        // Los datos están directamente en response.data (formato de la API actual)
        data = response.data;
        console.log('Datos extraídos de response.data:', data);
        totalPagesCount = response.totalPages || 1;
      } else if (response.content && Array.isArray(response.content)) {
        // Los datos están en response.content (formato alternativo)
        data = response.content;
        console.log('Datos extraídos de response.content:', data);
        totalPagesCount = response.totalPages || 1;
      } else if (response && response.result) {
        // Formato de respuesta con result
        if (response.result.content && Array.isArray(response.result.content)) {
          data = response.result.content;
          console.log('Datos extraídos de response.result.content:', data);
          totalPagesCount = response.result.totalPages || 1;
        } else if (Array.isArray(response.result)) {
          data = response.result;
          console.log('Datos extraídos de response.result (array):', data);
        }
      } else if (Array.isArray(response)) {
        data = response;
        console.log('Datos extraídos directamente del array de respuesta:', data);
      }
      
      console.log(`Se encontraron ${data.length} repuestos. Total de páginas: ${totalPagesCount}`);
      setTotalPages(totalPagesCount);
      
      setSpareParts(data);
      setFilteredSpareParts(data);
    } catch (error) {
      console.error('Error al cargar repuestos:', error);
      toast.error("Error al cargar los repuestos: " + (error.message || "Error desconocido"));
      setSpareParts([]);
      setFilteredSpareParts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (sparePart) => {
    setSelectedSparePartId(sparePart.id);
    setIsDetailDialogOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedSparePartId(null);
    setIsDetailDialogOpen(true);
  };

  const handleSaveSparePart = async (sparePartData) => {
    try {
      console.log('Datos del repuesto a guardar:', JSON.stringify(sparePartData, null, 2));
      
      // Verificar que los datos de multimedia estén correctamente formateados
      if (sparePartData.sparePartMultimediaDto && sparePartData.sparePartMultimediaDto.length > 0) {
        console.log('Imágenes a guardar:', sparePartData.sparePartMultimediaDto);
      }
      
      let response;
      if (sparePartData.id) {
        // Actualizar repuesto existente
        response = await updateSparePart(sparePartData);
        console.log('Respuesta de actualización:', response);
      } else {
        // Crear nuevo repuesto
        response = await createSparePart(sparePartData);
        console.log('Respuesta de creación:', response);
      }
      
      // Verificar si la respuesta fue exitosa
      if (response && (response.type === 'SUCCESS' || response.result)) {
        // Refrescar la lista después de guardar
        await fetchSpareParts();
        
        toast.success(
          sparePartData.id 
            ? "Repuesto actualizado correctamente" 
            : "Repuesto creado correctamente"
        );
        
        return true; // Indicar éxito para que el diálogo pueda cerrarse
      } else {
        throw new Error(response?.text || 'No se recibió una respuesta válida del servidor');
      }
    } catch (error) {
      console.error('Error al guardar repuesto:', error);
      toast.error(
        "Error al " + 
        (sparePartData.id ? "actualizar" : "crear") + 
        " el repuesto: " + 
        (error.message || "Error desconocido")
      );
      return false; // Indicar fallo
    }
  };

  if (isLoading && spareParts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Controles de filtro y búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Barra de búsqueda */}
          <div className="w-full sm:flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, código o ID externo..."
              className="w-full md:w-[20em] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Botón de agregar repuesto */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleCreateNew}
            className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            + Agregar repuesto
          </button>
        </div>
      </div>

      {/* Grid de repuestos */}
      {filteredSpareParts.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSpareParts.map((sparePart) => (
            <motion.div
              key={sparePart.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SparePartCard
                sparePart={sparePart}
                onClick={() => handleCardClick(sparePart)} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No se encontraron repuestos</p>
          <Button onClick={handleCreateNew}>
            Crear nuevo repuesto
          </Button>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center px-4">
              Página {currentPage} de {totalPages}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de detalle/edición */}
      <SparePartDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        sparePartId={selectedSparePartId}
        onSave={handleSaveSparePart}
      />
    </>
  );
}
