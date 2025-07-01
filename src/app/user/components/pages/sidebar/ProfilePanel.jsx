import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GrUserWorker } from "react-icons/gr";
import { SquarePen } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import EditProfile from "../../forms/EditProfile";
import EditPassword from "../../forms/EditPassword"; // ¡Importa EditPassword!
import SheetTerms from "../../organisms/SheetTerms";
import DialogAddresses from "../../organisms/DialogAddresses";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DialogGenerateQR from "../../organisms/DialogGenerateQR";

export default function ProfilePanel({ openLocationDialog = false, onCloseLocationDialog, userInfo, setUserInfo }) {
    const [isDialogOpen, setIsDialogOpen] = useState(openLocationDialog);
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    // Si el padre dice que abra el diálogo, lo abrimos:
    useEffect(() => {
        if (openLocationDialog) {
            setIsDialogOpen(true);
        }
    }, [openLocationDialog]);

    const variants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    if (!userInfo?.name || !userInfo?.email) {
        return (
            <div className="text-gray-500 text-center mt-8">
                Cargando información del perfil…
            </div>
        );
    }

    // Función para renderizar el contenido basado en el estado
    const renderContent = () => {
        if (!editing && !editingPassword) { // Vista inicial: cards
            return (
                <motion.div
                    key="cards"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="flex flex-col w-full h-60 rounded-lg bg-stone-50"
                >
                    {/* — Card de Direcciones — */}
                    <DialogAddresses
                        isDialogOpen={isDialogOpen}
                        setIsDialogOpen={setIsDialogOpen}
                        onCloseLocationDialog={onCloseLocationDialog}
                        setEditing={setEditing}
                    />

                    {/* QR CODE */}
                    <DialogGenerateQR />

                    {/* — Hoja de Términos y condiciones — */}
                    <SheetTerms />
                </motion.div>
            );
        } else if (editing && !editingPassword) { // Vista de edición de perfil
            return (
                <motion.div
                    key="edit-form"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="h-full relative flex flex-col w-[90%] rounded-lg p-6 ml-12"
                >
                    {/* Editar Perfil */}
                    <EditProfile
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                        setEditing={setEditing} // Para volver a la vista de cards
                        setEditingPassword={setEditingPassword} // Para ir a la vista de edición de contraseña
                        toast={toast}
                    />
                </motion.div>
            );
        } else if (editingPassword) { // Vista de edición de contraseña
            return (
                <motion.div
                    key="edit-password-form"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="h-full relative flex flex-col w-[90%] rounded-lg p-6 ml-12"
                >
                    {/* Editar Contraseña */}
                    <EditPassword
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                        setEditingPassword={setEditingPassword} // Para volver de la edición de contraseña
                        setEditing={setEditing} // Asegúrate de que `editing` también se maneje si es necesario
                        toast={toast}
                    />
                </motion.div>
            );
        }
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            setEditing(true); // Entra al modo edición de perfil
                                            setEditingPassword(false); // Asegúrate de que no estamos editando contraseña
                                        }}
                                        className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full cursor-pointer transition-colors duration-300"
                                        aria-label="Editar"
                                    >
                                        <SquarePen size={18} className="text-gray-400" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                    <p>Editar Perfil</p>
                                </TooltipContent>
                            </Tooltip>
                            <p className="text-gray-700 text-3xl font-semibold">{userInfo.name} {userInfo.lastName}</p>
                            <p className="text-gray-500 text-sm">{userInfo.email}</p>
                        </div>
                    </div>

                    {/* === Sección con animación === */}
                    <div className="flex-1 overflow-y-auto max-w-5xl mx-auto mt-3 top-16 z-10">
                        <AnimatePresence mode="wait" initial={false}>
                            {renderContent()} {/* Llama a la función que retorna el JSX condicional */}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}