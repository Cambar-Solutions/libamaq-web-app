import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { useQuery } from '@tanstack/react-query';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import TikTokEmbed from './TikTokEmbed';
import NoContentCard from './NoContentCard';
import { getAllActiveLandings } from '@/services/admin/landingService';

// Funciones para detectar diferentes tipos de URLs
const isTikTokUrl = (url) => {
  if (!url) return false;
  return url.includes('tiktok.com');
};

const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) || 
         isYouTubeUrl(url) || 
         url.includes('vimeo.com');
};

const TikTokGallery = () => {
  const { 
    data: landings = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['tiktoks'],
    queryFn: async () => {
      const response = await getAllActiveLandings();
      console.log("Payload de landings:", response);

      // Manejar diferentes estructuras de respuesta posibles
      let items = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        // Estructura: { data: [...] }
        items = response.data;
      } else if (Array.isArray(response)) {
        // Estructura: [...]
        items = response;
      } else if (response && response.result) {
        // Estructura: { result: [...] } o { result: {...} }
        if (Array.isArray(response.result)) {
          items = response.result;
        } else {
          items = [response.result];
        }
      } else if (response && typeof response === 'object') {
        // Intentar extraer cualquier array que pueda contener
        const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          // Usar el primer array encontrado
          items = possibleArrays[0];
        }
      }
      
      console.log("Items procesados:", items);
      
      // Filtrar SOLO contenido de TikTok
      const tiktokContent = items.filter(item => {
        // Verificar si la URL es de TikTok
        return isTikTokUrl(item.url);
      });
      
      console.log("Contenido de TikTok filtrado:", tiktokContent);
      return tiktokContent;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
  });

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 select-none">TikToks Destacados</h2>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-5 text-red-500">{error.message || 'No se pudieron cargar los TikToks. Por favor, intenta más tarde.'}</div>
        ) : landings.length === 0 ? (
          <NoContentCard
            title="TikToks no disponibles"
            message="En este momento no tenemos TikToks disponibles. Por favor, vuelve a revisar más tarde."
            componentName="TikTokGallery"
            className="my-8"
          />
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
