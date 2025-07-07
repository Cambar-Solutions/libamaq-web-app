import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { MapPin, ChevronRight } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BtnSave from "../atoms/BtnSave";
import useLocationStore from "@/stores/useLocationStore";

export default function DialogAddresses({ isDialogOpen, setIsDialogOpen, onCloseLocationDialog }) {
    const { currentLocation, setLocation } = useLocationStore();
    const [newLocation, setNewLocation] = useState("");
    const [iframeKey, setIframeKey] = useState(0); // Para forzar recarga del iframe

    // Cuando se abre el diálogo, limpia el input
    useEffect(() => {
        if (isDialogOpen) setNewLocation("");
    }, [isDialogOpen]);

    // Función para guardar la nueva dirección
    const handleSave = () => {
        if (newLocation.trim()) {
            setLocation(newLocation);
            setIframeKey(prev => prev + 1); // Forzar recarga del iframe
        }
        setIsDialogOpen(false);
        if (onCloseLocationDialog) onCloseLocationDialog();
    };

    // Construir la URL del iframe (sin API key)
    const mapQuery = encodeURIComponent(newLocation.trim() ? newLocation : currentLocation);
    const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;

    return (
        <>
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) onCloseLocationDialog();
                }}
            >
                <DialogTrigger asChild>
                    <button className="h-[50%] flex items-center justify-between bg-white hover:bg-gray-200 transition-colors duration-400 p-4 w-full rounded-t-lg">
                        <div className="flex items-center space-x-4">
                            <MapPin className="w-8 h-8 ml-5 text-blue-500" />
                            <div>
                                <h3 className="font-medium text-gray-800 text-lg text-start">Direcciones</h3>
                                <p className="text-sm text-gray-500">
                                    Agrega y administra tus direcciones de envío
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[725px]">
                    <DialogHeader>
                        <DialogTitle className="flex text-2xl gap-1 items-center">
                            <MapPin className="w-6 h-6 text-blue-500" />
                            Direcciones
                        </DialogTitle>
                        <DialogDescription>
                            En esta sección, puede modificar la dirección de entrega.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
                        <div className="flex flex-col space-y-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right font-medium">
                                    Dirección Actual
                                </Label>
                                <Input id="location" value={currentLocation} disabled className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newLocation" className="text-right font-medium">
                                    Nueva Dirección
                                </Label>
                                <Input id="newLocation" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Escribe tu nueva dirección" className="col-span-3" />
                            </div>
                        </div>

                        <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-xl">
                            <iframe
                                key={iframeKey}
                                src={mapSrc}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <BtnSave onClick={handleSave} />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}