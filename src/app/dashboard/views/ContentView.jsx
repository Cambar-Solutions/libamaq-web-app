import { useState } from "react";
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

import { FileVideo2 } from "lucide-react";
import TikTokEmbed from "./../../../components/ui/TikTokEmbed";


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
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState("Libamaq GOD");
  const [description, setDescription] = useState(
    "Libamaq lo mejor para ti y tu hogar o chamba"
  );
  const [link, setLink] = useState(
    "https://www.tiktok.com/@libamaqherramientas/video/7284372866819263750?is_from_webapp=1&sender_device=pc&web_id=7498448340742260230"
  );

  // Estado para el diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Estados temporales para editar
  const [modalTitle, setModalTitle] = useState(title);
  const [modalDescription, setModalDescription] = useState(description);
  const [modalLink, setModalLink] = useState(link);

  // Convierte un link de TikTok en su URL de embed
  const getEmbedUrl = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? `https://www.tiktok.com/embed/${match[1]}` : "";
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

      <div className="border border-gray-200 rounded  p-4 mt-5 bg-gradient-to-b from-gray-100 to-blue-100 shadow-md">
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

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-black hover:bg-blue-900 cursor-pointer">
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
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                              id="description"
                              placeholder="Breve descripción del TikTok"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="link">Link</Label>
                            <Input
                              id="link"
                              placeholder="https://www.tiktok.com/..."
                              onFocus={(e) => e.currentTarget.select()}
                            />
                          </div>
                        </div>

                        {/* DERECHA: vista previa de TikTok */}
                        <div className="md:w-1/3">
                          <TikTokEmbed videoUrl={link} aspectRatio="177%" />
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-end space-x-2">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Crear tik tok
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogContent>
                </Dialog>
              </div>

              <section className=" w-full h-full pb-4">
                <div className="flex flex-wrap justify-around gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gradient-to-l from-red-500 to-blue-500 p-2 rounded-2xl cursor-pointer">
                        <Card className="p-5">
                          <CardHeader>
                            <CardTitle>Tik tok 1</CardTitle>
                            <CardDescription>
                              Es un video subiendo carga pesada
                            </CardDescription>
                          </CardHeader>
                        </Card>
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

                        {/* ---------------- Detalles (vista de solo lectura) ---------------- */}
                        <TabsContent value="details">
                          <Card className="border-0 m-2">
                            <CardHeader>
                              <CardTitle className="text-2xl font-semibold">
                                Contenido
                              </CardTitle>
                              <CardDescription>
                                Puedes visualizar tu tik tok
                              </CardDescription>
                            </CardHeader>

                            {/* Flex: columna en móvil, fila en md+ */}
                            <CardContent className="flex flex-col md:flex-row gap-20">
                              {/* IZQUIERDA: campos de sólo lectura */}
                              <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                  <Label htmlFor="title">Título</Label>
                                  <Input
                                    id="title"
                                    value={title}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="description">
                                    Descripción
                                  </Label>
                                  <Input
                                    id="description"
                                    value={description}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="link">Link</Label>
                                  <Input
                                    id="link"
                                    value={link}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                              </div>

                              {/* DERECHA: embed con TikTokEmbed */}
                              <div className="md:w-1/3">
                                <TikTokEmbed
                                  videoUrl={link}
                                  aspectRatio="177%" // proporción 9:16
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* ---------------- Editar (modo edición) ---------------- */}
                        <TabsContent value="edit">
                          <Card className="border-0 m-2">
                            <CardHeader>
                              <CardTitle className="text-2xl font-semibold">
                                Editar TikTok
                              </CardTitle>
                              <CardDescription>
                                Modifica los campos y guarda los cambios.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 ">
                              <div className="w-[30em]">
                                <div className="space-y-1">
                                  <Label htmlFor="edit-title">Título</Label>
                                  <Input
                                    id="edit-title"
                                    value={modalTitle}
                                    onChange={(e) =>
                                      setModalTitle(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-description">
                                    Descripción
                                  </Label>
                                  <Input
                                    id="edit-description"
                                    value={modalDescription}
                                    onChange={(e) =>
                                      setModalDescription(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-link">Link</Label>
                                  <Input
                                    id="edit-link"
                                    value={modalLink}
                                    onChange={(e) =>
                                      setModalLink(e.target.value)
                                    }
                                    onFocus={(e) => e.currentTarget.select()}
                                  />
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // revertir cambios si cancela
                                  setModalTitle(title);
                                  setModalDescription(description);
                                  setModalLink(link);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  // aplicar y cerrar
                                  setTitle(modalTitle);
                                  setDescription(modalDescription);
                                  setLink(modalLink);
                                }}
                              >
                                Guardar cambios
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gradient-to-l from-red-500 to-blue-500 p-2 rounded-2xl cursor-pointer">
                        <Card className="p-5">
                          <CardHeader>
                            <CardTitle>Tik tok 1</CardTitle>
                            <CardDescription>
                              Es un video subiendo carga pesada
                            </CardDescription>
                          </CardHeader>
                        </Card>
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

                        {/* ---------------- Detalles (vista de solo lectura) ---------------- */}
                        <TabsContent value="details">
                          <Card className="border-0 m-2">
                            <CardHeader>
                              <CardTitle className="text-2xl font-semibold">
                                Contenido
                              </CardTitle>
                              <CardDescription>
                                Puedes visualizar tu tik tok
                              </CardDescription>
                            </CardHeader>

                            {/* Flex: columna en móvil, fila en md+ */}
                            <CardContent className="flex flex-col md:flex-row gap-20">
                              {/* IZQUIERDA: campos de sólo lectura */}
                              <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                  <Label htmlFor="title">Título</Label>
                                  <Input
                                    id="title"
                                    value={title}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="description">
                                    Descripción
                                  </Label>
                                  <Input
                                    id="description"
                                    value={description}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="link">Link</Label>
                                  <Input
                                    id="link"
                                    value={link}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                              </div>

                              {/* DERECHA: embed con TikTokEmbed */}
                              <div className="md:w-1/3">
                                <TikTokEmbed
                                  videoUrl={link}
                                  aspectRatio="177%" // proporción 9:16
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* ---------------- Editar (modo edición) ---------------- */}
                        <TabsContent value="edit">
                          <Card className="border-0 m-2">
                            <CardHeader>
                              <CardTitle className="text-2xl font-semibold">
                                Editar TikTok
                              </CardTitle>
                              <CardDescription>
                                Modifica los campos y guarda los cambios.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 ">
                              <div className="w-[30em]">
                                <div className="space-y-1">
                                  <Label htmlFor="edit-title">Título</Label>
                                  <Input
                                    id="edit-title"
                                    value={modalTitle}
                                    onChange={(e) =>
                                      setModalTitle(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-description">
                                    Descripción
                                  </Label>
                                  <Input
                                    id="edit-description"
                                    value={modalDescription}
                                    onChange={(e) =>
                                      setModalDescription(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-link">Link</Label>
                                  <Input
                                    id="edit-link"
                                    value={modalLink}
                                    onChange={(e) =>
                                      setModalLink(e.target.value)
                                    }
                                    onFocus={(e) => e.currentTarget.select()}
                                  />
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // revertir cambios si cancela
                                  setModalTitle(title);
                                  setModalDescription(description);
                                  setModalLink(link);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  // aplicar y cerrar
                                  setTitle(modalTitle);
                                  setDescription(modalDescription);
                                  setLink(modalLink);
                                }}
                              >
                                Guardar cambios
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gradient-to-l from-red-500 to-blue-500 p-2 rounded-2xl cursor-pointer">
                        <Card className="p-5">
                          <CardHeader>
                            <CardTitle>Tik tok 1</CardTitle>
                            <CardDescription>
                              Es un video subiendo carga pesada
                            </CardDescription>
                          </CardHeader>
                        </Card>
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

                        {/* ---------------- Detalles (vista de solo lectura) ---------------- */}
                        <TabsContent value="details">
                          <Card className="border-0 m-2">
                            <CardHeader>
                              <CardTitle className="text-2xl font-semibold">
                                Contenido
                              </CardTitle>
                              <CardDescription>
                                Puedes visualizar tu tik tok
                              </CardDescription>
                            </CardHeader>

                            {/* Flex: columna en móvil, fila en md+ */}
                            <CardContent className="flex flex-col md:flex-row gap-20">
                              {/* IZQUIERDA: campos de sólo lectura */}
                              <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                  <Label htmlFor="title">Título</Label>
                                  <Input
                                    id="title"
                                    value={title}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="description">
                                    Descripción
                                  </Label>
                                  <Input
                                    id="description"
                                    value={description}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="link">Link</Label>
                                  <Input
                                    id="link"
                                    value={link}
                                    disabled
                                    className="cursor-not-allowed"
                                  />
                                </div>
                              </div>

                              {/* DERECHA: embed con TikTokEmbed */}
                              <div className="md:w-1/3">
                                <TikTokEmbed
                                  videoUrl={link}
                                  aspectRatio="177%" // proporción 9:16
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* ---------------- Editar (modo edición) ---------------- */}
                        <TabsContent value="edit">
                          <Card className="border-0 m-2">
                            <CardHeader>
                              <CardTitle className="text-2xl font-semibold">
                                Editar TikTok
                              </CardTitle>
                              <CardDescription>
                                Modifica los campos y guarda los cambios.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 ">
                              <div className="w-[30em]">
                                <div className="space-y-1">
                                  <Label htmlFor="edit-title">Título</Label>
                                  <Input
                                    id="edit-title"
                                    value={modalTitle}
                                    onChange={(e) =>
                                      setModalTitle(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-description">
                                    Descripción
                                  </Label>
                                  <Input
                                    id="edit-description"
                                    value={modalDescription}
                                    onChange={(e) =>
                                      setModalDescription(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-link">Link</Label>
                                  <Input
                                    id="edit-link"
                                    value={modalLink}
                                    onChange={(e) =>
                                      setModalLink(e.target.value)
                                    }
                                    onFocus={(e) => e.currentTarget.select()}
                                  />
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // revertir cambios si cancela
                                  setModalTitle(title);
                                  setModalDescription(description);
                                  setModalLink(link);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  // aplicar y cerrar
                                  setTitle(modalTitle);
                                  setDescription(modalDescription);
                                  setLink(modalLink);
                                }}
                              >
                                Guardar cambios
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </section>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Imagenes</CardTitle>
                <CardDescription>
                  Puedes agregar imaganes que se veran en tu landing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="current">Busca tu imagen</Label>
                  <Input id="current" type="file" />
                </div>
                
              </CardContent>
              <CardFooter>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
