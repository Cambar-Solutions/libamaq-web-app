import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ShieldUser } from 'lucide-react'; // Icono para ir a editar contraseña

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BtnDelete from "../atoms/BtnDelete";
import BtnSave from "../atoms/BtnSave";
import { updateUserProfile, resetUserPassword } from "@/services/admin/userService";
import { jwtDecode } from "jwt-decode";
import BtnResetPassword from "../atoms/BtnResetPassword";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function EditProfile({ userInfo, setUserInfo, setEditing, setEditingPassword, toast }) { // Recibe setEditingPassword
    const [newName, setNewName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const decoded = jwtDecode(token);
            const userId = decoded.sub;

            const updatedData = {
                name: newName || userInfo.name,
                lastName: newLastName || userInfo.lastName,
                email: newEmail || userInfo.email,
            };

            const updatedUser = await updateUserProfile(userId, updatedData);

            console.log("Respuesta actualizada:", updatedUser);
            toast.success("Perfil actualizado");

            setUserInfo({
                name: updatedUser.data.name,
                lastName: updatedUser.data.lastName,
                email: updatedUser.data.email
            });

            // Vuelve a la vista de "cards" después de guardar
            setEditing(false);
            setEditingPassword(false); // Asegúrate de que también se desactiva la edición de contraseña
        } catch (error) {
            console.error("Error al actualizar:", error);
            toast.error("Error al actualizar el perfil");
        }
    };

    // La lógica de `handleReset` debería moverse a `EditPassword`
    // const handleReset = async () => { ... };


    return (
        <div>
            {/* Botón volver a cards */}
            <button
                onClick={() => {
                    setEditing(false); // Sale del modo edición de perfil
                    setEditingPassword(false); // Asegura que no se está editando la contraseña
                }}
                className="cursor-pointer absolute top-3 left-3 p-1 hover:bg-stone-200 rounded-full"
                aria-label="Volver"
            >
                <ArrowLeft size={18} className="text-gray-600" />
            </button>

            {/* Botón para ir a editar contraseña */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => {
                            setEditing(false); // Sale del modo edición de perfil actual
                            setEditingPassword(true); // Activa el modo edición de contraseña
                        }}
                        className="cursor-pointer absolute top-3 right-3 p-1 hover:bg-blue-100 rounded-full border-2 border-gray-500 transition-all duration-300"
                        aria-label="Cambiar Contraseña"
                    >
                        <ShieldUser size={25} className="text-gray-600" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                    <p>Cambiar Contraseña</p>
                </TooltipContent>
            </Tooltip>


            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-500">Editar Perfil</h2>

            <div className="space-y-4">
                {/* Nombre */}
                <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                    <div className="flex flex-col">
                        <Label className="text-sm text-gray-600 mb-1">Nombre actual:</Label>
                        <span className="font-medium mb-3">{userInfo.name}</span>
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

                {/* Apellido */}
                <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                    <div className="flex flex-col">
                        <Label className="text-sm text-gray-600 mb-1">Apellido actual:</Label>
                        <span className="font-medium mb-3">{userInfo.lastName}</span>
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm text-gray-600 mb-1">Apellido nuevo:</Label>
                        <Input
                            value={newLastName}
                            onChange={e => setNewLastName(e.target.value)}
                            placeholder="Ingresa el nuevo apellido"
                        />
                    </div>
                </div>

                {/* Correo */}
                <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                    <div className="flex flex-col">
                        <Label className="text-sm text-gray-600 mb-1">Correo actual:</Label>
                        <span className="font-medium mb-3">{userInfo.email}</span>
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

                <div className="flex w-full justify-end">
                    <BtnSave onClick={handleUpdate} />
                </div>
            </div>
        </div>
    )
}