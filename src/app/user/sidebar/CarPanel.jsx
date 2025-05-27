import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import NumberStepper from "@/components/ui/NumberStepper";
import { CreditCard } from "lucide-react";
import { FaRegEye } from "react-icons/fa6";



export default function CarPanel() {
    // Simula una lista de productos
    const products = [
        {
            id: 1,
            name: "Taladro",
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores, autem ab vel dicta voluptatem.",
            price: 12000,
            image:
                "https://imgs.search.brave.com/ET-quFL-OMXVSGSPTb3jgHUkZ2oXBSEOfQZCpS6WdaY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tYWtp/dGFtZWdhc3RvcmUu/Y29tL2Nkbi9zaG9w/L3Byb2R1Y3RzL0F0/b3JuaWxsYWRvck1h/a2l0YUZTMjcwMS53/ZWJwP3Y9MTY3MzM4/MTAxMCZ3aWR0aD05/NTA",
        },
        {
            id: 2,
            name: "Atornillador",
            description:
                "Atornillador eléctrico con batería recargable y mango ergonómico.",
            price: 8500,
            image:
                "https://imgs.search.brave.com/GMoiDdY7Z3VltlPJOxTSbO1RW5XtgfUhyy_0ggZ45qI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTEwQUNnamJhLUwu/anBn",
        },
        // añade más si quieres...
    ];

    // Cantidad por producto: { [id]: qty }
    const [quantities, setQuantities] = useState(
        products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
    );

    // Handler genérico
    const handleQtyChange = (id, newQty) => {
        setQuantities((q) => ({ ...q, [id]: newQty }));
    };

    // estado de selección: { [id]: boolean }
    const [selected, setSelected] = useState({});

    const selectedProducts = products.filter(p => selected[p.id]);
    const anySelected = selectedProducts.length > 0;

    // ¿están todos seleccionados?
    const allSelected =
        products.length > 0 &&
        products.every((p) => selected[p.id]);

    // handler para “Seleccionar todos”
    function toggleSelectAll() {
        if (allSelected) {
            // deseleccionar todo
            setSelected({});
        } else {
            // seleccionar todo
            const newSel = {};
            products.forEach((p) => {
                newSel[p.id] = true;
            });
            setSelected(newSel);
        }
    }

    // handler para cada tarjeta
    function toggleOne(id) {
        setSelected((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    return (
        <>
            <div className="flex min-h-full bg-stone-100 pb-10 pt-22">
                <div className="w-[80%] flex flex-col px-6 bg-stone-100 rounded-lg p-3">
                    <div className="border-b border-gray-400 mb-6">
                        <h1 className="text-3xl font-semibold">CarritoMAQ</h1>
                        <label className="inline-flex items-center text-blue-600 hover:underline cursor-pointer w-[20em] text-sm mb-6">
                            <Input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleSelectAll}
                                className="mr-2 w-3 h-3 cursor-pointer"
                            />
                            Seleccionar todos los productos
                        </label>
                    </div>

                    {/* Card de los productos */}
                    {products.map((prod) => {
                        const qty = quantities[prod.id];
                        const totalPrice = prod.price * qty;
                        return (
                            <div
                                key={prod.id}
                                className="w-full h-auto flex items-start p-5 bg-white rounded-2xl mb-3 shadow-sm hover:shadow-md duration-500"
                            >
                                {/* Checkbox de la tarjeta */}
                                <div className="mr-4 pt-2">
                                    <Input
                                        type="checkbox"
                                        checked={!!selected[prod.id]}
                                        onChange={() => toggleOne(prod.id)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </div>

                                {/* Contenido de la tarjeta */}
                                <div className="flex-1 flex justify-between items-center">
                                    <div className="flex">
                                        <img
                                            src={prod.image}
                                            alt={prod.name}
                                            className="w-40 h-40 object-contain"
                                        />
                                        <div className="flex flex-col px-5 w-[20em]">
                                            <h2 className="text-2xl font-semibold">{prod.name}</h2>
                                            <p className="text-gray-700 line-clamp-2 overflow-hidden">
                                                {prod.description}
                                            </p>
                                            <div className="flex justify-around">
                                                <button className="items-center justify-items-center cursor-pointer mt-2 text-blue-600 hover:underline self-start">
                                                    <FiTrash2 size={18} className="inline-block mr-1" />
                                                    Eliminar
                                                </button>
                                                <button className="items-center justify-items-center cursor-pointer mt-2 text-blue-600 hover:underline self-start">
                                                    <FaRegEye  size={18} className="inline-block mr-1" />
                                                    Ver producto
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <NumberStepper min={1}
                                            max={10}
                                            step={1}
                                            value={qty}
                                            onChange={(v) => handleQtyChange(prod.id, v)} />
                                        <p className="text-2xl">${totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="relative w-[25%] ml-3 px-4 mt-15 top-16 z-10 bg-white shadow-md rounded-lg mb-15 p-3">
                    <h1 className="mt-3 text-lg text-gray-800 mb-4">Resumen de la compra</h1>
                    {anySelected ? (
                        <div>
                            <div className="border-b border-gray-400 pb-6">

                                {selectedProducts.map((prod) => {
                                    const qty = quantities[prod.id];
                                    return (
                                        <div key={prod.id} className="flex justify-between mb-2">
                                            <span>
                                                {prod.name} x {qty}
                                            </span>
                                            <span>${(prod.price * qty).toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-3 text-lg font-semibold py-6">
                                <span>Total:</span>
                                <span>
                                    $
                                    {selectedProducts
                                        .reduce((sum, p) => sum + p.price * quantities[p.id], 0)
                                        .toLocaleString()}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-0 px-3 w-full mb-3">
                                <Button className="cursor-pointer w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-1">
                                    <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
                                    <span className="text-sm lg:text-base">Comprar</span>
                                </Button>
                            </div>
                        </div>
                    ) : (<p className="text-gray-600 italic">Seleccione los productos deseados para calcular el total a pagar.</p>)}
                </div>
            </div>



        </>
    );
}