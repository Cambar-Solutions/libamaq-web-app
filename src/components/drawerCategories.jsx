"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
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
import { getAllBrandsWithCategories } from "@/services/public/brandService";
import { toast } from "sonner";
import CategoryImageWithFallback from "./CategoryImageWithFallback";

// Los brands ahora se cargarán desde la API


const DrawerCategories = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar marcas desde la API
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const response = await getAllBrandsWithCategories();
        const brandsData = Array.isArray(response) ? response : (response?.data || []);

        // Transformar los datos de la API al formato esperado
        const transformedBrands = brandsData
          .filter(brand => brand.status === "ACTIVE")
          .map(brand => {
            // Filtrar solo categorías activas
            const activeCategories = (brand.brandCategories || [])
              .filter(bc => bc.category?.status === "ACTIVE")
              .map(bc => bc.category);

            return {
              id: brand.id,
              name: brand.name,
              slogan: brand.description || "",
              logo: brand.url || "/placeholder-brand.png",
              color: brand.color || "#0000FF",
              categories: activeCategories
            };
          });

        setBrands(transformedBrands);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
        toast.error(error.message || "Error al cargar marcas");
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const handleBrandClick = (brand) => {
    console.log("🔵 handleBrandClick called with brand:", brand);
    console.log("🔵 Brand categories:", brand.categories);
    console.log("🔵 Brand brandCategories:", brand.brandCategories);
    
    // Si no tiene categories procesadas, procesarlas aquí como fallback
    let processedBrand = { ...brand };
    if (!brand.categories && brand.brandCategories) {
      console.log("🟣 Processing categories in handleBrandClick as fallback");
      const activeCategories = (brand.brandCategories || [])
        .filter(bc => bc.category?.status === "ACTIVE")
        .map(bc => bc.category);
      
      processedBrand.categories = activeCategories;
      console.log("🟣 Processed categories:", activeCategories);
    }
    
    setSelectedBrand(processedBrand);
    setOpen(true);
  };

  // Exponer funciones y estados al componente padre
  useImperativeHandle(ref, () => ({
    handleBrandClick,
    selectedBrand,
    setSelectedBrand,
    open,
    setOpen
  }));

  const goToCategoryPage = (brand, category) => {
    setOpen(false);
    setTimeout(() => {
      // Codificar los nombres para URLs amigables
      const encodedBrand = encodeURIComponent(brand.name.toLowerCase());
      const encodedCategory = encodeURIComponent(category.name.toLowerCase());
      navigate(`/productos/${encodedBrand}/${encodedCategory}`);
    }, 100);
  };

  // genera un slug-friendly para construir la ruta de la imagen
  const getProductImage = (brandKey, productName, extension = 'webp') => {
    const slug = productName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, ""); // elimina caracteres extraños

    // Devolvemos la ruta con la extensión especificada (webp por defecto)
    return `/images/${brandKey}/${slug}.${extension}`;
  };

  return (
    <>
      {/* Menú de marcas */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              Ver marcas
            </NavigationMenuTrigger>
            <NavigationMenuContent className="mt-1 bg-stone-100 shadow-lg">
              {loading ? (
                <div className="p-4 text-center">
                  <p>Cargando marcas...</p>
                </div>
              ) : (
                <ul className=" grid gap-2 p-3 w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {brands.map((brand) => (
                    <li
                      key={brand.id}
                      className="flex justify-center items-center"
                    >
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => {
                            console.log("🔴 Desktop NavigationMenu - Brand clicked:", brand);
                            console.log("🔴 Desktop NavigationMenu - Brand categories:", brand.categories);
                            handleBrandClick(brand);
                          }}
                          className="group flex justify-center items-center rounded-md p-2 no-underline outline-none transition hover:bg-slate-300 focus:bg-slate-300 w-full h-full cursor-pointer"
                          style={{ backgroundColor: brand.color + '10' }} // Color de la marca con baja opacidad
                        >
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-10 w-auto object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-brand.png";
                            }}
                          />
                        </button>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              )}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Drawer con slider de categorías */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <span />
        </DrawerTrigger>
        <DrawerContent className="bg-slate-200 max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh]">
          {selectedBrand && (
            <>
              <div className="p-2 w-full mx-auto">
                {(() => {
                  const categories = selectedBrand.categories || [];
                  console.log("🟡 Rendering categories for brand:", selectedBrand.name);
                  console.log("🟡 Categories array:", categories);
                  console.log("🟡 Categories length:", categories.length);

                  // Calcular el ancho de cada tarjeta según el tamaño de pantalla
                  const cardWidth =
                    window.innerWidth < 640
                      ? 144 // Móvil
                      : window.innerWidth < 768
                        ? 180 // Tablet
                        : 220; // Desktop - Tarjetas más grandes

                  // Calcular cuántas tarjetas caben en una fila
                  const containerWidth = Math.min(window.innerWidth - 40, 900);
                  const cardsPerRow = Math.floor(containerWidth / cardWidth);

                  // Determinar si necesitamos slider
                  // En móvil y tablet, mostrar slider si hay más de 2 tarjetas
                  // En desktop, mostrar slider solo si hay más tarjetas que las que caben en una fila
                  const needsSlider = window.innerWidth < 768
                    ? categories.length > 2
                    : categories.length > cardsPerRow;

                  // Si no hay categorías, mostrar mensaje
                  if (categories.length === 0) {
                    return (
                      <div className="p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">{selectedBrand.name}</h3>
                        <p className="text-gray-500">No hay categorías disponibles para esta marca.</p>
                        <Button
                          onClick={() => {
                            // Cerrar el drawer primero
                            setOpen(false);

                            // Verificar si ya estamos en la página de la tienda
                            const currentPath = window.location.pathname;
                            if (currentPath !== '/tienda') {
                              // Si no estamos en la tienda, navegar a ella después de un pequeño retraso
                              setTimeout(() => {
                                navigate('/tienda');
                              }, 300);
                            }
                          }}
                          className="mt-4"
                          style={{ backgroundColor: selectedBrand.color }}
                        >
                          Volver a la tienda
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <div className="relative">
                      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
                        {selectedBrand.name} - Categorías
                      </h3>

                      <div className="w-full flex items-center justify-center gap-2 px-4">
                        {needsSlider && (
                          <button
                            className="z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                            onClick={() => {
                              const slider = document.getElementById(`slider-${selectedBrand.id}`);
                              if (slider) {
                                const visibleWidth = slider.clientWidth;
                                slider.scrollBy({ left: -visibleWidth, behavior: "smooth" });
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M15 18l-6-6 6-6" />
                            </svg>
                          </button>
                        )}

                        <div
                          id={`slider-${selectedBrand.id}`}
                          className={`flex ${!needsSlider
                            ? "justify-center flex-wrap gap-4"
                            : "overflow-x-auto snap-x snap-mandatory"
                            } scrollbar-hide py-4 px-1 max-w-[1200px]`}
                          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                          {categories.map((category) => (
                            <div
                              key={category.id}
                              onClick={() => goToCategoryPage(selectedBrand, category)}
                              className={`flex-none ${needsSlider ? "snap-center" : ""
                                } cursor-pointer flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-md transition-transform hover:scale-105 ${needsSlider ? "mx-2" : "m-1"} min-w-[140px] max-w-[140px] sm:min-w-[180px] sm:max-w-[180px] md:min-w-[220px] md:max-w-[220px] lg:min-w-[240px] lg:max-w-[240px]`}
                              style={{ borderColor: selectedBrand.color, borderWidth: '1px' }}
                            >
                              <div className="w-full aspect-square flex items-center justify-center mb-4 h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] overflow-hidden">
                                <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] flex items-center justify-center">
                                  <CategoryImageWithFallback
                                    src={category.url}
                                    alt={category.name}
                                    className="absolute max-h-[100px] max-w-[100px] sm:max-h-[120px] sm:max-w-[120px] md:max-h-[140px] md:max-w-[140px] lg:max-h-[160px] lg:max-w-[160px] w-auto h-auto object-contain"
                                    style={{ objectFit: 'contain' }}
                                    brandColor={selectedBrand.color}
                                    iconSize={40}
                                  />
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-center w-full truncate">
                                {category.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {needsSlider && (
                          <button
                            className="z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                            onClick={() => {
                              const slider = document.getElementById(`slider-${selectedBrand.id}`);
                              if (slider) {
                                const visibleWidth = slider.clientWidth;
                                slider.scrollBy({ left: visibleWidth, behavior: "smooth" });
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>
                        )}
                      </div>
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
});

export default DrawerCategories;
