"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const brands = [
  { name: "Bosch", slogan: "Innovación para tu vida.", logo: "/logo_bosch.png" },
  { name: "Makita", slogan: "Herramientas eléctricas.", logo: "/makita.png" },
  { name: "Husqvarna", slogan: "Productos de construcción.", logo: "/husq.png" },
  { name: "Honda", slogan: "Productos de fuerza.", logo: "/honda-fuerza.png" },
  { name: "Marshalltown", slogan: "Herramientas para concreto.", logo: "/marshalltown.png" },
  { name: "Mpower", slogan: "Productos de máxima calidad.", logo: "/m-power.webp" },
  { name: "Cipsa", slogan: "Construimos más que obras...", logo: "/cipsa.avif" },
];

const brandDetails = {
  bosch: {
    name: "Bosch",
    description:
      "Líder mundial en herramientas eléctricas profesionales y accesorios. Bosch ofrece soluciones innovadoras y de alta calidad para todo tipo de aplicaciones.",
    products: [
      "Rotomartillos y taladros",
      "Amoladoras",
      "Herramienta para madera",
      "Herramientas de medición",
      "Herramienta a Batería 12V y 18V",
      "Limpieza y jardineria",
    ],
    image: "/logo_bosch.png",
  },
  makita: {
    name: "Makita",
    description:
      "Reconocida por su durabilidad y rendimiento excepcional. Makita ofrece una amplia gama de herramientas eléctricas y accesorios para profesionales.",
    products: [
      "Taladros inalámbricos",
      "Amoladoras",
      "Herramienta para madera",
      "Herramientas de medición",
      "Herramienta a Batería 12V y 18V",
      "Limpieza y jardineria",
    ],
    image: "/makita.png",
  },
  husqvarna: {
    name: "Husqvarna",
    description:
      "Especialistas en equipos para exteriores y construcción. Husqvarna combina potencia y precisión en cada una de sus herramientas.",
    products: [
      "Cortadoras de concreto",
      "Apisonadoras o bailarinas",
      "Placas Vibratorias",
      "Rodillos Vibratorios",
      "Desbaste y pulido de concreto",
      "Barrenadores",
      "Accesorios y Herramientas de diamante",
    ],
    image: "/husq.png",
  },
  honda: {
    name: "Honda",
    description:
      "Líder en motores y equipos de fuerza. Honda ofrece productos confiables y eficientes para diversas aplicaciones.",
    products: ["Generadores", "Motobombas 2 y 3 pulgadas", "Motores de 6.5hp, 9hp y 14hp"],
    image: "/honda-fuerza.png",
  },
  marshalltown: {
    name: "Marshalltown",
    description:
      "Expertos en herramientas manuales para construcción. Marshalltown es sinónimo de calidad y precisión en el acabado.",
    products: [
      "Llanas tipo avión",
      "Llanas tipo fresno",
      "Texturizadores 1/2, 3/4 y 1 pulgada",
      "Regla Vibratoria",
      "Llanas Manuales",
      "Orilladores",
      "Barredoras de concreto",
      "Cortadores de concreto",
    ],
    image: "/marshalltown.png",
  },
  mpower: {
    name: "Mpower",
    description:
      "Innovación y calidad en herramientas eléctricas. Mpower ofrece soluciones efectivas para profesionales y entusiastas.",
    products: [
      "Motores a gasolina 6.5, 9, 15hp.",
      "Motobombas 2 y 3 pulgadas.",
      "Generadores de luz de 3,500w a 8000w.",
      "Soldadora 200 A.",
      "Discos de 14 in para corte de concreto",
      "Accesorios",
    ],
    image: "/m-power.webp",
  },
  cipsa: {
    name: "Cipsa",
    description:
      "Cipsa es especialistas en herramientas y maquinaria para construcción.",
    products: [
      "Revolvedoras para concreto de 1 y 2 sacos",
      "Vibradores a gasolina para concreto",
      "Rodillos Vibratorios",
      "Apisonadores o bailarinas",
      "Torres de ilumiación",
      "Soldadoras",
      "Bombas para concreto",
    ],
    image: "/cipsa.avif",
  },
};

export default function DrawerCategories() {
  const [open, setOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const navigate = useNavigate();

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    setOpen(true);
  };

  const goToCategoryPage = (brandKey, productName) => {
    const brandName = brandDetails[brandKey].name;
    setOpen(false);
    setTimeout(() => {
      navigate(`/productos/${brandName}/${productName}`);
    }, 100);
  };

  // genera un slug-friendly para construir la ruta de la imagen
  const getProductImage = (brandKey, productName) => {
    const slug = productName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, ""); // elimina caracteres extraños
    return `/images/${brandKey}/${slug}.png`;
  };

  return (
    <>
      {/* Menú de marcas */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-blue-500 text-white hover:bg-blue-700 hover:text-white transition-colors duration-600">
              Ver marcas
            </NavigationMenuTrigger>
            <NavigationMenuContent className="mt-1 bg-stone-100 shadow-lg">
              <ul className=" grid gap-2 p-3 w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {brands.map((brand) => (
                  <li
                    key={brand.name}
                    className="flex justify-center items-center"
                  >
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleBrandClick(brand)}
                        className="group flex justify-center items-center rounded-md p-2 no-underline outline-none transition hover:bg-slate-300 focus:bg-slate-300 w-full h-full cursor-pointer"
                        title={brand.name}
                      >
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-10 w-auto object-contain"
                        />
                      </button>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Drawer con slider de categorías */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <span />
        </DrawerTrigger>
        <DrawerContent className="bg-slate-200">
          {selectedBrand && (
            <>
              <div className="p-2 w-full mx-auto">
                {(() => {
                  const brandKey = selectedBrand.name.toLowerCase();
                  const products = brandDetails[brandKey].products;
                  const cardWidth =
                    window.innerWidth < 640
                      ? 144
                      : window.innerWidth < 768
                        ? 164
                        : 184;
                  const totalWidth = products.length * cardWidth;
                  const containerWidth = Math.min(
                    window.innerWidth - 40,
                    800
                  );
                  const needsSlider = totalWidth > containerWidth;

                  return (
                    <div className="relative">
                      {needsSlider && (
                        <button
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                          onClick={() => {
                            const c = document.getElementById(
                              `slider-${brandKey}`
                            );
                            c?.scrollBy({ left: -200, behavior: "smooth" });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                      )}
                      <div
                        id={`slider-${brandKey}`}
                        className={`flex ${!needsSlider
                          ? "justify-center flex-wrap"
                          : "overflow-x-auto snap-x snap-mandatory"
                          } scrollbar-hide py-2 ${needsSlider ? "px-8" : "px-2"
                          }`}
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {products.map((product, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              goToCategoryPage(brandKey, product)
                            }
                            className={`flex-none ${needsSlider ? "snap-center" : ""
                              } cursor-pointer flex flex-col items-center justify-center rounded-lg bg-white p-3 shadow-sm transition-transform hover:scale-105 mx-2 min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] md:min-w-[180px] md:max-w-[180px]`}
                          >
                            <div className="w-full aspect-square flex items-center justify-center mb-2">
                              <img
                                src={getProductImage(brandKey, product)}
                                alt={product}
                                className="max-h-[85%] max-w-[85%] object-contain"
                              />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-center w-full truncate">
                              {product}
                            </span>
                          </div>
                        ))}
                      </div>
                      {needsSlider && (
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                          onClick={() => {
                            const c = document.getElementById(
                              `slider-${brandKey}`
                            );
                            c?.scrollBy({ left: 200, behavior: "smooth" });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
              <DrawerFooter />
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
