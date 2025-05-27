import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const order = {
  id: 1,
  name: 'Taladro percutor Bosch',
  description: 'Taladro percutor 500 W con mango antideslizante lo mejor para tu casa y el mejor uso, tan sencillo que cualquiera puede agarrarlo',
  quantity: 2,
  img: 'https://example.com/bosch-drill.jpg',
  deliveredAt: '10 de mayo',
  address: 'Sor Juana Inés de La Cruz Nº exterior 24, Temixco, Morelos',
  status: 'Entregado',
};

const summary = {
  products: 318,
  discount: 168,
  shipping: 64,
  total: 213,
  card: 'Visa Débito ****6220',
};

export default function Shopping() {
  return (
    <div className="w-full bg-stone-100 min-h-screen pb-10 pt-8">
      <div className="max-w-6xl mx-auto px-4 grid gap-6
                      grid-cols-1 md:grid-cols-3">
        {/* Breadcrumb */}
        <div className="md:col-span-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/user-profile"
                  className="flex items-center text-gray-700 hover:text-blue-700"
                >
                  Compras
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/user-shopping"
                  className="flex items-center text-gray-700 hover:text-blue-700"
                >
                  Estado de la compra
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Card 1: Cabecera del pedido */}
        <div className="bg-white rounded-2xl shadow p-6 md:col-span-2">
            <span className="text-sm font-medium text-green-600">{order.status}</span>
          <h3 className="mt-2 text-2xl font-semibold text-gray-800">
            Llegó el {order.deliveredAt} <span className="text-green-600">⚡ FULL</span>
          </h3>
          <p className="mt-4 text-gray-700">
            Entregamos tu paquete a las 16:43 hs en{" "}
            <strong>{order.address}</strong>.
          </p>
        </div>

        {/* Card 2: Detalle de estado */}
        <div className="bg-white rounded-2xl shadow p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{order.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{order.description} </p>
              <p className="text-sm text-gray-500 mt-1">Cantidad: {order.quantity}</p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline">Devolver gratis</Button>
            <Button className="ml-3">Volver a comprar</Button>
          </div>
        </div>

        {/* Card 3: Resumen de la compra */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Detalle de la compra</h4>
          <div className="flex justify-between text-gray-600">
            <span>Productos (2)</span>
            <span>${summary.products.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>– ${summary.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Envío</span>
            <span>${summary.shipping.toLocaleString()}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold text-gray-800">
            <span>Total</span>
            <span>${summary.total.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-500">{summary.card}</p>
          <button className="w-full text-left text-sm text-blue-600 hover:underline">
            Detalles de pago y envío
          </button>
        </div>
      </div>
    </div>
  );
}
