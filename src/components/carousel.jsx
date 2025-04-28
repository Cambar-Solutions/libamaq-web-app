import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination, Autoplay } from 'swiper';
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Carousel({ images }) {
  return (
    <div className="w-full max-w-5xl  mx-auto py-8">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="rounded-lg "
      >
        {images.map((img, index) => (
          <SwiperSlide
            key={index}
            className="flex justify-center items-center"
          >
            <img
              src={img}
              alt={
                img === "/boschcarusel.png"
                  ? "LIBAMAQ herramientas Bosch"
                  : img === "/MAKITA.webp"
                  ? "LIBAMAQ herramientas Makita"
                  : img === "/bosch-power.jpg"
                  ? "LIBAMAQ herramientas eléctricas Bosch"
                  : img === "/HUSQ.jpg"
                  ? "LIBAMAQ herramientas Husqvarna"
                  : img === "/service.jpg"
                  ? "LIBAMAQ servicio y reparación de herramientas"
                  : img === "/CIPSA.png"
                  ? "LIBAMAQ herramientas Cipsa"
                  : `Imagen ${index + 1}`
              }

              className="w-full h-96 object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
