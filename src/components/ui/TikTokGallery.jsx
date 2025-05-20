import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import TikTokEmbed from './TikTokEmbed';
import { getAllActiveLandings } from '@/services/admin/landingService';

const TikTokGallery = () => {
  const [landings, setLandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchLandings = async () => {
    try {
      setLoading(true);
      const all = await getAllActiveLandings();
      console.log("Payload de landings:", all);

      // Primero extraigo el array correcto:
      const list = Array.isArray(all)
        ? all
        : Array.isArray(all.result)
          ? all.result
          : [];

      // Ahora filtro los TIKTOK:
      const tiktokLandings = list.filter(item => item.type === 'TIKTOK');
      setLandings(tiktokLandings);
      setError(null);
    } catch (err) {
      console.error('Error al cargar TikToks:', err);
      setError('No se pudieron cargar los TikToks. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  fetchLandings();
}, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 select-none">TikToks Destacados</h2>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-5 text-red-500">{error}</div>
        ) : landings.length === 0 ? (
          <div className="text-center p-5 text-gray-500">No hay TikToks disponibles en este momento.</div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}    // solo navegación y paginación
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation                            // flechas activas
            pagination={{ clickable: false }}      // bullets clicables
            // ¡sin autoplay! así solo avanza al hacer click en flechas o bullets
            className="rounded-lg"
          >
            {landings.map((landing) => (
              <SwiperSlide
                key={landing.id}
                className="flex justify-center items-center"
              >
                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <TikTokEmbed videoUrl={landing.url} />

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default TikTokGallery;
