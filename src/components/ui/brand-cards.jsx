"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const brands = [
  { name: "Bosch", slogan: "Innovación para tu vida.", logo: "/logo_bosch.png" },
  { name: "Makita", slogan: "Herramientas electricas.", logo: "/makita.png" },
  { name: "Husqvarna", slogan: "Productos de construcción.", logo: "/husq.png" },
  { name: "Honda", slogan: "Productos de fuerza.", logo: "/honda-fuerza.png" },
  { name: "Marshalltown", slogan: "Herramientas para concreto", logo: "/marshalltown.png" },
  { name: "Mpower", slogan: "Productos de máxima calidad.", logo: "/m-power.webp" },
  { name: "Cipsa", slogan: "Construimos más que obras...", logo: "/cipsa.avif" },
];

const BrandCards = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [visibleBrands, setVisibleBrands] = useState([...brands, ...brands, ...brands, ...brands]);

  // Detecta cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ajusta la cantidad de marcas visibles en función del tamaño de pantalla
  useEffect(() => {
    if (screenWidth < 768) {
      setVisibleBrands([...brands, ...brands, ...brands]); // Más repeticiones en móviles
    } else {
      setVisibleBrands([...brands, ...brands, ...brands, ...brands]); // Más repeticiones en pantallas grandes
    }
  }, [screenWidth]);

  return (
    <div id="brand-cards" className="relative w-full overflow-hidden py-10 bg-gray-50">
      {/* Título de la sección */}
      <div className="text-center mb-6 select-none">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Marcas con las que trabajamos</h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Da clic en cualquier marca para conocer más detalles sobre sus productos.
        </p>
      </div>

      {/* Carrusel de marcas */}
      <motion.div
        className={`flex items-center flex-nowrap ${
          screenWidth >= 1024 ? "gap-10" : "gap-4"
        } w-[200%]`}
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: screenWidth < 768 ? 20 : 70, // MUCHO MÁS LENTO en PC
          ease: "linear"
        }}
      >
        {visibleBrands.map((brand, index) => (
          <Link
            key={index}
            to={`/marcas/${brand.name.toLowerCase()}#brand-cards`}
            className="flex flex-col items-center min-w-[100px] sm:min-w-[140px] md:min-w-[180px] max-w-[220px]"
          >
            <img
              alt={`${brand.name} Logo`}
              src={brand.logo}
              className="object-contain rounded-lg h-[60px] sm:h-[80px] md:h-[110px] w-auto"
            />
            <p className="mt-2 text-center text-[9px] sm:text-xs md:text-sm text-gray-700 font-medium">
              {brand.slogan}
            </p>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default BrandCards;
