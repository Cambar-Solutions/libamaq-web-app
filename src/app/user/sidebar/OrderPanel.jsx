import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StepperDemo from "@/components/ui/StepperDemo";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GrUserWorker } from "react-icons/gr";
import { FiTrash2 } from "react-icons/fi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


export default function OrderPanel() {
    const products = [
        {
            id: 1,
            name: "Taladro",
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores, autem ab vel dicta voluptatem.",
            price: 12000,
            image:
                "https://imgs.search.brave.com/ET-quFL-OMXVSGSPTb3jgHUkZ2oXBSEOfQZCpS6WdaY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tYWtp/dGFtZWdhc3RvcmUu/Y29tL2Nkbi9zaG9w/L3Byb2R1Y3RzL0F0/b3JuaWxsYWRvck1h/a2l0YUZTMjcwMS53/ZWJwP3Y9MTY3MzM4/MTAxMCZ3aWR0aD05/NTA",
            state: "pendiente",
            color: "bg-orange-500",
        },
        {
            id: 2,
            name: "Atornillador",
            description:
                "Atornillador eléctrico con batería recargable y mango ergonómico. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sapiente porro sunt culpa illo corrupti possimus beatae rem, modi nostrum ipsam doloribus consequuntur iure ab minus sit cum dolorem, eos voluptatum.",
            price: 8500,
            image:
                "https://imgs.search.brave.com/GMoiDdY7Z3VltlPJOxTSbO1RW5XtgfUhyy_0ggZ45qI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTEwQUNnamJhLUwu/anBn",
            state: "Entregado",
            color: "bg-green-500",
        },
        {
            id: 3,
            name: "GSH 16-28 Professional",
            description:
                "El GSH 16-28 con Vibration Control y soporte para llaves de dado hexagonales de 28 mm es la herramienta universal de la gama de martillos demoledores con cable de Bosch. Su potente motor alcanza una impresionante energía de impacto de 41 J y gran rendimiento de remoción de material. El martillo demoledor es muy duradero gracias a sus robustos componentes metálicos. Además, es fácil de usar y produce pocas vibraciones para un manejo perfecto.",
            price: 20000,
            image:
                "https://libamaq.com/card-section/16-28.webp",
            state: "En proceso",
            color: "bg-sky-500",
        },
    ];

    return (
        <>
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-24 sm:mt-32 sticky top-16 z-10 mb-6 p-2 sm:p-3">
                    <div className="m-2 border-b border-gray-400">
                        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-5">PedidosMAQ Disponibles</h1>
                    </div>

                    {products.map((prod) => {
                        return (
                            <Dialog key={prod.id}>
                                <DialogTrigger asChild>
                                    <div className="cursor-pointer p-3 mt-4 bg-white shadow-md rounded-2xl">
                                        <div className="flex flex-col md:flex-row items-start md:items-center">
                                            {/* Imagen del producto - Responsive */}
                                            <img
                                                src={prod.image}
                                                alt={prod.name}
                                                className="w-full h-40 md:w-40 md:h-40 object-contain rounded-xl mx-auto md:mx-0"
                                            />
                                            {/* Información del producto - Responsive */}
                                            <div className="flex flex-col w-full md:w-[20em] px-0 md:px-5 mt-3 md:mt-0">
                                                <h2 className="text-xl md:text-2xl font-semibold">{prod.name}</h2>
                                                <p className="text-sm md:text-base text-gray-700 line-clamp-2 md:line-clamp-4 overflow-hidden mt-1">
                                                    {prod.description}
                                                </p>
                                                {/* Estado del pedido en móvil */}
                                                <div className="flex items-center mt-2 md:hidden">
                                                    <div className={`${prod.color} rounded-full w-3 h-3 mr-2`}></div>
                                                    <span className="text-sm font-medium">{prod.state}</span>
                                                </div>
                                            </div>
                                            {/* Seguimiento de pedido - Solo visible en desktop */}
                                            <div className="hidden md:flex flex-col w-full md:w-[40em] pl-2">
                                                <h2 className="text-lg font-semibold text-gray-700 mb-2">Seguimiento de pedido</h2>
                                                <StepperDemo status={prod.state} />
                                            </div>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle><h2 className="text-xl sm:text-2xl font-semibold">{prod.name}</h2></DialogTitle>
                                        <DialogDescription>
                                            <p className="text-sm sm:text-base text-gray-700 mt-1">
                                                {prod.description}
                                            </p>
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    {/* Seguimiento de pedido en el modal - Vertical */}
                                    <div className="mt-4 mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Seguimiento de pedido</h3>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <StepperDemo status={prod.state} inModal={true} />
                                        </div>
                                    </div>
                                    
                                    {/* Detalles del pedido */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-500">Estado actual:</h3>
                                            <div className={`${prod.color} rounded-full px-3 py-1`}>
                                                <p className="text-xs font-semibold text-white">{prod.state}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-500">Fecha de pedido:</h3>
                                            <p className="text-sm">19/05/2025</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-500">Precio:</h3>
                                            <p className="text-sm font-semibold">${prod.price.toLocaleString()}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-500">Dirección de entrega:</h3>
                                            <p className="text-sm">Col. Ciudad Chapu arcos 07</p>
                                        </div>
                                    </div>
                                    
                                    <DialogFooter className="mt-6">
                                        <Button variant="outline" className="w-full">Ver detalles completos</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )
                    })}
                </div>
            </div>
        </>
    );
}