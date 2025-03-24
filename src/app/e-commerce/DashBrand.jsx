import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const brandLogos = [
  "/brands/logo_bosch.png",
  "/brands/makita.png",
  "/brands/honda-fuerza.png",
  "/brands/cipsa.avif",
  "/brands/marshalltown.png",
  "/brands/m-power.webp",
  "/brands/husq.png",
];

export default function Dashbrand() {
  return (
    <div className="w-full flex flex-col items-center py-12">
    

      <div className="w-full max-w-[90%] sm:max-w-5xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="rounded-lg"
        >
          {brandLogos.map((logo, index) => (
            <SwiperSlide
              key={index}
              className="flex justify-center items-center h-50 p-4 border-1 bg-white rounded-xl shadow-md hover:bg-yellow-100"
            >
              <img
                src={logo}
                alt={`Marca ${index + 1}`}
                className="h-36 object-contain transition-transform duration-300 hover:scale-105"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
