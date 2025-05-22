import React, { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination, Autoplay } from 'swiper';
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useImagePreload } from "../hooks/useImagePreload";

export default function Carousel({ images, onImagesLoaded, className = "" }) {
  // Usamos el hook personalizado para precargar las imágenes
  const { isComplete, progress } = useImagePreload(images, {
    onComplete: onImagesLoaded
  });
  
  // Memoizamos los alt texts para evitar recreaciones innecesarias
  const getAltText = useMemo(() => {
    return (img) => {
      if (img === "/bosch-taladro.jpg") return "LIBAMAQ herramientas Bosch";
      if (img === "/makita-DDA460Z.jpg") return "LIBAMAQ herramientas Makita";
      if (img === "/bosch-power.jpg") return "LIBAMAQ herramientas eléctricas Bosch";
      return "LIBAMAQ herramientas y maquinaria para construcción";
    };
  }, []);
  return (
    <div className={`w-full max-w-5xl mx-auto py-8 ${className}`}>
      {!isComplete && (
        <div className="flex justify-center items-center h-20 mb-4">
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="ml-3 text-sm text-gray-500">{progress}%</span>
        </div>
      )}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className={`rounded-lg ${!isComplete ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
      >
        {images.map((img, index) => (
          <SwiperSlide
            key={index}
            className="flex justify-center items-center"
          >
            <img
              src={img}
              alt={getAltText(img)}
              className="w-full h-96 object-cover rounded-lg"
              loading="eager" // Forzamos la carga inmediata ya que ya estamos precargando
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
