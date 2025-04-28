import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import TikTokEmbed from './TikTokEmbed';

const TikTokGallery = ({ videoUrls }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">TikToks Destacados</h2>

        <Swiper
          modules={[Navigation, Pagination]}    // solo navegación y paginación
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            0:    { slidesPerView: 1 },
            640:  { slidesPerView: 1 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation                            // flechas activas
          pagination={{ clickable: false}}      // bullets clicables
          // ¡sin autoplay! así solo avanza al hacer click en flechas o bullets
          className="rounded-lg"
        >
          {videoUrls.map((url) => (
            <SwiperSlide
              key={url}
              className="flex justify-center items-center"
            >
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">
                <TikTokEmbed videoUrl={url} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TikTokGallery;
