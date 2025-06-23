import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { MapPin, ChevronRight } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BtnSave from "../atoms/BtnSave";

export default function DialogAddresses({ isDialogOpen, setIsDialogOpen, onCloseLocationDialog }) {
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
                                <Input id="location" placeholder="San Antón" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newLocation" className="text-right font-medium">
                                    Nueva Dirección
                                </Label>
                                <Input id="newLocation" placeholder="Escribe tu nueva dirección" className="col-span-3" />
                            </div>
                        </div>

                        <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.4661262655997!2d-99.17959492373906!3d18.91969495427647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce7481d3aed4c3%3A0x9f4e9f76e3752738!2sBlvd.%20Paseo%20Cuauhn%C3%A1huac%201742%2C%20Puente%20Blanco%2C%2062577%20Jiutepec%2C%20Mor.!5e0!3m2!1ses!2smx!4v1715572500000!5m2!1ses!2smx"
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
                        <BtnSave />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}