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
                <div className="max-w-7xl mx-auto px-4 mt-32 sticky top-16 z-10 mb-6 p-3">
                    <div className="m-2 border-b border-gray-400">
                        <h1 className="text-3xl font-semibold mb-5">PedidosMAQ Disponibles</h1>
                    </div>

                    {products.map((prod) => {
                        return (
                            <Dialog key={prod.id}>
                                <DialogTrigger asChild>
                                    <div className="cursor-pointer p-3 h-[12em] mt-5 bg-white shadow-md rounded-2xl">
                                        <div className="flex-1 flex justify-between items-center">
                                            <div className="flex">
                                                <img
                                                    src={prod.image}
                                                    alt={prod.name}
                                                    className="w-40 h-40 object-contain rounded-3xl"
                                                />
                                                <div className="flex flex-col px-5 w-[20em]">
                                                    <h2 className="text-2xl font-semibold">{prod.name}</h2>
                                                    <p className="text-gray-700 line-clamp-4 overflow-hidden">
                                                        {prod.description}
                                                    </p>
                                                </div>
                                                <div className="bg-amber-800 w-[40em]">
                                                    <h2 className="text-white text-xl mb-4">Seguimiento de pedido</h2>
                                                    {/* <StepperDemo /> */}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[525px]">
                                    <DialogHeader>
                                        <DialogTitle><h2 className="text-2xl font-semibold">{prod.name}</h2></DialogTitle>
                                        <DialogDescription>
                                            <p className="text-gray-700 line-clamp-4 overflow-hidden">
                                                {prod.description}
                                            </p>                                            </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="flex p-2 gap-2 w-[15em] h-[1em] justify-items-center items-center">
                                            <h1 className="">Estado del pedido:</h1>
                                            <div className={`${prod.color} rounded-2xl p-1`}>
                                                <p className="font-semibold text-white">Pendiente</p>
                                            </div>
                                        </div>
                                        <div className="w-[425px]">
                                            <div className="flex p-2 gap-2 w-[15em] h-auto justify-items-center items-center bg-gray-200 rounded-2xl">
                                                <h1 className="">Se realizó:</h1>
                                                <p>19/05/2025</p>
                                            </div>
                                            <div className="flex p-2 gap-2 w-[15em] h-auto justify-items-center items-center bg-gray-200 rounded-2xl">
                                                <h1 className="">Precio:</h1>
                                                <p>{prod.price}</p>
                                            </div>
                                            <div className="flex p-2 gap-2 w-auto h-auto justify-items-center items-center bg-gray-200 rounded-2xl">
                                                <h1 className="">Dirección de entrega:</h1>
                                                <p>col. Ciudad Chapu arcos 07</p>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>

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