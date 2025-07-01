import React, { useState } from 'react' // Importa useState si lo vas a usar localmente
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react' // Importa ArrowLeft
import BtnResetPassword from '../atoms/BtnResetPassword' // Asegúrate de que este componente exista y sea funcional
import { resetUserPassword } from "@/services/admin/userService"; // Importa la función de servicio
import { jwtDecode } from "jwt-decode"; // Importa jwtDecode
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function EditPassword({
    userInfo, // Puedes necesitar esto para obtener el ID del usuario
    setUserInfo, // Si hay algún dato de usuario que actualizar después del cambio de contraseña (opcional)
    setEditingPassword, // Para volver de la edición de contraseña
    setEditing, // Para volver completamente a las cards si lo deseas
    toast // Para las notificaciones
}) {
    const [newPassword, setNewPassword] = useState("");
    const [showNew, setShowNew] = useState(false);

    const handleReset = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const decoded = jwtDecode(token);
            const userId = decoded.sub;

            if (newPassword.trim() === "") {
                toast.error("La nueva contraseña no puede estar vacía.");
                return;
            }

            const response = await resetUserPassword(userId, newPassword);
            console.log("Contraseña actualizada:", response);
            toast.success("Contraseña actualizada");

            // Vuelve a la vista de "cards" después de guardar la contraseña
            setEditingPassword(false);
            setEditing(false); // También desactiva el modo de edición de perfil si estaba activo
            setNewPassword(""); // Limpia el campo de contraseña
        } catch (error) {
            console.error("Error al guardar cambios de contraseña:", error);
            toast.error("Error al actualizar la contraseña");
        }
    };

    return (
        <>
            {/* Botón para volver a la vista principal (cards) */}
            <button
                onClick={() => {
                    setEditingPassword(false); // Sale del modo edición de contraseña
                    setEditing(true); // Asegura que no está en el modo de edición de perfil
                }}
                className="cursor-pointer absolute top-3 left-3 p-1 hover:bg-stone-200 rounded-full"
                aria-label="Volver al perfil"
            >
                <ArrowLeft size={18} className="text-gray-600" />
            </button>

            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-500">Cambiar contraseña</h2>

            <div className="space-y-4">
                {/* Contraseña nueva */}
                <div className="flex flex-col lg:flex-row bg-white p-5 rounded-lg leading-none gap-y-4 lg:gap-20 justify-around">
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
                    <BtnResetPassword onClick={handleReset} />
                </div>
            </div>
        </>
    )
}