import { useState, useEffect, useRef } from "react";
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

import {
  FileVideo2,
  Trash2,
  Edit,
  Loader2,
  SquareMousePointer,
  Image as ImageIcon,
  Upload
} from "lucide-react";

import TikTokEmbed from "./../../../components/ui/TikTokEmbed";
import { createLanding, updateLanding, deleteLanding, getAllActiveLandings, changeLandingStatus } from "@/services/admin/landingService";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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
  // Estados para la lista de landings
  const [landings, setLandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el formulario de creación/edición
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [currentLandingId, setCurrentLandingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados para imágenes
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submittingImage, setSubmittingImage] = useState(false);

  // Estados para diálogo de confirmación
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [updateType, setUpdateType] = useState(""); // "TIKTOK", "IMAGE", "VIDEO"

  // Estados para videos
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [submittingVideo, setSubmittingVideo] = useState(false);

  // Estado para el diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Convierte un link de TikTok en su URL de embed
  const getEmbedUrl = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? `https://www.tiktok.com/embed/${match[1]}` : "";
  };

  // Cargar landings al iniciar el componente
  useEffect(() => {
    loadLandings();
    loadImages();
    loadVideos();
  }, []);

  // Función para cargar landings desde el servicio
  const loadLandings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar getAllActiveLandings en lugar de getLandings como se muestra en Postman
      const response = await getAllActiveLandings();
      console.log("Respuesta de getAllActiveLandings:", response);

      // Basado en la estructura de respuesta de Postman
      if (response && response.result) {
        // Filtrar solo los elementos de tipo TIKTOK
        const tiktoks = Array.isArray(response.result)
          ? response.result.filter(item => item.type === "TIKTOK")
          : (response.result.type === "TIKTOK" ? [response.result] : []);
        setLandings(tiktoks);
      } else if (Array.isArray(response)) {
        const tiktoks = response.filter(item => item.type === "TIKTOK");
        setLandings(tiktoks);
      } else {
        setLandings([]);
        console.warn("No se encontraron TikToks o la estructura de respuesta es diferente:", response);
      }
    } catch (err) {
      console.error("Error al cargar landings:", err);
      setError(`No se pudieron cargar los TikToks: ${err.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un nuevo landing
  const handleCreateLanding = async () => {
    if (!link || !title) {
      alert("El título y el link son obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      // Formato exacto como se muestra en Postman
      const landingData = {
        url: link,
        title,
        description,
        type: "TIKTOK"
      };

      console.log("Enviando datos:", landingData);

      if (isEditing && currentLandingId) {
        // Actualizar landing existente
        const updatedLanding = await updateLanding({ ...landingData, id: currentLandingId });
        console.log("Landing actualizado:", updatedLanding);
      } else {
        // Crear nuevo landing
        const newLanding = await createLanding(landingData);
        console.log("Nuevo landing creado:", newLanding);
      }

      // Resetear formulario y recargar landings
      resetForm();
      loadLandings();
      console.log(isEditing ? "TikTok actualizado correctamente" : "TikTok creado correctamente");
    } catch (err) {
      console.error("Error al guardar landing:", err);
      console.error(`Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'} el TikTok: ${err.message || 'Error de conexión'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Función para eliminar un landing (cambiando su estado a INACTIVE)
  const handleDeleteLanding = async (landingId) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este TikTok?")) {
      setLoading(true);
      try {
        // Encontrar el landing completo en el estado actual
        const landingToDelete = landings.find(landing => landing.id === landingId);

        if (!landingToDelete) {
          throw new Error(`No se encontró el TikTok con ID ${landingId}`);
        }

        console.log('TikTok a eliminar:', landingToDelete);

        // Cambiar estado a INACTIVE - pasar todos los campos requeridos
        const response = await changeLandingStatus({
          id: landingToDelete.id,
          title: landingToDelete.title,
          description: landingToDelete.description || '',
          url: landingToDelete.url,
          type: landingToDelete.type || 'TIKTOK',
          status: 'INACTIVE'
        });

        console.log('Respuesta de eliminación:', response);

        // Recargar la lista de landings
        await loadLandings();
        console.log("TikTok eliminado correctamente");
      } catch (err) {
        console.error("Error al eliminar landing:", err);
        setError(`No se pudo eliminar el TikTok: ${err.message || 'Error de conexión'}`);
      } finally {
        setLoading(false);
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

  // Función para preparar la actualización y mostrar el diálogo de confirmación
  const prepareUpdate = (item, type) => {
    setItemToUpdate(item);
    setUpdateType(type);
    setIsConfirmDialogOpen(true);
  };

  // Función para confirmar y realizar la actualización
  const confirmUpdate = async () => {
    try {
      if (!itemToUpdate) return;

      // Preparar los datos para la actualización
      const updatedData = {
        id: itemToUpdate.id,
        title: itemToUpdate.title,
        description: itemToUpdate.description || "",
        url: itemToUpdate.url,
        type: itemToUpdate.type || updateType,
        status: itemToUpdate.status || "ACTIVE" // Añadir el campo status requerido por la API
      };

      console.log("Enviando datos actualizados:", updatedData);

      // Llamar al servicio de actualización
      const result = await updateLanding(updatedData);
      console.log("Resultado de la actualización:", result);

      // Recargar los datos según el tipo
      if (updateType === "TIKTOK") {
        await loadLandings();
      } else if (updateType === "IMAGE") {
        await loadImages();
      } else if (updateType === "VIDEO") {
        await loadVideos();
      }

      // Cerrar el diálogo de confirmación
      setIsConfirmDialogOpen(false);
      setItemToUpdate(null);

      // Operación completada con éxito
      console.log(`${updateType === "TIKTOK" ? "TikTok" : updateType === "IMAGE" ? "Imagen" : "Video"} actualizado correctamente`);
    } catch (error) {
      console.error(`Error al actualizar ${updateType}:`, error);
      alert(`Error al actualizar: ${error.message || 'Error de conexión'}`);
      setIsConfirmDialogOpen(false);
    }
  };

  // Función para guardar los cambios de edición desde el modal (TikTok)
  const handleSaveEdits = (landing) => {
    prepareUpdate(landing, "TIKTOK");
  };

  // Función para guardar los cambios de edición de imágenes
  const handleSaveImageEdits = (image) => {
    prepareUpdate(image, "IMAGE");
  };

  // Función para guardar los cambios de edición de videos
  const handleSaveVideoEdits = (video) => {
    prepareUpdate(video, "VIDEO");
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

  // Resetear formulario de imágenes
  const resetImageForm = () => {
    setImageTitle("");
    setImageDescription("");
    setImageUrl("");
  };

  // Resetear formulario de videos
  const resetVideoForm = () => {
    setVideoTitle("");
    setVideoDescription("");
    setVideoUrl("");
  };

  // Función para cargar imágenes
  const loadImages = async () => {
    setLoadingImages(true);
    try {
      const response = await getAllActiveLandings();

      // Filtrar solo los elementos de tipo IMAGE
      if (response && response.result) {
        const imageItems = Array.isArray(response.result)
          ? response.result.filter(item => item.type === "IMAGE")
          : (response.result.type === "IMAGE" ? [response.result] : []);
        setImages(imageItems);
      } else if (Array.isArray(response)) {
        const imageItems = response.filter(item => item.type === "IMAGE");
        setImages(imageItems);
      } else {
        setImages([]);
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
      const response = await getAllActiveLandings();

      // Filtrar solo los elementos de tipo VIDEO
      if (response && response.result) {
        const videoItems = Array.isArray(response.result)
          ? response.result.filter(item => item.type === "VIDEO")
          : (response.result.type === "VIDEO" ? [response.result] : []);
        setVideos(videoItems);
      } else if (Array.isArray(response)) {
        const videoItems = response.filter(item => item.type === "VIDEO");
        setVideos(videoItems);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Error al cargar videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Función para crear una nueva imagen
  const handleCreateImage = async () => {
    if (!imageUrl || !imageTitle) {
      alert("El título y la URL de la imagen son obligatorios");
      return;
    }

    setSubmittingImage(true);
    try {
      // Crear landing con tipo IMAGE
      const landingData = {
        url: imageUrl,
        title: imageTitle,
        description: imageDescription,
        type: "IMAGE"
      };

      const newLanding = await createLanding(landingData);
      console.log("Nueva imagen creada:", newLanding);

      // Resetear formulario y recargar imágenes
      resetImageForm();
      loadImages();
      console.log("Imagen creada correctamente");
    } catch (err) {
      console.error("Error al guardar imagen:", err);
      alert(`Ocurrió un error al crear la imagen: ${err.message || 'Error de conexión'}`);
    } finally {
      setSubmittingImage(false);
    }
  };

  // Función para crear un nuevo video
  const handleCreateVideo = async () => {
    if (!videoUrl || !videoTitle) {
      alert("El título y la URL del video son obligatorios");
      return;
    }

    setSubmittingVideo(true);
    try {
      // Crear landing con tipo VIDEO
      const landingData = {
        url: videoUrl,
        title: videoTitle,
        description: videoDescription,
        type: "VIDEO"
      };

      const newLanding = await createLanding(landingData);
      console.log("Nuevo video creado:", newLanding);

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
    if (window.confirm("¿Estás seguro que deseas eliminar esta imagen?")) {
      try {
        const imageToDelete = images.find(img => img.id === imageId);
        if (!imageToDelete) {
          throw new Error(`No se encontró la imagen con ID ${imageId}`);
        }

        // Pasar todos los campos requeridos
        await changeLandingStatus({
          id: imageToDelete.id,
          title: imageToDelete.title,
          description: imageToDelete.description || '',
          url: imageToDelete.url,
          type: imageToDelete.type || 'IMAGE',
          status: 'INACTIVE'
        });

        console.log("Imagen eliminada correctamente");
        loadImages();
      } catch (err) {
        console.error("Error al eliminar imagen:", err);
        alert(`Ocurrió un error al eliminar la imagen: ${err.message || 'Error de conexión'}`);
      }
    }
  };

  // Función para eliminar un video
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este video?")) {
      try {
        const videoToDelete = videos.find(vid => vid.id === videoId);
        if (!videoToDelete) {
          throw new Error(`No se encontró el video con ID ${videoId}`);
        }

        // Pasar todos los campos requeridos
        await changeLandingStatus({
          id: videoToDelete.id,
          title: videoToDelete.title,
          description: videoToDelete.description || '',
          url: videoToDelete.url,
          type: videoToDelete.type || 'VIDEO',
          status: 'INACTIVE'
        });

        console.log("Video eliminado correctamente");
        loadVideos();
      } catch (err) {
        console.error("Error al eliminar video:", err);
        alert(`Ocurrió un error al eliminar el video: ${err.message || 'Error de conexión'}`);
      }
    }
  };

  // Abrir diálogo para nuevo landing
  const openNewLandingDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-gray-100 to-blue-300 rounded-2xl">
      <div className="flex items-center justify-between rounded shadow p-4 bg-white">
        <div>
          <h1 className="text-2xl font-semibold select-none">
            En esta sección se puede agregar contenido multimedia
          </h1>
          <p className="text-gray-700 select-none">
            Da clic en el botón "Agregar contenido" dependiendo cada sección de
            contenido multimedia
          </p>
        </div>

        <div>
          <a
            href="https://www.tiktok.com/@libamaqherramientas"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 px-4 rounded-2xl inline-flex items-center cursor-pointer"
          >
            Ver perfil de TikTok
            <FileVideo2 className="ml-2" />
          </a>
        </div>
      </div>

      <div className="border border-gray-200 rounded p-4 mt-5 bg-gradient-to-b from-gray-100 to-blue-100 shadow-md">
        <Tabs defaultValue="multimedia">
          <TabsList className="grid grid-cols-3 gap-2 bg-white">
            <TabsTrigger
              className="cursor-pointer
      transition-colors
       hover:bg-blue-100
      data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:underline-offset-2"
              value="multimedia"
            >
              Tik toks
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer
      transition-colors
       hover:bg-blue-100
      data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:underline-offset-3"
              value="images"
            >
              Imagenes
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer
      transition-colors
       hover:bg-blue-100
      data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:underline-offset-2"
              value="facebook"
            >
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multimedia">
            <Card>
              <div className="flex justify-between px-10 gap-5 items-center">
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

                  <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader>
                        <CardTitle className="text-2xl font-semibold select-none">
                          Contenido
                        </CardTitle>
                        <CardDescription className="select-none">
                          Llena los campos para agregar tu TikTok
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col md:flex-row gap-20">
                        {/* IZQUIERDA: campos de entrada */}
                        <div className="flex-1 space-y-6">
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
                        <div className="md:w-1/3">
                          {link ? (
                            <TikTokEmbed videoUrl={link} aspectRatio="177%" />
                          ) : (
                            <div className="flex items-center justify-center h-full border rounded p-4 text-gray-400 select-none">
                              Vista previa del TikTok
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex space-x-2 mt-5">

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

              <section className="w-full h-full pb-4">
                {loading ? (
                  <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  </div>
                ) : error ? (
                  <div className="text-center p-5 text-red-500">{error}</div>
                ) : landings.length === 0 ? (
                  <div className="text-center p-5 text-gray-500">
                    No hay TikToks disponibles. ¡Agrega uno nuevo!
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-around gap-4">
                    {landings.map((landing) => (
                      <div key={landing.id} className="bg-gradient-to-l from-red-500 to-blue-500 p-2 rounded-2xl w-[300px] mt-4">
                        <Card className="p-5 relative group h-[220px] flex flex-col">
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
                            <CardTitle className="text-lg font-bold truncate select-none" title={landing.title}>{landing.title}</CardTitle>
                            <CardDescription className="line-clamp-3 h-[60px] overflow-hidden select-none" title={landing.description}>
                              {landing.description}
                            </CardDescription>
                          </CardHeader>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="w-8 h-8 cursor-pointer flex justify-center items-center hover:bg-indigo-100 shadow-sm rounded-md">
                                <SquareMousePointer size={20} />


                              </div>
                            </DialogTrigger>

                            <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
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

                                    <CardContent className="flex flex-col md:flex-row gap-20">
                                      {/* IZQUIERDA: campos de solo lectura */}
                                      <div className="flex-1 space-y-6">
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
                                      <div className="md:w-1/3">
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

                                    <CardContent className="flex flex-col md:flex-row gap-20">
                                      {/* IZQUIERDA: campos de edición */}
                                      <div className="flex-1 space-y-6">
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-title-${landing.id}`}>Título</Label>
                                          <Input
                                            id={`edit-title-${landing.id}`}
                                            defaultValue={landing.title}
                                            onChange={(e) => {
                                              // Crear una copia temporal del landing para edición
                                              const updatedLanding = { ...landing };
                                              updatedLanding.title = e.target.value;
                                              // Actualizar el estado local
                                              const updatedLandings = landings.map(l =>
                                                l.id === landing.id ? updatedLanding : l
                                              );
                                              setLandings(updatedLandings);
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-description-${landing.id}`}>Descripción</Label>
                                          <Input
                                            id={`edit-description-${landing.id}`}
                                            defaultValue={landing.description}
                                            onChange={(e) => {
                                              // Crear una copia temporal del landing para edición
                                              const updatedLanding = { ...landing };
                                              updatedLanding.description = e.target.value;
                                              // Actualizar el estado local
                                              const updatedLandings = landings.map(l =>
                                                l.id === landing.id ? updatedLanding : l
                                              );
                                              setLandings(updatedLandings);
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label htmlFor={`edit-url-${landing.id}`}>URL</Label>
                                          <Input
                                            id={`edit-url-${landing.id}`}
                                            defaultValue={landing.url}
                                            onChange={(e) => {
                                              // Crear una copia temporal del landing para edición
                                              const updatedLanding = { ...landing };
                                              updatedLanding.url = e.target.value;
                                              // Actualizar el estado local
                                              const updatedLandings = landings.map(l =>
                                                l.id === landing.id ? updatedLanding : l
                                              );
                                              setLandings(updatedLandings);
                                            }}
                                          />
                                        </div>
                                      </div>

                                      {/* DERECHA: vista previa de TikTok */}
                                      <div className="md:w-1/3">
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

          <TabsContent value="images">
            <Card>
              <div className="flex justify-between px-10 gap-5 items-center">
                <div className="flex gap-3 items-center">
                  <ImageIcon className="w-12 h-12" />
                  <section className="border-b-2 select-none">
                    Gestiona tus imágenes destacadas
                  </section>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-black hover:bg-blue-500 cursor-pointer"
                    >
                      Agregar Imagen
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader className="select-none">
                        <CardTitle className="text-2xl font-semibold">
                          Contenido
                        </CardTitle>
                        <CardDescription>
                          Llena los campos para agregar tu Imagen
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col md:flex-row gap-20">
                        {/* IZQUIERDA: campos de entrada */}
                        <div className="flex-1 space-y-6">
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
                            <Label htmlFor="image-url">URL de la imagen</Label>
                            <Input
                              id="image-url"
                              placeholder="https://ejemplo.com/imagen.jpg"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              required
                            />
                          </div>
                        </div>

                        {/* DERECHA: vista previa de Imagen */}
                        <div className="md:w-1/3">
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

                      <CardFooter className="flex space-x-2 mt-5">

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

              <section className="w-full h-full pb-4">
                {loadingImages ? (
                  <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center p-5 text-gray-500">
                    No hay imágenes disponibles. ¡Agrega una nueva!
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-around gap-4 p-4">
                    {images.map((image) => (
                      <div className="bg-gradient-to-l from-blue-700 to-zinc-500 p-2 rounded-2xl">
                        <Card key={image.id} className="p-5 relative group w-[300px] bg-stone-100 ">
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
                            <CardTitle>{image.title}</CardTitle>
                            <CardDescription>
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

                            <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
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

                                    <CardContent className="flex flex-col md:flex-row gap-20">
                                      {/* IZQUIERDA: campos de solo lectura */}
                                      <div className="flex-1 space-y-6">
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
                                      <div className="md:w-1/3">
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

                                    <CardContent className="flex flex-col md:flex-row gap-20">
                                      {/* IZQUIERDA: campos de edición */}
                                      <div className="flex-1 space-y-6">
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
                                      <div className="md:w-1/3">
                                        <img
                                          src={image.url}
                                          alt={image.title}
                                          className="w-full object-contain rounded-md"
                                        />
                                      </div>
                                    </CardContent>

                                    <CardFooter className="flex space-x-2 mt-5">
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

          <TabsContent value="facebook">
            <Card>
              <div className="flex justify-between px-10 gap-5 items-center">
                <div className="flex gap-3 items-center">
                  <FileVideo2 className="w-12 h-12" />
                  <section className="border-b-2 select-none">
                    Gestiona tus videos destacados
                  </section>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-black hover:bg-blue-500 cursor-pointer"
                    >
                      Agregar Video
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader className="select-none">
                        <CardTitle className="text-2xl font-semibold">
                          Contenido
                        </CardTitle>
                        <CardDescription>
                          Llena los campos para agregar tu Video
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col md:flex-row gap-20">
                        {/* IZQUIERDA: campos de entrada */}
                        <div className="flex-1 space-y-6">
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
                            <Label htmlFor="video-url">URL del video</Label>
                            <Input
                              id="video-url"
                              placeholder="https://ejemplo.com/video.mp4"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              required
                            />
                          </div>
                        </div>

                        {/* DERECHA: vista previa de Video */}
                        <div className="md:w-1/3">
                          {videoUrl ? (
                            <VideoPlayer
                              url={videoUrl}
                              title="Vista previa del video"
                              className="w-full h-auto object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full border rounded p-4 text-gray-400 select-none">
                              <FileVideo2 size={48} className="mb-2" />
                              <p>Ingresa la URL de un video</p>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex space-x-2 mt-5">

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

              <section className="w-full h-full pb-4">
                {loadingVideos ? (
                  <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center p-5 text-gray-500">
                    No hay videos disponibles. ¡Agrega uno nuevo!
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-around gap-4 p-4">
                    {videos.map((video) => (
                      <div className="bg-gradient-to-l from-orange-500 to-zinc-500 p-2 rounded-2xl">
                        <Card key={video.id} className="p-5 relative group w-[300px] bg-stone-100">
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
                            <CardTitle>{video.title}</CardTitle>
                            <CardDescription>
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
                                      <div className="flex-1 space-y-6">
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

                                    <CardContent className="flex flex-col md:flex-row gap-20">
                                      {/* IZQUIERDA: campos de edición */}
                                      <div className="flex-1 space-y-6">
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

                                    <CardFooter className="flex space-x-2 mt-5">

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

      {/* Diálogo de confirmación para actualización */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar actualización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas actualizar este {updateType === "TIKTOK" ? "TikTok" : updateType === "IMAGE" ? "imagen" : "video"}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmUpdate}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
