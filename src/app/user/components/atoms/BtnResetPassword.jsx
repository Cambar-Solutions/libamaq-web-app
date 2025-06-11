import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';

export default function BtnResetPassword({ onClick }) {
    return (
        <div>
            <Button onClick={onClick}
                className="cursor-pointer bg-indigo-500 hover:bg-blue-800 transition-colors duration-300">
                Cambiar contraseña
            </Button>
        </div>
    )
}
