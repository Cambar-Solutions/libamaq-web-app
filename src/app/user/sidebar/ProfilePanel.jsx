import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { GrUserWorker } from "react-icons/gr";

export default function ProfilePanel() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // localStorage.removeItem("authToken");
        navigate("/", { replace: true });
    };

    return (
        <>
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-6xl mx-auto px-4 mt-32 sticky top-16 z-10 bg-stone-200 shadow-md rounded-lg mb-6 p-3">
                    <div className="flex items-center">
                        <div className="flex bg-blue-800 p-4 rounded-full w-30 h-30 items-center justify-center">
                            <GrUserWorker size={80} className="text-white" />
                        </div>
                        <div className="ml-4 flex flex-col">
                            <p className="text-gray-700 text-3xl font-semibold">Jonathan</p>
                            <p className="text-gray-500 text-sm">jony@gmail.com</p>
                        </div>
                        <div className="ml-auto">
                            <Button onClick={handleLogout} className="bg-red-700 hover:bg-red-900 cursor-pointer">Cerrar sesión</Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 mt-3 sticky top-16 z-10 bg-stone-200 shadow-md rounded-lg mb-6 p-3">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <h1 className="text-xl">Actualizar Perfil</h1>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex gap-10 justify-center">
                                    <div>
                                        <Label className="mb-2">Correo</Label>
                                        <Input className="bg-white w-[20em]" />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Contraseña</Label>
                                        <Input className="bg-white w-[20em]" />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Confirmar contraseña</Label>
                                        <Input className="bg-white w-[20em]" />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-5">
                                    <Button>Confirmar</Button>
                                    <Button>Cancelar</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>


                    </Accordion>

                </div>
            </div>
        </>
    );
}