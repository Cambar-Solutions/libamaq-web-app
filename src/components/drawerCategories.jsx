// src/components/DrawerCategories.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

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
    navigate(`/productos/${brandName}/${productName}`);
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
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                {brands.map((brand) => (
                  <li key={brand.name} className="flex items-center space-x-2">
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleBrandClick(brand)}
                        className="group flex items-center space-x-2 rounded-md p-2 no-underline outline-none transition hover:bg-muted/50 focus:bg-muted/50"
                      >
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-6 w-6 object-contain rounded"
                        />
                        <div>
                          <div className="text-sm font-medium">{brand.name}</div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {brand.slogan}
                          </p>
                        </div>
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
              <DrawerHeader>
                <DrawerTitle>{selectedBrand.name}</DrawerTitle>
                <DrawerDescription>{selectedBrand.slogan}</DrawerDescription>
              </DrawerHeader>

              {/* Swiper con productos de la marca */}
              <div className="p-4">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={16}
                  slidesPerView={2}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                  }}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 2500, disableOnInteraction: false }}
                >
                  {brandDetails[selectedBrand.name.toLowerCase()].products.map(
                    (product, idx) => (
                      <SwiperSlide
                        key={idx}
                        onClick={() =>
                          goToCategoryPage(
                            selectedBrand.name.toLowerCase(),
                            product.name
                          )
                        }
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-2 shadow-sm transition-transform hover:scale-105"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-20 w-auto object-contain mb-2"
                        />
                        <span className="text-sm font-medium text-center">
                          {product.name}
                        </span>
                      </SwiperSlide>
                    )
                  )}
                </Swiper>
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cerrar</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
