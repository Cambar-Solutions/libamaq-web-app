import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrUserWorker } from "react-icons/gr";
import { TbPasswordUser } from "react-icons/tb";
import { FaMapLocationDot } from "react-icons/fa6";

export default function ProfilePanel() {
    const navigate = useNavigate();

    // Estados para perfil
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // Estado para ubicación
    const [newLocation, setNewLocation] = useState("");

    const [activeSection, setActiveSection] = useState(null);

    // Handlers de “Cancelar/Limpiar”
    const handleCancelProfile = () => {
        setEmail("");
        setPassword("");
        setConfirm("");
    };

    const handleCancelLocation = () => {
        setNewLocation("");
    };

    return (
        <>
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-6xl mx-auto px-4 mt-32 sticky top-16 z-10 bg-gradient-to-t from-sky-50 to-gray-50 shadow-md rounded-lg mb-6 p-4">
                    <div className="flex items-center">
                        <div className="ml-10 flex bg-blue-800/80 p-4 rounded-full w-30 h-30 items-center justify-center">
                            <GrUserWorker size={80} className="text-white" />
                        </div>
                        <div className="ml-4 flex flex-col">
                            <p className="text-gray-700 text-3xl font-semibold">Jonathan</p>
                            <p className="text-gray-500 text-sm">jony@gmail.com</p>
                        </div>
                        <div className="ml-auto mr-10">
                            
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 mt-3 sticky top-16 z-10 shadow-md rounded-lg mb-6 p-3 bg-gradient-to-b from-gray-50 via-sky-100 to-sky-700">
                    <Tabs defaultValue="perfil" className="">
                        <TabsList className="gap-1 p-1 bg-white">
                            <TabsTrigger
                                value="perfil"
                                className=" cursor-pointer transition-colors duration-300 hover:bg-blue-100 data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:underline-offset-2">
                                Actualizar Perfil
                            </TabsTrigger>
                            <TabsTrigger
                                value="ubicacion"
                                className=" cursor-pointer transition-colors duration-300 hover:bg-blue-100 data-[state=active]:underline data-[state=active]:decoration-blue-500 data-[state=active]:text-blue-500 data-[state=active]:underline-offset-2">
                                Actualizar Ubicación
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="perfil" className="p-4 bg-white/10 hover:bg-white/30 transition-colors duration-300 rounded-2xl ">
                            <div className="flex w-[25em] gap-2 items-center ml-5 text-blue-950">
                                <div className="w-10 h-10 rounded-full justify-items-center">
                                    <TbPasswordUser size={34} />
                                </div>
                                <div className="border-b-2 border-blue-950/10">
                                    <h1 className="text-sm">Gestiona la información de tu cuenta</h1>
                                </div>
                            </div>
                            <div className="text-blue-950 flex gap-10 justify-center items-center mt-5">
                                <div>
                                    <Label className="mb-1 ">Correo</Label>
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white w-[20em] border-2 !focos:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white w-[20em] border-2"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">Confirmar contraseña</Label>
                                    <Input
                                        type="password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="bg-white w-[20em] border-2"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-10">
                                <Button
                                    onClick={handleCancelProfile}
                                    className="cursor-pointer bg-gray-500 hover:bg-gray-900 text-white py-3 rounded-md transition-colors duration-500"
                                >
                                    Cancelar
                                </Button>
                                <Button className="cursor-pointer bg-blue-700 hover:bg-blue-900 text-white py-3 rounded-md transition-colors duration-500">
                                    Confirmar
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="ubicacion" className="p-4 bg-white/10 hover:bg-white/30 transition-colors duration-300 rounded-2xl">
                            <div className="flex w-[25em] gap-2 items-center ml-5 text-blue-950">
                                <div className="w-10 h-10 rounded-full justify-items-center">
                                    <FaMapLocationDot size={34} />
                                </div>
                                <div className="border-b-2 border-blue-950/10">
                                    <h1 className="text-sm">Gestiona la ubicación para entrega de pedidos</h1>
                                </div>
                            </div>
                            <div className="flex gap-10 justify-center mt-5">
                                <div className="text-blue-950">
                                    <Label className="mb-1">Nueva ubicación</Label>
                                    <Input
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        className="bg-white w-[20em] border-2"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-10">
                                <Button
                                    onClick={handleCancelLocation}
                                    className="cursor-pointer bg-gray-500 hover:bg-gray-900 text-white py-3 rounded-md transition-colors duration-500"
                                >
                                    Cancelar
                                </Button>
                                <Button className="cursor-pointer bg-blue-700 hover:bg-blue-900 text-white py-3 rounded-md transition-colors duration-500">
                                    Confirmar
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}