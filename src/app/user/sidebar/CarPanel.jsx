import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import NumberStepper from "@/components/ui/NumberStepper";
import { CreditCard } from "lucide-react";
import { FaRegEye } from "react-icons/fa6";

export default function CarPanel() {
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
  ];

  const [quantities, setQuantities] = useState(
    products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );
  const [selected, setSelected] = useState({});

  const selectedProducts = products.filter((p) => selected[p.id]);
  const anySelected = selectedProducts.length > 0;
  const allSelected =
    products.length > 0 && products.every((p) => selected[p.id]);

  function handleQtyChange(id, v) {
    setQuantities((q) => ({ ...q, [id]: v }));
  }
  function toggleSelectAll() {
    if (allSelected) return setSelected({});
    const sel = {};
    products.forEach((p) => (sel[p.id] = true));
    setSelected(sel);
  }
  function toggleOne(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  // extract summary JSX to reuse
  const Summary = (
    <>
      <h2 className="text-lg text-gray-800 mb-4">Resumen de la compra</h2>
      {anySelected ? (
        <>
          <div className="border-b border-gray-400 pb-6 space-y-2">
            {selectedProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex justify-between mb-2 text-gray-700"
              >
                <span>
                  {prod.name} x {quantities[prod.id]}
                </span>
                <span>
                  $
                  {(prod.price * quantities[prod.id]).toLocaleString()}
                </span>
              </div>
            ))}
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
          <div className="absolute bottom-4 left-0 px-3 w-full">
            <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-1">
              <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="text-sm lg:text-base">Comprar</span>
            </Button>
          </div>
        </>
      ) : (
        <p className="text-gray-600 italic">
          Seleccione los productos deseados para calcular el total a pagar.
        </p>
      )}
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-full bg-stone-100 pb-10 pt-22">
      {/* PRODUCTOS PANEL */}
      <div className="order-2 lg:order-1 w-full lg:w-[80%] flex flex-col px-6 bg-stone-100 rounded-lg p-3">
        {/* header */}
        <div className="border-b border-gray-400 mb-6">
          <h1 className="text-3xl font-semibold">Mi Carrito</h1>
          <label className="inline-flex items-center text-blue-600 hover:underline cursor-pointer text-sm mb-5">
            <Input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="mr-2 w-3 h-3 cursor-pointer"
            />
            Seleccionar todos los productos
          </label>
        </div>

        {/* summary ONLY on mobile */}
        <div className="bg-white shadow-md rounded-lg p-3 px-4 mb-6 lg:hidden">
          {Summary}
        </div>

        {/* product cards */}
        {products.map((prod) => {
          const qty = quantities[prod.id];
          const totalPrice = prod.price * qty;
          return (
            <div
              key={prod.id}
              className="w-full flex flex-col sm:flex-row items-start p-5 bg-white rounded-2xl mb-3 shadow-sm hover:shadow-md duration-500 overflow-hidden"
            >
              <div className="mr-0 sm:mr-4 pt-2">
                <Input
                  type="checkbox"
                  checked={!!selected[prod.id]}
                  onChange={() => toggleOne(prod.id)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full sm:w-40 h-40 object-contain rounded-lg mt-4 sm:mt-0"
              />
              <div className="flex-1 flex flex-col justify-between px-0 sm:px-5 mt-4 sm:mt-0">
                <div>
                  <h2 className="text-2xl font-semibold">{prod.name}</h2>
                  <p className="text-gray-700 mt-2 line-clamp-2">
                    {prod.description}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <button className="flex items-center text-blue-600 hover:underline">
                      <FiTrash2 size={18} className="mr-1" />
                      Eliminar
                    </button>
                    <Link to="/tienda">
                      <button className="flex items-center text-blue-600 hover:underline">
                        <FaRegEye size={18} className="mr-1" />
                        Ver producto
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <NumberStepper
                    min={1}
                    max={10}
                    value={qty}
                    onChange={(v) => handleQtyChange(prod.id, v)}
                  />
                  <p className="text-2xl">${totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY PANEL on desktop only */}
      <div className="hidden lg:block order-1 lg:order-2 w-[25%] ml-3 px-4 mt-13 h-[26em] top-16 z-10 bg-white shadow-md rounded-lg p-3 relative">
        {Summary}
      </div>
    </div>
  );
}
