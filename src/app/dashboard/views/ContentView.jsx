import { useState, useEffect } from "react";
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
  SquareMousePointer 
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
      alert(isEditing ? "TikTok actualizado correctamente" : "TikTok creado correctamente");
    } catch (err) {
      console.error("Error al guardar landing:", err);
      alert(`Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'} el TikTok: ${err.message || 'Error de conexión'}`);
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
        
        // Cambiar el estado a INACTIVE pero enviando todos los campos obligatorios
        await updateLanding({
          id: landingToDelete.id,
          title: landingToDelete.title,
          description: landingToDelete.description || '',
          url: landingToDelete.url,
          type: landingToDelete.type || 'TIKTOK',
          status: 'INACTIVE'
        });
        
        console.log(`TikTok con ID ${landingId} marcado como inactivo`);
        
        // Recargar la lista de landings (solo mostrará los activos)
        loadLandings();
        
        // Mostrar mensaje de éxito
        alert("TikTok eliminado correctamente");
      } catch (err) {
        console.error("Error al eliminar landing:", err);
        alert(`No se pudo eliminar el TikTok: ${err.message || 'Intenta de nuevo'}`);
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
  
  // Función para guardar los cambios de edición desde el modal
  const handleSaveEdits = async (landing) => {
    try {
      // Preparar los datos para la actualización
      const updatedData = {
        id: landing.id,
        title: landing.title,
        description: landing.description || "",
        url: landing.url,
        type: landing.type || "TIKTOK",
        status: landing.status || "ACTIVE" // Añadir el campo status requerido por la API
      };
      
      console.log("Enviando datos actualizados:", updatedData);
      
      // Llamar al servicio de actualización
      const result = await updateLanding(updatedData);
      console.log("Resultado de la actualización:", result);
      
      // Recargar los landings para mostrar los cambios
      await loadLandings();
      
      // Mostrar mensaje de éxito
      alert("TikTok actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el TikTok:", error);
      alert(`Error al actualizar el TikTok: ${error.message || 'Error de conexión'}`);
    }
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

  // Abrir diálogo para nuevo landing
  const openNewLandingDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-gray-100 to-blue-300 rounded-2xl">
      <div className="flex items-center justify-between rounded shadow p-4 bg-white">
        <div>
          <h1 className="text-2xl font-semibold ">
            En esta sección se puede agregar contenido multimedia
          </h1>
          <p className="text-gray-700">
            Da clic en el botón "Agregar contenido" dependiendo cada seccion de
            contenido multimedia
          </p>
        </div>

        <div>
          <a
            href="https://www.tiktok.com/@libamaqherramientas"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-2xl inline-flex items-center cursor-pointer"
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
      hover:underline hover:decoration-blue-200 hover:decoration-3
      data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
              value="multimedia"
            >
              Tik toks
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer
      transition-colors
      hover:underline hover:decoration-blue-200 hover:decoration-3
      data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
              value="images"
            >
              Imagenes
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer
      transition-colors
      hover:underline hover:decoration-blue-200 hover:decoration-3
      data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:decoration-3"
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
                  <section className="border-b-2">
                    Recueda que aqui podras gestionar tu contenido
                  </section>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-black hover:bg-blue-900 cursor-pointer"
                      onClick={openNewLandingDialog}
                    >
                      Agregar TikTok
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
                    <Card className="border-0 m-2">
                      <CardHeader>
                        <CardTitle className="text-2xl font-semibold">
                          Contenido
                        </CardTitle>
                        <CardDescription>
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
                            <div className="flex items-center justify-center h-full border rounded p-4 text-gray-400">
                              Vista previa del TikTok
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={resetForm}
                          disabled={submitting}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
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
                      <div key={landing.id} className="bg-gradient-to-l from-red-500 to-blue-500 p-2 rounded-2xl">
                        <Card className="p-5 relative group">
                          <div className="absolute top-2 right-2 flex gap-2 transition-opacity">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 shadow-sm"
                              onClick={() => handleDeleteLanding(landing.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <CardHeader>
                            <CardTitle>{landing.title}</CardTitle>
                            <CardDescription>
                              {landing.description}
                            </CardDescription>
                          </CardHeader>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="cursor-pointer flex justify-start items-center">
                              <SquareMousePointer size={20} />


                              </div>
                            </DialogTrigger>

                            <DialogContent className="w-full max-w-[80vw] md:max-w-[800px] mx-auto">
                              <Tabs defaultValue="details" className="w-full mt-2">
                                <TabsList className="flex justify-end grid w-[20em] grid-cols-2 gap-2">
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
                                    <CardHeader>
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
                                              const updatedLanding = {...landing};
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
                                              const updatedLanding = {...landing};
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
                                              const updatedLanding = {...landing};
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

                                    <CardFooter className="flex justify-between space-x-2">
                                      <Button variant="outline">
                                        Cancelar
                                      </Button>
                                      <Button 
                                        className="bg-blue-600 hover:bg-blue-700"
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
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
                <CardDescription>
                  Aquí puedes gestionar las imágenes de tu sitio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facebook">
            <Card>
              <CardHeader>
                <CardTitle>Videos</CardTitle>
                <CardDescription>
                  Aquí puedes gestionar los videos de tu sitio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
