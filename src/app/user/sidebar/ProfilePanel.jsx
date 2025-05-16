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

    // Estados para perfil
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // Estado para ubicación
    const [newLocation, setNewLocation] = useState("");

    const [activeSection, setActiveSection] = useState(null);

    const handleLogout = () => {
        // localStorage.removeItem("authToken");
        navigate("/", { replace: true });
    };

    // Handlers de “Cancelar/Limpiar”
    const handleCancelProfile = () => {
        setEmail("");
        setPassword("");
        setConfirm("");
    };

    const handleCancelLocation = () => {
        setNewLocation("");
    };

    const handleSectionChange = (value) => {
        setActiveSection(prev => (prev === value ? null : value));
    };

    return (
        <>
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-6xl mx-auto px-4 mt-32 sticky top-16 z-10 bg-stone-200 shadow-md rounded-lg mb-6 p-4">
                    <div className="flex items-center">
                        <div className="ml-10 flex bg-blue-800 p-4 rounded-full w-30 h-30 items-center justify-center">
                            <GrUserWorker size={80} className="text-white" />
                        </div>
                        <div className="ml-4 flex flex-col">
                            <p className="text-gray-700 text-3xl font-semibold">Jonathan</p>
                            <p className="text-gray-500 text-sm">jony@gmail.com</p>
                        </div>
                        <div className="ml-auto mr-10">
                            <Button onClick={handleLogout} className="bg-red-700 hover:bg-red-900 cursor-pointer">Cerrar sesión</Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 mt-3 sticky top-16 z-10 bg-stone-200 shadow-md rounded-lg mb-6 p-3">
                    <Accordion type="single" collapsible onValueChange={handleSectionChange} value={activeSection} className="w-full px-2">
                        <AccordionItem value="perfil">
                            <AccordionTrigger
                                className={`text-xl p-2 transition-colors rounded2xl ${activeSection === "perfil" ? "bg-blue-100 text-blue-800 rounded-t-2xl rounded-b-none" : "hover:bg-blue-50"}`}>
                                <h1 className="text-xl">Actualizar Perfil</h1>
                            </AccordionTrigger>
                            <AccordionContent
                                className={`p-4 transition-colors rounded-b-2xl ${activeSection === "perfil" ? "bg-blue-100" : ""}`}>
                                <div className="flex gap-10 justify-center">
                                    <div>
                                        <Label className="mb-2">Correo</Label>
                                        <Input
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="bg-white w-[20em]" />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Contraseña</Label>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="bg-white w-[20em]" />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Confirmar contraseña</Label>
                                        <Input
                                            type="password"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            className="bg-white w-[20em]" />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-5">
                                    <Button
                                        onClick={handleCancelProfile}
                                        className="bg-gray-500 hover:bg-gray-900 text-white py-3 rounded-md flex items-center justify-center transition-colors">Cancelar</Button>
                                    <Button className="bg-blue-500 hover:bg-blue-800 text-white py-3 rounded-md flex items-center justify-center transition-colors">Confirmar</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="ubicacion">
                            <AccordionTrigger
                                className={`text-xl p-2 transition-colors rounded2xl ${activeSection === "ubicacion" ? "bg-blue-100 text-blue-800 rounded-t-2xl rounded-b-none" : "hover:bg-blue-50"}`}>
                                <h1 className="text-xl">Actualizar Ubicación</h1>
                            </AccordionTrigger>
                            <AccordionContent
                                className={`p-4 transition-colors rounded-b-2xl ${activeSection === "ubicacion" ? "bg-blue-100" : ""}`}>
                                <div className="flex gap-10 justify-center">
                                    <div>
                                        <Label className="mb-2">Nueva ubicación</Label>
                                        <Input
                                            value={newLocation}
                                            onChange={e => setNewLocation(e.target.value)}
                                            className="bg-white w-[20em]" />
                                    </div>

                                </div>
                                <div className="flex gap-3 justify-end mt-5">
                                    <Button
                                        onClick={handleCancelLocation}
                                        className="bg-gray-500 hover:bg-gray-900 text-white py-3 rounded-md flex items-center justify-center transition-colors">Cancelar</Button>
                                    <Button className="bg-blue-500 hover:bg-blue-800 text-white py-3 rounded-md flex items-center justify-center transition-colors">Confirmar</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>

                </div>
            </div>
        </>
    );
}