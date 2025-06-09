import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button'

export default function BtnDelete({ setEditing }) {
    return (
        <div>
            <Button onClick={() => setEditing(false)} className="cursor-pointer bg-gray-500 hover:bg-gray-800 transition-colors duration-300">
                Cancelar
            </Button>
        </div>
    )
}
