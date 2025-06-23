import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BtnDelete from "../atoms/BtnDelete";
import BtnSave from "../atoms/BtnSave";
import { updateUserProfile, resetUserPassword } from "@/services/admin/userService";
import { jwtDecode } from "jwt-decode";
import BtnResetPassword from "../atoms/BtnResetPassword";

export default function EditProfile({ userInfo, setUserInfo, setEditing, toast }) {
    const [newName, setNewName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const decoded = jwtDecode(token);
            const userId = decoded.sub;

            const updatedData = {
                name: newName || userInfo.name,
                lastName: newLastName || userInfo.lastName,
                email: newEmail || userInfo.email,
            };

            const updatedUser = await updateUserProfile(userId, updatedData);

            // Verifica qué devuelve exactamente:
            console.log("Respuesta actualizada:", updatedUser);
            toast.success("Perfil actualizado");

            // Asegúrate de que el objeto tiene `name`, `lastName` y `email`
            setUserInfo({
                name: updatedUser.data.name,
                lastName: updatedUser.data.lastName,
                email: updatedUser.data.email
            });

            setEditing(false);
        } catch (error) {
            console.error("Error al actualizar:", error);
            toast.error("Error al actualizar el perfil");
        }
    };

    const handleReset = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const decoded = jwtDecode(token);
            const userId = decoded.sub;

            // Validar antes de enviar
            if (newPassword.trim() !== "") {
                const response = await resetUserPassword(userId, newPassword);
                console.log("Contraseña actualizada:", response);
                toast.success("Contraseña actualizada");
            }

            // También podrías actualizar nombre o correo aquí (si tienes otro servicio)
            // await updateUserProfile(userId, { name: newName, email: newEmail });

            // Volver al perfil
            setEditing(false);
        } catch (error) {
            console.error("Error al guardar cambios:", error);
            toast.error("Error al actualizar la contraseña ");
        }
    };



    return (
        <div>
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

                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-500">Cambiar contraseña</h2>
                {/* Contraseña */}
                <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
                    {/* Contraseña actual */}
                    <div className="flex flex-col">
                        <Label className="text-sm text-gray-600 mb-1">Contraseña actual:</Label>
                        <div className="relative items-center">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                placeholder={showCurrent ? "Contraseña123." : "•••••"}
                                disabled
                                className="pr-10 w-60"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(v => !v)}
                                className="absolute inset-y-0 right-3 flex items-center pt-1 text-gray-500 hover:text-gray-700 px-0 "
                                aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
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
                                {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    {/* <BtnDelete setEditing={setEditing} /> */}
                    <BtnResetPassword onClick={handleReset} />
                </div>
            </div>
        </div>
    )
}
