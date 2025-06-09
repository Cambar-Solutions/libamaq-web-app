import React, { useState, useEffect } from "react";
import { FileText, ChevronRight } from 'lucide-react';
import {
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SheetTerms() {
    return (
        <>
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
        </>
    )
}
