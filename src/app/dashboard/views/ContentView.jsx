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
  const [description, setDescription] = useState("Libamaq lo mejor para ti y tu hogar o chamba");
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
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-gray-100 to-blue-200">
      <div className="flex items-center justify-between rounded shadow p-4">
        <div>
          <h1 className="text-2xl font-semibold">
            En esta sección se puede agregar contenido multimedia
          </h1>
          <p className="text-gray-700">
            Da clic en el botón "Agregar contenido" para agregar contenido multimedia
          </p>
        </div>

        <div>
          <Button className="bg-blue-700 hover:bg-blue-900 cursor-pointer">Agregar contenido</Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded shadow p-4 mt-5 bg-gradient-to-b from-gray-100 to-blue-100 shadow-md">
        <Tabs defaultValue="multimedia">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger className="cursor-pointer hover:bg-blue-200 transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md" value="multimedia">Multimedia</TabsTrigger>
            <TabsTrigger className="cursor-pointer hover:bg-blue-200 transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md" value="bannerContent">BannerContent</TabsTrigger>
            <TabsTrigger className="cursor-pointer hover:bg-blue-200 transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md" value="facebook">Facebook</TabsTrigger>
            <TabsTrigger className="cursor-pointer hover:bg-blue-200 transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md" value="twitter">Twitter</TabsTrigger>
          </TabsList>

          <TabsContent value="multimedia">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Multimedia</CardTitle>
                <CardDescription>
                  Aquí puedes agregar contenido multimedia de TikTok
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="space-y-1 mt-5">
                  <Label htmlFor="title">Titulo</Label>
                  <Input id="title" value={title} disabled className="cursor-not-allowed" />
                </div>

                <div className="space-y-1 mt-5">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" value={description} disabled className="cursor-not-allowed" />
                </div>

                <div className="space-y-1 mt-5">
                  <Label htmlFor="link">Link</Label>
                  <Input id="link" value={link} disabled className="cursor-not-allowed" />
                </div>

                <div className="space-y-1 mt-5">
                  <Label htmlFor="username">Previsualización del contenido</Label>
                  <Button
                    className="bg-indigo-500 hover:bg-indigo-800 cursor-pointer"
                    onClick={() => setShowPreview((prev) => !prev)}
                  >
                    {showPreview ? "Ocultar vista previa" : "Vista previa"}
                  </Button>

                  {showPreview && (
                    <div className="mt-1 overflow-hidden rounded border border-gray-200">
                      <iframe
                        src={getEmbedUrl(link)}
                        className="w-full h-145 items-center"
                        allow="autoplay; fullscreen"
                        scrolling="no"
                      />
                    </div>
                  )}
                </div>

              </CardContent>

              <CardFooter className="flex justify-end space-x-2">
                {/* Dialog para Editar */}
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    if (open) {
                      setModalTitle(title);
                      setModalDescription(description);
                      setModalLink(link);
                    }
                    setIsDialogOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gray-500 hover:bg-gray-600 mb-5 cursor-pointer">
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Multimedia</DialogTitle>
                      <DialogDescription>
                        Modifica los campos y confirma los cambios.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Campos del CardContent dentro del diálogo */}
                    <div className="space-y-4 mt-4">
                      <div className="space-y-1">
                        <Label htmlFor="dialog-title">Titulo</Label>
                        <Input
                          id="dialog-title"
                          value={modalTitle}
                          onChange={(e) => setModalTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="dialog-description">Descripción</Label>
                        <Input
                          id="dialog-description"
                          value={modalDescription}
                          onChange={(e) => setModalDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="dialog-link">Link</Label>
                        <Input
                          id="dialog-link"
                          value={modalLink}
                          onChange={(e) => setModalLink(e.target.value)}
                          onFocus={e => e.currentTarget.select()}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">Cancelar</Button>
                      </DialogClose>
                      <Button
                        className="cursor-pointer"
                        onClick={() => {
                          setTitle(modalTitle);
                          setDescription(modalDescription);
                          setLink(modalLink);
                          setIsDialogOpen(false);
                        }}
                      >
                        Confirmar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button className="bg-blue-500 hover:bg-blue-600 mb-5 cursor-pointer">
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bannerContent">
            <Card>
              <CardHeader>
                <CardTitle>BannerContent</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
