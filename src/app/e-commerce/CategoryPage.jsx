import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Nav from "./Nav";

// 🔥 Asegúrate de importar tu objeto desde otro archivo si lo separaste
import { simulatedProductsByBrand } from "@data/simulatedProducts";

export default function CategoryPage() {
  const { brand, category } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  

  const handleBack = () => navigate(-1);

  const simulatedItems =
    simulatedProductsByBrand[brand?.toLowerCase()]?.[category] || [];

  const filteredItems = simulatedItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Nav />

      <div className="min-h-screen bg-white flex flex-col px-4">
        <div className="max-w-6xl w-full mx-auto mt-16">
          {/* Encabezado fijo */}
          <div className="sticky top-0 z-10 bg-white pb-4 pt-2">
            {/* Volver */}
            <div className="mb-2">
              <button
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:underline hover:opacity-80 transition mt-8"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a ver marcas
              </button>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 text-center">
              {brand} - {category}
            </h1>

            {/* Búsqueda */}
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contenedor de productos */}
        <div className="bg-gray-100 rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-[90%] mx-auto flex-grow">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white flex flex-col justify-between min-h-[240px] rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 ease-in-out overflow-hidden w-full max-w-[90%] sm:max-w-full mx-auto"
                  >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.text}</p>
                  </div>

                  <div className="p-4">
                    <button className="w-full mt-4 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200">
                      Ver detalles
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 text-sm pt-6">
                No se encontraron productos para “{searchTerm}”.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
