import React, { useState, useEffect, useRef, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FileVideo2,
  Trash2,
  Edit,
  Loader2,
  SquareMousePointer,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import "../../../index.css";
import TikTokEmbed from "./../../../components/ui/TikTokEmbed";
import { uploadLandingFile, deleteLandingFile } from "@/services/admin/landingService";

// Importar los hooks personalizados de Tanstack Query
import {
  useActiveLandings,
  useCreateLanding,
  useUpdateLanding,
  useChangeLandingStatus,
  useDeleteLanding,
  useUploadLandingFile,
  useLandingWithFile
} from "../../../hooks/useLandings";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MobileDialog, MobileDialogTrigger, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogDescription, MobileDialogFooter } from "@/components/ui/mobile-dialog";

// Funciones auxiliares para detectar y formatear URLs de video
const isYouTubeUrl = (url) => {
  if (!url) return false;
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/.test(url);
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return url;
};

const isVimeoUrl = (url) => {
  if (!url) return false;
  return /vimeo\.com\/(?:.*#|\/)?([0-9]+)/.test(url);
};

const getVimeoEmbedUrl = (url) => {
  if (!url) return '';
  const match = url.match(/vimeo\.com\/(?:.*#|\/)?([0-9]+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
};

// Componente para renderizar videos de diferentes fuentes
const VideoPlayer = ({ url, title = "Video", className = "" }) => {
  if (!url) return <div className="bg-gray-200 rounded-md flex items-center justify-center h-full"><FileVideo2 className="h-12 w-12 text-gray-400" /></div>;

  if (isYouTubeUrl(url)) {
    return (
      <div className={`relative ${className}`} style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-md"
          src={getYouTubeEmbedUrl(url)}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  } else if (isVimeoUrl(url)) {
    return (
      <div className={`relative ${className}`} style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-md"
          src={getVimeoEmbedUrl(url)}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  } else {
    return (
      <video
        controls
        className={`w-full h-full object-cover rounded-md ${className}`}
        playsInline
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        <p>Tu navegador no soporta video HTML5. <a href={url} target="_blank" rel="noopener noreferrer">Descargar video</a></p>
      </video>
    );
  }
};

export function ContentView() {
  // Usar hooks de Tanstack Query para landings con manejo de errores
  const {
    data: landingsData,
    isLoading: loadingLandings,
    error: landingsError,
    refetch: refetchLandings
  } = useActiveLandings() || { data: null, isLoading: false, error: null, refetch: () => { } };

  // Función para determinar si una URL es de TikTok
  const isTikTokUrl = (url) => {
    if (!url) return false;
    return url.includes('tiktok.com');
  };

  // Función para determinar si una URL es de una imagen
  const isImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // Función para determinar si una URL es de un video
  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) ||
      url.includes('youtube.com') || url.includes('youtu.be') ||
      url.includes('vimeo.com');
  };

  // Extraer todos los landings disponibles
  const allLandingItems = React.useMemo(() => {
    if (!landingsData) return [];

    let items = [];

    // Manejar diferentes estructuras de respuesta posibles
    if (Array.isArray(landingsData)) {
      items = landingsData;
    } else if (landingsData.data && Array.isArray(landingsData.data)) {
      items = landingsData.data;
    } else if (landingsData.result) {
      if (Array.isArray(landingsData.result)) {
        items = landingsData.result;
      } else if (landingsData.result) {
        items = [landingsData.result];
      }
    }

    return items;
  }, [landingsData]);

  // Filtrar por tipo de contenido según la URL
  const landings = React.useMemo(() => {
    return allLandingItems.filter(item => isTikTokUrl(item.url));
  }, [allLandingItems]);

  // Hooks para mutaciones
  const createLandingMutation = useCreateLanding();
  const updateLandingMutation = useUpdateLanding();
  const changeLandingStatusMutation = useChangeLandingStatus();
  const deleteLandingMutation = useDeleteLanding();
  const uploadFileMutation = useUploadLandingFile();
  const { createLandingWithFile, updateLandingWithFile } = useLandingWithFile();

  // Estados para el formulario de creación/edición
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [contentType, setContentType] = useState("PROMOTION"); // Tipo de contenido (PROMOTION, EVENT, NEWS, PRODUCT_LAUNCH)
  const [currentLandingId, setCurrentLandingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados para imágenes
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingImage, setSubmittingImage] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const imageFileInputRef = useRef(null);

  // Estados para el formulario de video
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submittingVideo, setSubmittingVideo] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const videoFileInputRef = useRef(null);

  // Ya no necesitamos estados para diálogo de confirmación

  // Estados para videos
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Estado para el diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Convierte un link de TikTok en su URL de embed
  const getEmbedUrl = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? `https://www.tiktok.com/embed/${match[1]}` : "";
  };

  // No necesitamos useEffect para cargar datos iniciales
  // Tanstack Query maneja la carga automáticamente
  // Solo necesitamos cargar imágenes y videos
  // useEffect(() => {
  //   loadImages();
  //   loadVideos();
  // }, []);

  // Ya no necesitamos esta función porque usamos Tanstack Query
  // La refactorizamos para usar refetchLandings cuando sea necesario
  const loadLandings = () => {
    refetchLandings();
  };

  // Función para recargar todos los datos usando Tanstack Query
  const loadAllContent = () => {
    // Utilizar refetchLandings de Tanstack Query
    refetchLandings();

    // También recargar imágenes y videos
    loadImages();
    loadVideos();

    console.log('Recargando todos los datos con Tanstack Query');
  };

  // Actualizar imágenes y videos cuando cambian los landings
  useEffect(() => {
    if (allLandingItems && allLandingItems.length > 0) {
      // Cargar imágenes y videos cuando cambian los landings
      loadImages();
      loadVideos();
      console.log('Landings actualizados, recargando imágenes y videos');
    }
  }, [allLandingItems]);

  // Función para crear un nuevo landing usando Tanstack Query
  const handleCreateLanding = async () => {
    if (!link || !title) {
      toast.error("El título y el link son obligatorios");
      return;
    }

    // Validar que el link sea una URL válida
    try {
      new URL(link); // Esto lanzará un error si no es una URL válida
    } catch (e) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }

    setSubmitting(true);
    try {
      // Usar los campos requeridos con el tipo seleccionado por el usuario
      // Según la documentación de Swagger: title, description, type, status, url
      // Valores permitidos para type: 'PROMOTION', 'EVENT', 'NEWS', 'PRODUCT_LAUNCH'
      const landingData = {
        title: title.trim(),
        description: description ? description.trim() : "",
        type: contentType, // Usar el tipo seleccionado por el usuario
        status: "ACTIVE",
        url: link // El servicio se encargará de limpiar la URL
      };

      console.log("Enviando datos:", landingData);

      if (isEditing && currentLandingId) {
        // Actualizar landing existente usando la mutación
        await updateLandingMutation.mutateAsync({ ...landingData, id: currentLandingId });
        toast.success("TikTok actualizado correctamente");
      } else {
        // Crear nuevo landing usando la mutación
        const result = await createLandingMutation.mutateAsync(landingData);
        console.log("Resultado de la creación:", result);
        toast.success("TikTok creado correctamente");
      }

      // Resetear formulario (no necesitamos recargar manualmente)
      resetForm();
    } catch (err) {
      console.error("Error al guardar landing:", err);
      let errorMessage = err.message || 'Error desconocido';

      // Mostrar un mensaje más amigable para el error SQL
      if (errorMessage === 'UNHANDLED_SQL_ERROR') {
        errorMessage = 'Error en la base de datos. Verifica que los datos sean correctos y no haya duplicados.';
      }

      toast.error(`Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'} el TikTok: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Función para eliminar un landing (cambiando su estado a INACTIVE) usando Tanstack Query
  const handleDeleteLanding = async (landingId) => {
  if (!window.confirm("¿Estás seguro que deseas eliminar este TikTok?")) return;

  try {
    // 1) Encuentra el landing en tu estado local
    const landingToDelete = landings.find((l) => l.id === landingId);
    if (!landingToDelete) {
      throw new Error(`No se encontró el TikTok con ID ${landingId}`);
    }

    // 2) Asegúrate de que 'type' sea válido. Si no lo es, elige un fallback (p.ej. "PROMOTION").
    const originalType = landingToDelete.type;
    const allowedTypes = ["PROMOTION", "EVENT", "NEWS", "PRODUCT_LAUNCH"];
    const validType = allowedTypes.includes(originalType)
      ? originalType
      : "PROMOTION";

    // 3) Construye el payload con ID numérico y type válido
    const payload = {
      id: Number(landingToDelete.id),      // <-- convertir a número
      title: landingToDelete.title,
      description: landingToDelete.description || "",
      url: landingToDelete.url,
      type: validType,                     // <-- uno de los cuatro permitidos
      status: "INACTIVE",
    };

    console.log("⏳ Payload para PUT /l/landing (TikTok):", payload);

    // 4) Llama a la mutación
    await changeLandingStatusMutation.mutateAsync(payload);

    toast.success("TikTok eliminado correctamente");
    // Tanstack Query refetchea automáticamente, pero si necesitas, puedes llamar refetchLandings()
    refetchLandings();
  } catch (err) {
    console.error(`Error al eliminar TikTok con ID ${landingId}:`, err);

    // Mostrar mensaje de error más específico si viene del backend
    if (err.response && err.response.data) {
      console.error("❌ Detalle del error del backend:", err.response.data);
      const messages = err.response.data.message;
      if (Array.isArray(messages) && messages.length) {
        toast.error(`Error: ${messages[0]}`);
      } else {
        toast.error(`Error: ${err.response.data.error || "Bad Request"}`);
      }
    } else {
      toast.error(`Ocurrió un error: ${err.message}`);
    }
  }
};


  // Función para editar un landing (abre el diálogo de edición)
  const handleEditLanding = (landing) => {
    setTitle(landing.title);
    setDescription(landing.description || "");
    setLink(landing.url);
    setCurrentLandingId(landing.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Función para actualizar directamente sin diálogo de confirmación
  const updateContent = (item, type) => {
    try {
      // Preparar los datos para la actualización
      const updatedData = {
        id: item.id,
        title: item.title,
        description: item.description || "",
        url: item.url,
        type: item.type || type,
        status: item.status || "ACTIVE" // Añadir el campo status requerido por la API
      };

      console.log("Enviando datos actualizados:", updatedData);

      // Llamar a la mutación de actualización existente
      updateLandingMutation.mutate(updatedData, {
        onSuccess: () => {
          console.log("Actualización exitosa");

          // Forzar la recarga de todos los datos para asegurar que la UI se actualice
          // Esto es importante especialmente para los TikToks
          refetchLandings();

          // También recargar los datos específicos según el tipo
          if (type === "TIKTOK") {
            // Para TikToks, ya llamamos a refetchLandings arriba
            // Cerrar el diálogo de edición si está abierto
            setIsDialogOpen(false);
          } else if (type === "IMAGE") {
            loadImages();
            // Cerrar el diálogo de edición de imágenes si está abierto
            setIsImageDialogOpen(false);
          } else if (type === "VIDEO") {
            loadVideos();
            // Cerrar el diálogo de edición de videos si está abierto
            setIsVideoDialogOpen(false);
          }

          toast.success(`${type === "TIKTOK" ? "TikTok" : type === "IMAGE" ? "Imagen" : "Video"} actualizado correctamente`);
        },
        onError: (error) => {
          console.error(`Error al actualizar ${type}:`, error);
          toast.error(`Error al actualizar: ${error.message || 'Error de conexión'}`);
        }
      });
    } catch (error) {
      console.error(`Error al actualizar ${type}:`, error);
      toast.error(`Error al actualizar: ${error.message || 'Error de conexión'}`);
    }
  };

  // Función para guardar los cambios de edición desde el modal (TikTok)
  const handleSaveEdits = (landing) => {
    updateContent(landing, "TIKTOK");
  };

  // Función para guardar los cambios de edición de imágenes
  const handleSaveImageEdits = (image) => {
    updateContent(image, "IMAGE");
  };

  // Función para guardar los cambios de edición de videos
  const handleSaveVideoEdits = (video) => {
    updateContent(video, "VIDEO");
  };

  // Resetear formulario
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLink("");
    setCurrentLandingId(null);
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  // Resetear formulario de imagen
  const resetImageForm = () => {
    setImageTitle("");
    setImageDescription("");
    setImageUrl("");
    setImageFile(null);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
  };

  // Resetear formulario de video
  const resetVideoForm = () => {
    setVideoTitle("");
    setVideoDescription("");
    setVideoUrl("");
    setVideoFile(null);
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = "";
    }
  };

  // Función para cargar imágenes
  const loadImages = async () => {
    setLoadingImages(true);
    try {
      // Si ya tenemos los datos cargados por Tanstack Query, usamos esos
      if (allLandingItems && allLandingItems.length > 0) {
        // Filtrar por URL en lugar de por tipo
        const imageItems = allLandingItems.filter(item => isImageUrl(item.url));
        setImages(imageItems);
      } else {
        // Si no tenemos datos, hacemos la petición directamente
        const response = await getAllActiveLandings();
        let items = [];

        if (response && response.result) {
          items = Array.isArray(response.result) ? response.result : [response.result];
        } else if (Array.isArray(response)) {
          items = response;
        }

        // Filtrar por URL en lugar de por tipo
        const imageItems = items.filter(item => isImageUrl(item.url));
        setImages(imageItems);
      }
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
    } finally {
      setLoadingImages(false);
    }
  };

  // Función para cargar videos
  const loadVideos = async () => {
    setLoadingVideos(true);
    try {
      // Si ya tenemos los datos cargados por Tanstack Query, usamos esos
      if (allLandingItems && allLandingItems.length > 0) {
        // Filtrar por URL en lugar de por tipo
        const videoItems = allLandingItems.filter(item => isVideoUrl(item.url));
        setVideos(videoItems);
      } else {
        // Si no tenemos datos, hacemos la petición directamente
        const response = await getAllActiveLandings();
        let items = [];

        if (response && response.result) {
          items = Array.isArray(response.result) ? response.result : [response.result];
        } else if (Array.isArray(response)) {
          items = response;
        }

        // Filtrar por URL en lugar de por tipo
        const videoItems = items.filter(item => isVideoUrl(item.url));
        setVideos(videoItems);
      }
    } catch (err) {
      console.error("Error al cargar videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Función para manejar la selección de archivo de imagen
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Crear una URL temporal para previsualización
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

  // Función para subir el archivo de imagen a Cloudflare
  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error("Debes seleccionar una imagen para subir");
      return;
    }

    setUploadingImage(true);
    try {
      // Subir el archivo al servidor
      const uploadResponse = await uploadLandingFile(imageFile);
      console.log("Imagen subida:", uploadResponse);

      // Obtener la URL del archivo subido
      const fileUrl = uploadResponse.url || uploadResponse.result?.url;
      if (!fileUrl) {
        throw new Error("No se recibió una URL válida del servidor");
      }

      // Actualizar el estado con la URL real
      setImageUrl(fileUrl);
      return fileUrl;
    } catch (err) {
      console.error("Error al subir imagen:", err);
      toast.error(`Error al subir la imagen: ${err.message || 'Error de conexión'}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para crear una nueva imagen
  const handleCreateImage = async () => {
    if (!imageTitle) {
      toast.error("El título de la imagen es obligatorio");
      return;
    }

    setSubmittingImage(true);
    try {
      let finalImageUrl = imageUrl;

      // Si hay un archivo seleccionado, subirlo primero
      if (imageFile) {
        finalImageUrl = await handleImageUpload();
        if (!finalImageUrl) return;
      } else if (!imageUrl) {
        toast.error("Debes proporcionar una URL de imagen o subir un archivo");
        return;
      }

      // Preparamos los datos del landing (imagen) según el backend
      const landingData = {
        url: finalImageUrl,
        title: imageTitle,
        description: imageDescription,
        type: contentType, // ej. 'PROMOTION', 'EVENT', etc.
        status: "ACTIVE"
      };

      // Usamos la mutación de Tanstack Query en lugar de 'createLanding':
      const newLanding = await createLandingMutation.mutateAsync(landingData);
      console.log("Nueva imagen creada:", newLanding);

      // Resetear formulario y recargar lista
      resetImageForm();
      loadImages();
      toast.success("Imagen creada correctamente");
    } catch (err) {
      console.error("Error al guardar imagen:", err);
      toast.error(`Ocurrió un error al crear la imagen: ${err.message || 'Error de conexión'}`);
    } finally {
      setSubmittingImage(false);
    }
  };


  // Función para manejar la selección de archivo de video
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      // Crear una URL temporal para previsualización
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
    }
  };

  // Función para subir el archivo de video a Cloudflare
  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert("Debes seleccionar un video para subir");
      return;
    }

    setUploadingVideo(true);
    try {
      // Subir el archivo al servidor
      const uploadResponse = await uploadLandingFile(videoFile);
      console.log("Video subido:", uploadResponse);

      // Obtener la URL del archivo subido
      const fileUrl = uploadResponse.url || uploadResponse.result?.url;
      if (!fileUrl) {
        throw new Error("No se recibió una URL válida del servidor");
      }

      // Actualizar el estado con la URL real
      setVideoUrl(fileUrl);
      return fileUrl;
    } catch (err) {
      console.error("Error al subir video:", err);
      alert(`Error al subir el video: ${err.message || 'Error de conexión'}`);
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  // Función para crear un nuevo video
  const handleCreateVideo = async () => {
    if (!videoTitle) {
      alert("El título del video es obligatorio");
      return;
    }

    setSubmittingVideo(true);
    try {
      let finalVideoUrl = videoUrl;

      // Si hay un archivo seleccionado, subirlo primero
      if (videoFile) {
        finalVideoUrl = await handleVideoUpload();
        if (!finalVideoUrl) return;
      } else if (!videoUrl) {
        alert("Debes proporcionar una URL de video o subir un archivo");
        return;
      }

      // Crear landing con el tipo seleccionado por el usuario
      const landingData = {
        url: finalVideoUrl,
        title: videoTitle,
        description: videoDescription,
        type: contentType, // Usar el tipo seleccionado en el formulario
        status: "ACTIVE"
      };

      // Usar la mutación de Tanstack Query
      const newLanding = await createLandingMutation.mutateAsync(landingData);
      console.log("Nuevo video creado:", newLanding);
      toast.success("Video creado correctamente");
      setIsVideoDialogOpen(false);

      // Resetear formulario y recargar videos
      resetVideoForm();
      loadVideos();
      console.log("Video creado correctamente");
    } catch (err) {
      console.error("Error al guardar video:", err);
      alert(`Ocurrió un error al crear el video: ${err.message || 'Error de conexión'}`);
    } finally {
      setSubmittingVideo(false);
    }
  };

  // Función para eliminar una imagen
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta imagen?")) return;

    try {
      const imageToDelete = images.find((img) => img.id === imageId);
      if (!imageToDelete) {
        throw new Error(`No se encontró la imagen con ID ${imageId}`);
      }

      const originalType = imageToDelete.type;
      const allowedTypes = ["PROMOTION", "EVENT", "NEWS", "PRODUCT_LAUNCH"];
      const validType = allowedTypes.includes(originalType)
        ? originalType
        : "PROMOTION";
      // Construye el payload que vas a enviar:
      const payload = {
        id: Number(imageToDelete.id),
        title: imageToDelete.title,
        description: imageToDelete.description || "",
        url: imageToDelete.url,
        type: validType,
        status: "INACTIVE",
      };

      console.log("⏳ Payload para PUT /l/landing:", payload);
      console.log("⏳ Intentando cambiar estado con este payload:", payload);
      console.log("Tipo que viene del backend para esta imagen:", imageToDelete.type);


      await changeLandingStatusMutation.mutateAsync(payload);

      toast.success("Imagen eliminada correctamente");
      loadImages();
    } catch (err) {
      // Si err.response existe, imprime el cuerpo de la respuesta
      if (err.response && err.response.data) {
        console.error("❌ Error detallado del backend:", err.response.data);
        // Por ejemplo, err.response.data podría tener { message: [...], error: "...", statusCode: 400 }
        const messages = err.response.data.message;
        // Muestra en pantalla el primer mensaje de validación (si existe)
        if (Array.isArray(messages) && messages.length) {
          toast.error(`Error: ${messages[0]}`);
        } else {
          toast.error(`Error: ${err.response.data.error || "Bad Request"}`);
        }
      } else {
        console.error("❌ Error genérico:", err);
        toast.error(`Ocurrió un error: ${err.message}`);
      }
    }
  };


  // Función para eliminar un video
  const handleDeleteVideo = async (videoId) => {
  if (!window.confirm("¿Estás seguro que deseas eliminar este video?")) return;

  try {
    const videoToDelete = videos.find((vid) => vid.id === videoId);
    if (!videoToDelete) {
      throw new Error(`No se encontró el video con ID ${videoId}`);
    }

    // Asegurarnos de que `type` sea uno de los valores válidos:
    const originalType = videoToDelete.type;
    const allowedTypes = ["PROMOTION", "EVENT", "NEWS", "PRODUCT_LAUNCH"];
    const validType = allowedTypes.includes(originalType)
      ? originalType
      : "PROMOTION"; // <- Por ejemplo, si no coincide, forzamos PROMOTION

    // Armar el payload con id numérico
    const payload = {
      id: Number(videoToDelete.id),       // <-- convertir a número
      title: videoToDelete.title,
      description: videoToDelete.description || "",
      url: videoToDelete.url,
      type: validType,                    // <-- uno de los cuatro permitidos
      status: "INACTIVE",
    };

    console.log("⏳ Payload para PUT /l/landing (video):", payload);

    await changeLandingStatusMutation.mutateAsync(payload);

    toast.success("Video eliminado correctamente");
    loadVideos();
  } catch (err) {
    console.error("Error al cambiar estado del landing con ID", videoId, ":", err);
    if (err.response && err.response.data) {
      console.error("❌ Detalle del error del backend:", err.response.data);
      const messages = err.response.data.message;
      if (Array.isArray(messages) && messages.length) {
        toast.error(`Error: ${messages[0]}`);
      } else {
        toast.error(`Error: ${err.response.data.error || "Bad Request"}`);
      }
    } else {
      toast.error(`Ocurrió un error: ${err.message}`);
    }
  }
};


  // Abrir diálogo para nuevo landing
  const openNewLandingDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-gray-100 to-blue-300 rounded-2xl min-h-[100dvh] h-full text-sm md:text-base">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded shadow p-4 bg-white">
        <div >
          <h1 className="text-xl md:text-2xl font-semibold select-none">
            En esta sección se puede agregar contenido multimedia
          </h1>
          <p className="text-sm md:text-base text-gray-700 select-none">
            Da clic en el botón "Agregar contenido" dependiendo cada sección de
            contenido multimedia
          </p>
        </div>

        {/* Añadimos un margen top sólo en móvil para separar del texto */}
        <div className="mt-4 md:mt-0">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm py-1 md:py-2 px-3 md:px-4 rounded-2xl inline-flex items-center"
          >
            <a
              href="https://www.tiktok.com/@libamaqherramientas"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver perfil de TikTok
              <FileVideo2 className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>


      <div className="border border-gray-200 rounded p-4 mt-5 bg-gradient-to-b from-gray-100 to-blue-100 shadow-md flex-1 min-h-[calc(100vh-200px)]">
        <Tabs defaultValue="multimedia">
          <TabsList className="grid grid-cols-3 gap-2 bg-white">
            <TabsTrigger
              className="cursor-pointer
      transition-colors
       hover:bg-blue-100
      data-[state=active]:bg-blue-500 data-[state=active]:text-white "
              value="multimedia"
            >
              Tik toks
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer
      transition-colors
       hover:bg-blue-100
      data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              value="images"
            >
              Imagenes
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer
      transition-colors
       hover:bg-blue-100
      data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              value="facebook"
            >
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multimedia" className="h-full min-h-[calc(100vh-300px)]">
            <Card className="h-full flex flex-col min-h-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-10 gap-5">
                <div className="flex gap-3 items-center">
                  <img src="/logo_Tiktok.png" className="w-12" />
                  <section className="border-b-2 select-none">
                    Recuerda que aquí podrás gestionar tu contenido
                  </section>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-black hover:bg-blue-500 cursor-pointer"
                      onClick={openNewLandingDialog}
                    >
                      Agregar TikTok
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto p-3 md:p-6 md:max-w-[800px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-xl md:text-2xl font-semibold select-none">
                          Contenido
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm select-none">
                          Llena los campos para agregar tu TikTok
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                        {/* IZQUIERDA: campos de entrada */}
                        <div className="flex-1 space-y-3 md:space-y-6">
                          <div className="space-y-1">
                            <Label htmlFor="title">Título</Label>
                            <Input
                              id="title"
                              placeholder="Ej. TikTok sobre herramientas"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                              id="description"
                              placeholder="Breve descripción del TikTok"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="contentType">Tipo de contenido</Label>
                            <select
                              id="contentType"
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={contentType}
                              onChange={(e) => setContentType(e.target.value)}
                            >
                              <option value="PROMOTION">Promoción</option>
                              <option value="EVENT">Evento</option>
                              <option value="NEWS">Noticia</option>
                              <option value="PRODUCT_LAUNCH">Lanzamiento de producto</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="link">Link</Label>
                            <Input
                              id="link"
                              placeholder="https://www.tiktok.com/..."
                              value={link}
                              onChange={(e) => setLink(e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              required
                            />
                          </div>
                        </div>

                        {/* DERECHA: vista previa de TikTok */}
                        <div className="w-full md:w-1/3 mt-4 md:mt-0 max-h-[300px] md:max-h-none overflow-hidden">
                          {link ? (
                            <TikTokEmbed videoUrl={link} aspectRatio="177%" />
                          ) : (
                            <div className="flex items-center justify-center h-full border rounded p-4 text-gray-400 select-none">
                              Vista previa del TikTok
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex space-x-2 mt-2 md:mt-5 p-3 md:p-6">

                        <Button
                          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                          onClick={handleCreateLanding}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : isEditing ? (
                            "Actualizar TikTok"
                          ) : (
                            "Crear TikTok"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogContent>
                </Dialog>
              </div>

              <section className="w-full min-h-[calc(100vh-200px)] pb-4">
                {loadingLandings ? (
                  <div className="flex justify-center items-center ">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                ) : landingsError ? (
                  <div className="text-red-500 text-center p-4">{landingsError.message || 'Error al cargar los TikToks'}</div>
                ) : landings.length === 0 ? (
                  <div className="text-center p-5 text-gray-500">
                    No hay TikToks disponibles. ¡Agrega uno nuevo!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full p-4">
                    {landings.map((landing) => (
                      <div key={landing.id} className="bg-gradient-to-l from-red-500 to-blue-500 p-2 rounded-2xl w-full h-full">
                        <Card className="p-3 md:p-5 relative group h-full flex flex-col min-h-[250px]">
                          <div className="absolute top-2 right-2 flex gap-2 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 shadow-sm cursor-pointer"
                              onClick={() => handleDeleteLanding(landing.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <CardHeader className="flex-1 overflow-hidden">
                            <CardTitle className="text-base md:text-lg font-bold truncate select-none" title={landing.title}>{landing.title}</CardTitle>
                            <CardDescription className="text-xs md:text-sm truncate h-[60px] overflow-hidden select-none" title={landing.description}>
                              {landing.description}
                            </CardDescription>
                          </CardHeader>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="w-8 h-8 cursor-pointer flex justify-center items-center hover:bg-indigo-100 shadow-sm rounded-md">
                                <SquareMousePointer size={20} />


                              </div>
                            </DialogTrigger>

                            <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto p-3 md:p-6 md:max-w-[800px] mx-auto">
                              <Tabs defaultValue="details" className="w-full mt-2">
                                <TabsList className="grid w-[20em] grid-cols-2 gap-2">
                                  <TabsTrigger
                                    value="details"
                                    className="cursor-pointer
                                    transition-colors
                                    hover:underline hover:decoration-blue-200 hover:decoration-3
                                    data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
                                  >
                                    Detalles
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="edit"
                                    className="cursor-pointer
                                    transition-colors
                                    hover:underline hover:decoration-blue-200 hover:decoration-3
                                    data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
                                  >
                                    Editar
                                  </TabsTrigger>
                                </TabsList>

                                {/* Detalles (vista de solo lectura) */}
                                <TabsContent value="details">
                                  <Card className="border-0 m-2">
                                    <CardHeader>
                                      <CardTitle className="text-2xl font-semibold">
                                        Detalles del TikTok
                                      </CardTitle>
                                      <CardDescription>
                                        Información completa del TikTok
                                      </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                                      {/* IZQUIERDA: campos de solo lectura */}
                                      <div className="flex-1 space-y-3 md:space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-title-${landing.id}`}>Título</Label>
                                          <Input
                                            id={`view-title-${landing.id}`}
                                            value={landing.title}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-description-${landing.id}`}>Descripción</Label>
                                          <Input
                                            id={`view-description-${landing.id}`}
                                            value={landing.description}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-url-${landing.id}`}>URL</Label>
                                          <Input
                                            id={`view-url-${landing.id}`}
                                            value={landing.url}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-created-${landing.id}`}>Fecha de creación</Label>
                                          <Input
                                            id={`view-created-${landing.id}`}
                                            value={landing.createdAt ? new Date(landing.createdAt).toLocaleString() : 'N/A'}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de TikTok */}
                                      <div className="w-full md:w-1/3 mt-4 md:mt-0 max-h-[300px] md:max-h-none overflow-hidden">
                                        <TikTokEmbed videoUrl={landing.url} aspectRatio="177%" />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>

                                {/* Editar (formulario de edición) */}
                                <TabsContent value="edit">
                                  <Card className="border-0 m-2">
                                    <CardHeader className="select-none">
                                      <CardTitle className="text-2xl font-semibold">
                                        Editar TikTok
                                      </CardTitle>
                                      <CardDescription>
                                        Modifica los campos para actualizar este TikTok
                                      </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                                      {/* IZQUIERDA: campos de edición */}
                                      <div className="flex-1 space-y-3 md:space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-title-${landing.id}`}>Título</Label>
                                          <Input
                                            id={`edit-title-${landing.id}`}
                                            defaultValue={landing.title}
                                            onChange={(e) => {
                                              // Crear una copia temporal del landing para edición
                                              const updatedLanding = { ...landing };
                                              updatedLanding.title = e.target.value;
                                              // No necesitamos actualizar el estado local aquí
                                              // Solo actualizamos el objeto que vamos a enviar al backend
                                              landing.title = e.target.value;
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-description-${landing.id}`}>Descripción</Label>
                                          <Input
                                            id={`edit-description-${landing.id}`}
                                            defaultValue={landing.description}
                                            onChange={(e) => {
                                              // Actualizar directamente el objeto landing
                                              landing.description = e.target.value;
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-url-${landing.id}`}>URL</Label>
                                          <Input
                                            id={`edit-url-${landing.id}`}
                                            defaultValue={landing.url}
                                            onChange={(e) => {
                                              // Actualizar directamente el objeto landing
                                              landing.url = e.target.value;
                                            }}
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de TikTok */}
                                      <div className="w-full md:w-1/3 mt-4 md:mt-0 max-h-[300px] md:max-h-none overflow-hidden">
                                        <TikTokEmbed videoUrl={landing.url} aspectRatio="177%" />
                                      </div>
                                    </CardContent>

                                    <CardFooter className="flex space-x-2">

                                      <Button
                                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                        onClick={() => handleSaveEdits(landing)}
                                      >
                                        Guardar cambios
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="h-full min-h-[calc(100vh-300px)]">
            <Card className="h-full flex flex-col min-h-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-10 gap-5">
                <div className="flex gap-3 items-center">
                  <ImageIcon className="w-12 h-12" />
                  <section className="border-b-2 select-none">
                    Gestiona tus imágenes destacadas
                  </section>
                </div>

                <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-black hover:bg-blue-500 cursor-pointer"
                    >
                      Agregar Imagen
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto p-3 md:p-6 md:max-w-[800px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader className="select-none">
                        <CardTitle className="text-2xl font-semibold">
                          Contenido
                        </CardTitle>
                        <CardDescription>
                          Llena los campos para agregar tu Imagen
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                        {/* IZQUIERDA: campos de entrada */}
                        <div className="flex-1 space-y-3 md:space-y-6">
                          <div className="space-y-1">
                            <Label htmlFor="image-title">Título</Label>
                            <Input
                              id="image-title"
                              placeholder="Ej. Imagen de producto"
                              value={imageTitle}
                              onChange={(e) => setImageTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="image-description">Descripción</Label>
                            <Input
                              id="image-description"
                              placeholder="Breve descripción de la imagen"
                              value={imageDescription}
                              onChange={(e) => setImageDescription(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="image-contentType">Tipo de contenido</Label>
                            <select
                              id="image-contentType"
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={contentType}
                              onChange={(e) => setContentType(e.target.value)}
                            >
                              <option value="PROMOTION">Promoción</option>
                              <option value="EVENT">Evento</option>
                              <option value="NEWS">Noticia</option>
                              <option value="PRODUCT_LAUNCH">Lanzamiento de producto</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="image-file">Subir imagen</Label>
                            <Input
                              id="image-file"
                              type="file"
                              accept="image/*"
                              ref={imageFileInputRef}
                              onChange={handleImageFileChange}
                              className="cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-1">O ingresa una URL directamente:</p>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="image-url">URL de la imagen</Label>
                            <Input
                              id="image-url"
                              placeholder="https://ejemplo.com/imagen.jpg"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                            />
                          </div>
                        </div>

                        {/* DERECHA: vista previa de Imagen */}
                        <div className="w-full md:w-1/3 mt-4 md:mt-0 max-h-[300px] md:max-h-none overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="Vista previa"
                              className="w-full h-auto max-h-64 object-contain border rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/tiktok_preview.jpg";
                              }}
                            />
                          ) : (
                            <div className="select-none flex flex-col items-center justify-center h-full border rounded p-4 text-gray-400">
                              <ImageIcon size={48} className="mb-2" />
                              <p>Ingresa la URL de una imagen</p>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex space-x-2 mt-2 md:mt-5 p-3 md:p-6">

                        <Button
                          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                          onClick={handleCreateImage}
                          disabled={submittingImage}
                        >
                          {submittingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Crear Imagen"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogContent>
                </Dialog>
              </div>

              <section className="w-full min-h-[calc(100vh-200px)] pb-4">
                {loadingImages ? (
                  <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center p-5 text-gray-500">
                    No hay imágenes disponibles. ¡Agrega una nueva!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full p-4">
                    {images.map((image) => (
                      <div key={image.id} className="bg-gradient-to-l from-blue-700 to-zinc-500 p-2 rounded-2xl w-full max-w-[300px]">
                        <Card className="p-3 md:p-5 relative group w-full bg-stone-100 h-full">
                          <div className="absolute top-2 right-2 flex gap-2 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="cursor-pointer h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 shadow-sm"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <CardHeader className="select-none">
                            <CardTitle className="text-base md:text-lg">{image.title}</CardTitle>
                            <CardDescription className="text-xs md:text-sm truncate">
                              {image.description}
                            </CardDescription>
                          </CardHeader>
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-32 object-cover rounded-md mt-2"
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="">

                                <div className="w-8 h-8 flex mt-2 cursor-pointer justify-center items-center hover:bg-indigo-100 shadow-sm rounded-md">
                                  <SquareMousePointer size={20} />
                                </div>
                              </div>
                            </DialogTrigger>

                            <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto p-3 md:p-6 md:max-w-[800px] mx-auto">
                              <Tabs defaultValue="details" className="w-full mt-2">
                                <TabsList className="grid w-[20em] grid-cols-2 gap-2">
                                  <TabsTrigger
                                    value="details"
                                    className="cursor-pointer
                                  transition-colors
                                  hover:underline hover:decoration-blue-200 hover:decoration-3
                                  data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
                                  >
                                    Detalles
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="edit"
                                    className="cursor-pointer
                                  transition-colors
                                  hover:underline hover:decoration-blue-200 hover:decoration-3
                                  data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
                                  >
                                    Editar
                                  </TabsTrigger>
                                </TabsList>

                                {/* Detalles (vista de solo lectura) */}
                                <TabsContent value="details">
                                  <Card className="border-0 m-2">
                                    <CardHeader>
                                      <CardTitle className="text-2xl font-semibold">
                                        Detalles de la Imagen
                                      </CardTitle>
                                      <CardDescription>
                                        Información completa de la imagen
                                      </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                                      {/* IZQUIERDA: campos de solo lectura */}
                                      <div className="flex-1 space-y-3 md:space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-title-${image.id}`}>Título</Label>
                                          <Input
                                            id={`view-title-${image.id}`}
                                            value={image.title}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-description-${image.id}`}>Descripción</Label>
                                          <Input
                                            id={`view-description-${image.id}`}
                                            value={image.description}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-url-${image.id}`}>URL</Label>
                                          <Input
                                            id={`view-url-${image.id}`}
                                            value={image.url}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                            onFocus={(e) => e.currentTarget.select()}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-created-${image.id}`}>Fecha de creación</Label>
                                          <Input
                                            id={`view-created-${image.id}`}
                                            value={image.createdAt ? new Date(image.createdAt).toLocaleString() : 'N/A'}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de imagen */}
                                      <div className="w-full md:w-1/3 mt-4 md:mt-0 max-h-[300px] md:max-h-none overflow-hidden">
                                        <img
                                          src={image.url}
                                          alt={image.title}
                                          className="w-full object-contain rounded-md"
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>

                                {/* Editar (formulario de edición) */}
                                <TabsContent value="edit">
                                  <Card className="border-0 m-2">
                                    <CardHeader className="select-none">
                                      <CardTitle className="text-2xl font-semibold">
                                        Editar Imagen
                                      </CardTitle>
                                      <CardDescription>
                                        Modifica los campos para actualizar esta imagen
                                      </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                                      {/* IZQUIERDA: campos de edición */}
                                      <div className="flex-1 space-y-3 md:space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-title-${image.id}`}>Título</Label>
                                          <Input
                                            id={`edit-title-${image.id}`}
                                            defaultValue={image.title}
                                            onChange={(e) => {
                                              // Crear una copia temporal de la imagen para edición
                                              const updatedImage = { ...image };
                                              updatedImage.title = e.target.value;
                                              // Actualizar el estado local
                                              const updatedImages = images.map(img =>
                                                img.id === image.id ? updatedImage : img
                                              );
                                              setImages(updatedImages);
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-description-${image.id}`}>Descripción</Label>
                                          <Input
                                            id={`edit-description-${image.id}`}
                                            defaultValue={image.description}
                                            onChange={(e) => {
                                              // Crear una copia temporal de la imagen para edición
                                              const updatedImage = { ...image };
                                              updatedImage.description = e.target.value;
                                              // Actualizar el estado local
                                              const updatedImages = images.map(img =>
                                                img.id === image.id ? updatedImage : img
                                              );
                                              setImages(updatedImages);
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-url-${image.id}`}>URL</Label>
                                          <Input
                                            id={`edit-url-${image.id}`}
                                            defaultValue={image.url}
                                            onChange={(e) => {
                                              // Crear una copia temporal de la imagen para edición
                                              const updatedImage = { ...image };
                                              updatedImage.url = e.target.value;
                                              // Actualizar el estado local
                                              const updatedImages = images.map(img =>
                                                img.id === image.id ? updatedImage : img
                                              );
                                              setImages(updatedImages);
                                            }}
                                            onFocus={(e) => e.currentTarget.select()}
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de imagen */}
                                      <div className="w-full md:w-1/3 mt-4 md:mt-0 max-h-[300px] md:max-h-none overflow-hidden">
                                        <img
                                          src={image.url}
                                          alt={image.title}
                                          className="w-full object-contain rounded-md"
                                        />
                                      </div>
                                    </CardContent>

                                    <CardFooter className="flex space-x-2 mt-2 md:mt-5 p-3 md:p-6">
                                      <Button
                                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                        onClick={() => handleSaveImageEdits(image)}
                                      >
                                        Guardar cambios
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </Card>
                      </div>

                    ))}
                  </div>
                )}
              </section>
            </Card>
          </TabsContent>

          <TabsContent value="facebook" className="h-full min-h-[calc(100vh-300px)]">
            <Card className="h-full flex flex-col min-h-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-10 gap-5">
                <div className="flex gap-3 items-center">
                  <FileVideo2 className="w-12 h-12" />
                  <section className="border-b-2 select-none">
                    Gestiona tus videos destacados
                  </section>
                </div>

                <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-black hover:bg-blue-500 cursor-pointer"
                    >
                      Agregar Video
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto p-3 md:p-6 md:max-w-[900px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader className="select-none">
                        <CardTitle className="text-2xl font-semibold">
                          Crear Video
                        </CardTitle>
                        <CardDescription>
                          Ingresa los campos para agregar tu video
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col md:flex-row gap-6 md:gap-10 p-3 md:p-6">
                        {/* IZQUIERDA: campos de entrada */}
                        <div className="flex-1 space-y-4 md:space-y-6">
                          <div className="space-y-1">
                            <Label htmlFor="video-title">Título</Label>
                            <Input
                              id="video-title"
                              placeholder="Ej. Video tutorial"
                              value={videoTitle}
                              onChange={(e) => setVideoTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="video-description">Descripción</Label>
                            <Input
                              id="video-description"
                              placeholder="Breve descripción del video"
                              value={videoDescription}
                              onChange={(e) => setVideoDescription(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="video-contentType">Tipo de contenido</Label>
                            <select
                              id="video-contentType"
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={contentType}
                              onChange={(e) => setContentType(e.target.value)}
                            >
                              <option value="PROMOTION">Promoción</option>
                              <option value="EVENT">Evento</option>
                              <option value="NEWS">Noticia</option>
                              <option value="PRODUCT_LAUNCH">Lanzamiento de producto</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="video-file">Subir video (opcional)</Label>
                            <Input
                              id="video-file"
                              type="file"
                              accept="video/*"
                              ref={videoFileInputRef}
                              onChange={handleVideoFileChange}
                              className="cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-1">O ingresa una URL directamente:</p>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="video-url">URL del video</Label>
                            <Input
                              id="video-url"
                              placeholder="https://ejemplo.com/video.mp4 o YouTube/Vimeo"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                            />
                          </div>
                        </div>

                        {/* DERECHA: vista previa de Video */}
                        <div className="w-full md:w-3/5 mt-4 md:mt-0 overflow-hidden">
                          {videoUrl ? (
                            <div className={`w-full ${videoUrl.includes('youtube.com/shorts/') ? 'max-w-[400px] mx-auto' : ''}`}>
                              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                                <div className="relative w-full" style={{
                                  paddingBottom: videoUrl.includes('youtube.com/shorts/') ? '177.78%' : '56.25%',
                                  height: 0
                                }}>
                                  <VideoPlayer
                                    url={videoUrl}
                                    title="Vista previa del video"
                                    className="absolute top-0 left-0 w-full h-full"
                                  />
                                </div>
                              ) : (
                                <VideoPlayer
                                  url={videoUrl}
                                  title="Vista previa del video"
                                  className="w-full min-h-[300px]"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] border rounded p-4 text-gray-400 select-none">
                              <FileVideo2 size={64} className="mb-4" />
                              <p className="text-center">Ingresa la URL de un video o sube un archivo para ver la vista previa</p>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex space-x-2 mt-2 md:mt-5 p-3 md:p-6">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                          onClick={handleCreateVideo}
                          disabled={submittingVideo}
                        >
                          {submittingVideo ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Crear Video"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogContent>
                </Dialog>
              </div>

              <section className="w-full min-h-[calc(100vh-200px)] pb-4">
                {loadingVideos ? (
                  <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center p-5 text-gray-500">
                    No hay videos disponibles. ¡Agrega uno nuevo!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full p-4">
                    {videos.map((video) => (
                      <div key={video.id} className="bg-gradient-to-l from-orange-500 to-zinc-500 p-2 rounded-2xl w-full max-w-[300px]">
                        <Card className="h-full p-3 md:p-5 relative group w-full bg-stone-100">
                          <div className="absolute top-2 right-2 flex gap-2 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="cursor-pointer h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 shadow-sm"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <CardHeader className="select-none">
                            <CardTitle className="text-base md:text-lg">{video.title}</CardTitle>
                            <CardDescription className="text-xs md:text-sm truncate">
                              {video.description}
                            </CardDescription>
                          </CardHeader>
                          <div className="w-full h-32 bg-gray-200 rounded-md mt-2 flex items-center justify-center relative overflow-hidden">
                            <FileVideo2 className="h-12 w-12 text-gray-400" />

                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="">

                                <div className="w-8 h-8 cursor-pointer flex mt-2 justify-center items-center hover:bg-indigo-100 shadow-sm rounded-md">
                                  <SquareMousePointer size={20} />
                                </div>
                              </div>
                            </DialogTrigger>

                            <DialogContent className="w-full max-w-[80vw] md:max-w-[900px] mx-auto">
                              <Tabs defaultValue="details" className="w-full mt-2">
                                <TabsList className="grid w-[20em] grid-cols-2 gap-2">
                                  <TabsTrigger
                                    value="details"
                                    className="cursor-pointer
                                  transition-colors
                                  hover:underline hover:decoration-blue-200 hover:decoration-3
                                  data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
                                  >
                                    Detalles
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="edit"
                                    className="cursor-pointer
                                  transition-colors
                                  hover:underline hover:decoration-blue-200 hover:decoration-3
                                  data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
                                  >
                                    Editar
                                  </TabsTrigger>
                                </TabsList>

                                {/* Detalles (vista de solo lectura) */}
                                <TabsContent value="details">
                                  <Card className="border-0 m-2">
                                    <CardHeader className="select-none">
                                      <CardTitle className="text-2xl font-semibold">
                                        Detalles del Video
                                      </CardTitle>
                                      <CardDescription>
                                        Información completa del video
                                      </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col md:flex-row gap-10">
                                      {/* IZQUIERDA: campos de solo lectura */}
                                      <div className="flex-1 space-y-3 md:space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-title-${video.id}`}>Título</Label>
                                          <Input
                                            id={`view-title-${video.id}`}
                                            value={video.title}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-description-${video.id}`}>Descripción</Label>
                                          <Input
                                            id={`view-description-${video.id}`}
                                            value={video.description}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-url-${video.id}`}>URL</Label>
                                          <Input
                                            id={`view-url-${video.id}`}
                                            value={video.url}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                            onFocus={(e) => e.currentTarget.select()}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`view-created-${video.id}`}>Fecha de creación</Label>
                                          <Input
                                            id={`view-created-${video.id}`}
                                            value={video.createdAt ? new Date(video.createdAt).toLocaleString() : 'N/A'}
                                            disabled
                                            className="cursor-not-allowed bg-gray-50"
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de video */}
                                      <div className="md:w-1/2">
                                        <VideoPlayer
                                          url={video.url}
                                          title={video.title}
                                          className="w-full object-contain"
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>

                                {/* Editar (formulario de edición) */}
                                <TabsContent value="edit">
                                  <Card className="border-0 m-2">
                                    <CardHeader className="select-none">
                                      <CardTitle className="text-2xl font-semibold">
                                        Editar Video
                                      </CardTitle>
                                      <CardDescription>
                                        Modifica los campos para actualizar este video
                                      </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col md:flex-row gap-4 md:gap-10 p-3 md:p-6">
                                      {/* IZQUIERDA: campos de edición */}
                                      <div className="flex-1 space-y-3 md:space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-title-${video.id}`}>Título</Label>
                                          <Input
                                            id={`edit-title-${video.id}`}
                                            defaultValue={video.title}
                                            onChange={(e) => {
                                              // Crear una copia temporal del video para edición
                                              const updatedVideo = { ...video };
                                              updatedVideo.title = e.target.value;
                                              // Actualizar el estado local
                                              const updatedVideos = videos.map(vid =>
                                                vid.id === video.id ? updatedVideo : vid
                                              );
                                              setVideos(updatedVideos);
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-description-${video.id}`}>Descripción</Label>
                                          <Input
                                            id={`edit-description-${video.id}`}
                                            defaultValue={video.description}
                                            onChange={(e) => {
                                              // Crear una copia temporal del video para edición
                                              const updatedVideo = { ...video };
                                              updatedVideo.description = e.target.value;
                                              // Actualizar el estado local
                                              const updatedVideos = videos.map(vid =>
                                                vid.id === video.id ? updatedVideo : vid
                                              );
                                              setVideos(updatedVideos);
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-url-${video.id}`}>URL</Label>
                                          <Input
                                            id={`edit-url-${video.id}`}
                                            defaultValue={video.url}
                                            onChange={(e) => {
                                              // Crear una copia temporal del video para edición
                                              const updatedVideo = { ...video };
                                              updatedVideo.url = e.target.value;
                                              // Actualizar el estado local
                                              const updatedVideos = videos.map(vid =>
                                                vid.id === video.id ? updatedVideo : vid
                                              );
                                              setVideos(updatedVideos);
                                            }}
                                            onFocus={(e) => e.currentTarget.select()}
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de video */}
                                      <div className="md:w-1/2">
                                        <VideoPlayer
                                          url={video.url}
                                          title={video.title}
                                          className="w-full object-contain"
                                        />
                                      </div>
                                    </CardContent>

                                    <CardFooter className="flex space-x-2 mt-2 md:mt-5 p-3 md:p-6">

                                      <Button
                                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                        onClick={() => handleSaveVideoEdits(video)}
                                      >
                                        Guardar cambios
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </Card>
                      </div>

                    ))}
                  </div>
                )}
              </section>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* El diálogo de confirmación ha sido eliminado para mejorar la experiencia de usuario */}
      {/* Componente Toaster para mostrar notificaciones */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Estilos por defecto para todos los toasts
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Estilos específicos para toasts de éxito
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          // Estilos específicos para toasts de error
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
