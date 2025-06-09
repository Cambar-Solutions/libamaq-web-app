import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';


export default function BtnSave({ setEditing }) {
    return (
        <div>
            <Button onClick={() => { setEditing(false); }}
                className="cursor-pointer bg-blue-500 hover:bg-blue-800 transition-colors duration-300">
                Guardar
            </Button>
        </div>
    )
}
