import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GrUserWorker } from "react-icons/gr";


const orders = [
    {
        id: 1,
        name: 'Taladro percutor Bosch',
        brand: 'Bosch',
        description: 'Taladro percutor 500 W con mango antideslizante',
        price: 1299.00,
        img: 'https://example.com/bosch-drill.jpg',
        deliveredAt: '10 de mayo, 2025',
        status: 'Entregado'
    },
    {
        id: 2,
        name: 'Sierra circular Makita',
        brand: 'Makita',
        description: 'Sierra circular 185 mm con guía láser',
        price: 1799.00,
        img: 'https://example.com/makita-saw.jpg',
        deliveredAt: '8 de mayo, 2025',
        status: 'Entregado'
    },
    {
        id: 3,
        name: 'Motosierra Husqvarna',
        brand: 'Husqvarna',
        description: 'Motosierra de poda 35 cm³, liviana y potente',
        price: 2599.00,
        img: 'https://example.com/husqvarna-chainsaw.jpg',
        deliveredAt: '12 de mayo, 2025',
        status: 'En tránsito'
    },
    {
        id: 4,
        name: 'Paleta de albañil Marshaltown',
        brand: 'Marshaltown',
        description: 'Paleta angular de acero inoxidable 280 mm',
        price: 299.00,
        img: 'https://example.com/marshaltown-trowel.jpg',
        deliveredAt: '9 de mayo, 2025',
        status: 'Entregado'
    },
    {
        id: 5,
        name: 'Nivel de burbuja Cipsa',
        brand: 'Cipsa',
        description: 'Nivel torpedo 32 cm con imán lateral',
        price: 149.00,
        img: 'https://example.com/cipsa-level.jpg',
        deliveredAt: '11 de mayo, 2025',
        status: 'Entregado'
    }
];

export default function BuyPanel() {
    const navigate = useNavigate();

    return (
        <>
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-30">
                <Link to="/user-shopping">
                    <div className="max-w-6xl mx-auto px-4 grid gap-6">
                        {orders.map(order => (
                            <div
                                key={order.id}

                                className="bg-white rounded-lg shadow p-4 flex items-center"
                            >
                                {/* Imagen */}
                                <img
                                    src={order.img}
                                    alt={order.name}
                                    className="w-24 h-24 object-cover rounded"
                                />

                                {/* Detalles */}
                                <div className="flex-1 ml-4">
                                    <h2 className="text-lg font-semibold">{order.name}</h2>
                                    <p className="text-sm text-gray-600">{order.brand}</p>
                                    <p className="mt-1 text-gray-700">{order.description}</p>
                                    <div className="mt-2 flex items-center text-sm text-gray-600">
                                        <span>Entregado: </span>
                                        <span className="ml-1 font-medium">{order.deliveredAt}</span>
                                    </div>
                                </div>

                                {/* Precio & Estado */}
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-semibold">${order.price.toLocaleString()}</span>
                                    <span
                                        className={`
                  mt-2 px-2 py-1 rounded-full text-xs font-medium
                  ${order.status === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                `}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Link>

            </div>
        </>
    );
}