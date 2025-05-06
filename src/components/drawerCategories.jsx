// src/components/DrawerCategories.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Eliminamos las importaciones de Swiper

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
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
  { name: "Bosch",        slogan: "Innovación para tu vida.",     logo: "/logo_bosch.png" },
  { name: "Makita",       slogan: "Herramientas eléctricas.",     logo: "/makita.png" },
  { name: "Husqvarna",    slogan: "Productos de construcción.",     logo: "/husq.png" },
  { name: "Honda",        slogan: "Productos de fuerza.",          logo: "/honda-fuerza.png" },
  { name: "Marshalltown", slogan: "Herramientas para concreto.",   logo: "/marshalltown.png" },
  { name: "Mpower",       slogan: "Productos de máxima calidad.",  logo: "/m-power.webp" },
  { name: "Cipsa",        slogan: "Construimos más que obras...", logo: "/cipsa.avif" },
];

const brandDetails = {
  bosch: {
    name: "Bosch",
    products: [
      { name: "Rotomartillos y taladros", image: "/categorias/bosch/roto.png" },
      { name: "Amoladoras",               image: "/categorias/bosch/amoladora.png" },
      { name: "Herramienta para madera",  image: "/categorias/bosch/madera.png" },
      { name: "Herramientas de medición", image: "/categorias/bosch/medicion.png" },
      { name: "Batería 12V y 18V",        image: "/categorias/bosch/inalambrico.png" },
      { name: "Jardinería",               image: "/categorias/bosch/jardin.png" },
    ],
  },
  makita: {
    name: "Makita",
    products: [
      { name: "Taladros inalámbricos", image: "/categorias/makita/inalambrico.png" },
      { name: "Amoladoras",           image: "/categorias/makita/amoladora.png" },
      { name: "Madera",               image: "/categorias/makita/madera.png" },
      { name: "Medición",             image: "/categorias/makita/medicion.png" },
      { name: "Batería",              image: "/categorias/makita/bateria.png" },
      { name: "Jardinería",           image: "/categorias/makita/jardin.png" },
    ],
  },
  honda: {
    name: "Honda",
    products: [
      { name: "Generadores",             image: "/categorias/honda/generadores.jpg" },
      { name: "Motobombas 2 y 3\"",      image: "/categorias/honda/motobombas.jpg" },
      { name: "Motores 6.5hp, 9hp, 14hp",image: "/categorias/honda/motores.jpg" },
    ],
  },
  cipsa: {
    name: "Cipsa",
    products: [
      { name: "Revolvedoras",    image: "/categorias/cipsa/revolvedoras.jpg" },
      { name: "Vibradores",      image: "/categorias/cipsa/vibradores.jpg" },
      { name: "Rodillos",        image: "/categorias/cipsa/rodillos.jpg" },
      { name: "Apisonadores",    image: "/categorias/cipsa/apisonadores.jpg" },
      { name: "Torres de luz",   image: "/categorias/cipsa/torres.jpg" },
      { name: "Soldadoras",      image: "/categorias/cipsa/soldadoras.jpg" },
      { name: "Bombas concreto", image: "/categorias/cipsa/bombas.jpg" },
    ],
  },
  marshalltown: {
    name: "Marshalltown",
    products: [
      { name: "Llanas avión",       image: "/categorias/marshalltown/llanas-avion.png" },
      { name: "Llanas fresno",      image: "/categorias/marshalltown/llanas-fresno.png" },
      { name: "Texturizadores",     image: "/categorias/marshalltown/texturizadores.png" },
      { name: "Regla vibratoria",   image: "/categorias/marshalltown/regla.png" },
      { name: "Llanas manuales",    image: "/categorias/marshalltown/llanas-manuales.png" },
      { name: "Orilladores",        image: "/categorias/marshalltown/orilladores.png" },
      { name: "Barredoras",         image: "/categorias/marshalltown/barredoras.png" },
      { name: "Cortadores",         image: "/categorias/marshalltown/cortadores.png" },
    ],
  },
  mpower: {
    name: "Mpower",
    products: [
      { name: "Motores gasolina",   image: "/categorias/mpower/motores.jpg" },
      { name: "Motobombas",         image: "/categorias/mpower/motobombas.jpg" },
      { name: "Generadores",        image: "/categorias/mpower/generadores.jpg" },
      { name: "Soldadora 200A",     image: "/categorias/mpower/soldadora.jpg" },
      { name: "Discos corte",       image: "/categorias/mpower/discos.jpg" },
      { name: "Accesorios",         image: "/categorias/mpower/accesorios.jpg" },
    ],
  },
  husqvarna: {
    name: "Husqvarna",
    products: [
      { name: "Cortadoras",       image: "/categorias/husqvarna/cortadoras.jpg" },
      { name: "Apisonadoras",     image: "/categorias/husqvarna/apisonadoras.jpg" },
      { name: "Placas vibratorias", image: "/categorias/husqvarna/placas.jpg" },
      { name: "Rodillos",         image: "/categorias/husqvarna/rodillos.jpg" },
      { name: "Desbaste concreto",image: "/categorias/husqvarna/desbaste.jpg" },
      { name: "Barrenadores",     image: "/categorias/husqvarna/barrenadores.jpg" },
      { name: "Accesorios diamante", image: "/categorias/husqvarna/accesorios.jpg" },
    ],
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
    // Cerrar el drawer antes de navegar
    setOpen(false);
    // Pequeño retraso para que la animación de cierre sea visible
    setTimeout(() => {
      navigate(`/productos/${brandName}/${productName}`);
    }, 100);
  };

  return (
    <>
      {/* Menú de marcas */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-white text-black hover:bg-black hover:text-white border-2 border-gray-900 transition-colors duration-600">
              Ver marcas
            </NavigationMenuTrigger>
            <NavigationMenuContent className="mt-1">
              <ul className="grid gap-2 p-3 w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {brands.map((brand) => (
                  <li key={brand.name} className="flex justify-center items-center">
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleBrandClick(brand)}
                        className="group flex justify-center items-center rounded-md p-2 no-underline outline-none transition hover:bg-slate-100 focus:bg-slate-100 w-full h-full"
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

      {/* Drawer que muestra las categorías en Swiper */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <span />
        </DrawerTrigger>
        <DrawerContent>
          {selectedBrand && (
            <>
              {/* Eliminamos el header con el título y descripción */}

              {/* Contenido principal - Slider adaptativo */}
              <div className="p-2 w-full mx-auto">
                {/* Usamos useEffect para controlar la visibilidad de los botones de navegación */}
                {(() => {
                  // Obtenemos los productos de la marca seleccionada
                  const products = brandDetails[selectedBrand.name.toLowerCase()].products;
                  const cardWidth = window.innerWidth < 640 ? 144 : window.innerWidth < 768 ? 164 : 184; // Ancho de card + margen
                  const totalWidth = products.length * cardWidth;
                  const containerWidth = Math.min(window.innerWidth - 40, 800); // Ancho estimado del contenedor
                  const needsSlider = totalWidth > containerWidth;
                  
                  return (
                    <div className="relative">
                      {/* Botones de navegación - Solo visibles si se necesita slider */}
                      {needsSlider && (
                        <button 
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                          onClick={() => {
                            const container = document.getElementById(`slider-${selectedBrand.name}`);
                            if (container) {
                              container.scrollBy({ left: -200, behavior: 'smooth' });
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Contenedor - Centrado si no necesita slider */}
                      <div 
                        id={`slider-${selectedBrand.name}`}
                        className={`flex ${!needsSlider ? 'justify-center flex-wrap' : 'overflow-x-auto snap-x snap-mandatory'} scrollbar-hide py-2 ${needsSlider ? 'px-6' : 'px-2'}`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {/* Elementos del slider */}
                        {products.map((product, idx) => (
                          <div
                            key={idx}
                            onClick={() => goToCategoryPage(selectedBrand.name.toLowerCase(), product.name)}
                            className={`flex-none ${needsSlider ? 'snap-center' : ''} cursor-pointer flex flex-col items-center justify-center rounded-lg bg-white p-3 shadow-sm transition-transform hover:scale-105 mx-2 min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] md:min-w-[180px] md:max-w-[180px]`}
                          >
                            <div className="w-full aspect-square flex items-center justify-center mb-2">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="max-h-[85%] max-w-[85%] object-contain"
                              />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-center w-full truncate">{product.name}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Botón siguiente - Solo visible si se necesita slider */}
                      {needsSlider && (
                        <button 
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                          onClick={() => {
                            const container = document.getElementById(`slider-${selectedBrand.name}`);
                            if (container) {
                              container.scrollBy({ left: 200, behavior: 'smooth' });
                            }
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

              <DrawerFooter>
               
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
