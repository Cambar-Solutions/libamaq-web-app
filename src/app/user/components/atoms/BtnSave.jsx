import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';


export default function BtnSave({ onClick }) {
    return (
        <div>
            <Button onClick={onClick}
                className="cursor-pointer bg-blue-500 hover:bg-blue-800 transition-colors duration-300">
                Guardar cambios
            </Button>
        </div>
    )
}
