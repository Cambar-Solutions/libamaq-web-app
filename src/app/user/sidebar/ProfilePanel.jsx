import React, { useState, useEffect } from "react";
import { getCustomerUsers } from "@/services/admin/userService";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrUserWorker } from "react-icons/gr";
import { MapPin, FileText, ChevronRight, SquarePen, ArrowLeft } from 'lucide-react';
import {
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from 'lucide-react';


export default function ProfilePanel({ openLocationDialog = false, onCloseLocationDialog }) {
    const [isDialogOpen, setIsDialogOpen] = useState(openLocationDialog);

    const [user, setUser] = useState({ name: "null", email: "null@gmail.com" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);

    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    // Si el padre dice que abra el diálogo, lo abrimos:
    useEffect(() => {
        if (openLocationDialog) {
            setIsDialogOpen(true);
        }
    }, [openLocationDialog]);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            console.warn("No hay userId en localStorage");
            setLoading(false);
            return;
        }

        getCustomerUsers()
            .then((list) => {
                // asume que 'id' viene como número o string en los objetos
                const me = list.find(u => u.id.toString() === userId.toString());
                if (me) {
                    setUser({ name: me.name, email: me.email });
                } else {
                    console.warn("Usuario no encontrado en la lista de clientes");
                }
            })
            .catch((err) => console.error("Error cargando usuarios:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                Cargando perfil…
            </div>
        );
    }

    const variants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-full bg-neutral-100 min-h-screen pt-22">
                    <div className="justify-items-center px-4 top-16 z-10 mb-6 p-4">
                        <div className="flex bg-blue-800/80 p-4 rounded-full w-30 h-30 items-center justify-center shadow-md">
                            <GrUserWorker size={80} className="text-white" />
                        </div>
                        <div className="relative flex flex-col bg-white mt-5 w-full lg:w-[30%] text-center rounded-2xl shadow-sm p-4">
                            <button
                                onClick={() => setEditing(true)}
                                className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full cursor-pointer transition-colors duration-300"
                                aria-label="Editar"
                            >
                                <SquarePen size={18} className="text-gray-400" />
                            </button>
                            <p className="text-gray-700 text-3xl font-semibold">{user.name}</p>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                    </div>

                    {/* === Sección con animación === */}
                    <div className="flex-1 overflow-y-auto max-w-5xl mx-auto mt-3 top-16 z-10"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {!editing ? (
                                <motion.div
                                    key="cards"
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col w-full h-60 shadow-md rounded-lg bg-stone-50"
                                >
                                    {/* — Card de Direcciones — */}
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
                                                <DialogTitle className="text-2xl">Direcciones</DialogTitle>
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
                                                <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700">Guardar</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* — Card de Términos y condiciones — */}
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <button className="h-[50%] flex items-center justify-between bg-white hover:bg-gray-200 transition-colors duration-400 p-4 w-full rounded-b-lg">
                                                <div className="flex items-center space-x-4">
                                                    <FileText className="w-8 h-8 ml-5 text-blue-500" />
                                                    <div>
                                                        <h3 className="font-medium text-gray-800 text-lg">Términos y condiciones</h3>
                                                        <p className="text-sm text-gray-500">Revisa las políticas y acuerdos</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </SheetTrigger>
                                        <SheetContent>
                                            <SheetHeader className="pb-0 gap-0 mt-6">
                                                <SheetTitle className="text-xl">Términos y condiciones</SheetTitle>
                                                <SheetDescription>
                                                    Es responsabilidad del usuario leer y comprender estos Términos y Condiciones.
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="grid gap-4 px-5 text-sm pt-0 text-justify w-full justify-between">
                                                <div className="grid grid-cols-3">
                                                    <p className="col-span-3 text-gray-700">
                                                        <strong>1. Aceptación de los Términos:</strong> Al acceder y utilizar los productos y servicios de Libamaq, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros productos o servicios.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-3 items-start gap-4">
                                                    <p className="col-span-3 text-gray-700">
                                                        <strong>2. Descripción del Servicio:</strong> Libamaq se especializa en la venta y alquiler de herramientas de construcción. Nos esforzamos por ofrecer productos de alta calidad y servicios confiables a nuestros clientes.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-3 items-start gap-4">
                                                    <p className="col-span-3 text-gray-700">
                                                        <strong>3. Uso Apropiado:</strong> Usted acepta utilizar nuestros productos y servicios de manera legal y de acuerdo con estos Términos y Condiciones. No debe utilizar nuestros productos para fines ilegales o no autorizados.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-3 items-start gap-4">
                                                    <p className="col-span-3 text-gray-700">
                                                        <strong>4. Propiedad Intelectual:</strong> Todos los contenidos incluidos en este sitio web, como textos, gráficos, logotipos, imágenes, así como el software utilizado, son propiedad de Libamaq o de sus proveedores de contenido y están protegidos por las leyes de propiedad intelectual.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-3 items-end mt-28">
                                                    <Label className="col-span-3 inline-flex items-center text-blue-600 hover:underline cursor-pointer">
                                                        <Input
                                                            type="checkbox"
                                                            className="mr-2 w-5 h-5"
                                                        />
                                                        Acepto todos los derechos y vender mi alma a Libamaq
                                                    </Label>
                                                </div>
                                            </div>
                                            <SheetFooter />
                                        </SheetContent>
                                    </Sheet>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="edit-form"
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="h-full relative flex flex-col w-[90%] rounded-lg p-6 ml-12"
                                >
                                    {/* Botón volver en form */}
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="cursor-pointer absolute top-3 left-3 p-1 hover:bg-stone-200 rounded-full"
                                        aria-label="Volver"
                                    >
                                        <ArrowLeft size={18} className="text-gray-600" />
                                    </button>

                                    <h2 className="text-2xl font-semibold text-center mb-4 text-gray-500">Editar Perfil</h2>

                                    <div className="space-y-4">
                                        {/* Nombre */}
                                        <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                                            <div className="flex flex-col">
                                                <Label className="text-sm text-gray-600 mb-1">Nombre actual:</Label>
                                                <span className="font-medium mb-3">{user.name}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <Label className="text-sm text-gray-600 mb-1">Nombre nuevo:</Label>
                                                <Input
                                                    value={newName}
                                                    onChange={e => setNewName(e.target.value)}
                                                    placeholder="Ingresa el nuevo nombre"
                                                />
                                            </div>
                                        </div>

                                        {/* Correo */}
                                        <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                                            <div className="flex flex-col">
                                                <Label className="text-sm text-gray-600 mb-1">Correo actual:</Label>
                                                <span className="font-medium mb-3">{user.email}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <Label className="text-sm text-gray-600 mb-1">Correo nuevo:</Label>
                                                <Input
                                                    type="email"
                                                    value={newEmail}
                                                    onChange={e => setNewEmail(e.target.value)}
                                                    placeholder="Ingresa el nuevo correo"
                                                />
                                            </div>
                                        </div>

                                        {/* Contraseña */}
                                        <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                                            {/* Contraseña actual */}
                                            <div className="flex flex-col">
                                                <Label className="text-sm text-gray-600 mb-1">Contraseña actual:</Label>
                                                <div className="relative items-center">
                                                    <Input
                                                        type={showCurrent ? "text" : "password"}
                                                        placeholder={showCurrent ? "dawdwadaw" : "•••••"}
                                                        disabled
                                                        className="pr-10 w-60"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrent(v => !v)}
                                                        className="absolute inset-y-0 right-3 flex items-center pt-1 text-gray-500 hover:text-gray-700 px-0 "
                                                        aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Contraseña nueva */}
                                            <div className="flex flex-col">
                                                <Label className="text-sm text-gray-600 mb-1">Contraseña nueva:</Label>
                                                <div className="relative">
                                                    <Input
                                                        type={showNew ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        placeholder="Ingresa la nueva contraseña"
                                                        className="pr-10 w-60"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNew(v => !v)}
                                                        className="absolute inset-y-0 right-3 flex items-center pt-1 text-gray-500 hover:text-gray-700"
                                                        aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex justify-end space-x-3 mt-6">
                                        <Button onClick={() => setEditing(false)} className="">
                                            Cancelar
                                        </Button>
                                        <Button onClick={() => { setEditing(false); }}
                                            className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                                            Guardar
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

        </>
    );
}





