import React from "react";
import { Link } from "react-router-dom";


export default function CardsDetail({ selected }) {
    return (
        <>
            <div className="max-w-6xl mx-auto px-4 grid gap-6 grid-cols-1 md:grid-cols-3">
                {/* 1) Cabecera */}
                <div className="bg-white rounded-2xl shadow p-6 md:col-span-2">
                    <span className="text-sm font-medium text-green-600">{selected.status}</span>
                    <h3 className="mt-2 text-2xl font-semibold text-gray-800">
                        Llegó el {selected.deliveredAt}
                    </h3>
                    <p className="mt-4 text-gray-700">
                        Entregamos tu paquete en <strong>{selected.address}</strong>
                    </p>
                </div>

                {/* 2) Detalle del pedido */}
                <div className="bg-white rounded-2xl shadow p-6 md:col-span-2 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">{selected.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{selected.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Cantidad: 1</p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Link to="/tienda">
                            <button className="cursor-pointer rounded-2xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">Volver a comprar</button>
                        </Link>

                    </div>
                </div>

                {/* 3) Resumen de compra */}
                <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Detalle de la compra</h4>
                    <div className="flex justify-between text-gray-600">
                        <span>Productos</span>
                        <span>${(selected.price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>– $0</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span>$64</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold text-gray-800">
                        <span>Total</span>
                        <span>${(selected.price + 64).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500">Método de Pago: {selected.pay}</p>
                </div>
            </div>
        </>
    )
}