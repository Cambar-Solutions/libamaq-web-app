import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { OrderCard } from './OrderCard';
import { SortableContext } from '@dnd-kit/sortable';

export const OrdersCarousel = ({ orders }) => {
  const carouselRef = useRef(null);

  // Función para desplazar el carrusel a la izquierda
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  // Función para desplazar el carrusel a la derecha
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Implementación básica de gestos táctiles para deslizar
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let startX;
    let scrollLeft;

    const handleTouchStart = (e) => {
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; // Velocidad de desplazamiento
      carousel.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      startX = null;
    };

    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      carousel.removeEventListener('touchstart', handleTouchStart);
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Ya no necesitamos configurar sensores ni manejar el drag end aquí
  // porque ahora lo maneja el componente padre con el DndContext unificado

  return (
    <div className="relative w-full mb-6">
      <h3 className="text-lg font-semibold mb-3">Pedidos Recientes</h3>
      
      <div className="flex items-center">
        {/* Botón de desplazamiento izquierdo */}
        <Button 
          variant="outline" 
          size="icon" 
          className="hidden md:flex mr-2 z-10"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Contenedor del carrusel (ahora sin DndContext propio) */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory gap-4 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <SortableContext items={orders.map(order => order.id)}>
            {orders.map(order => (
              <div 
                key={order.id} 
                className="flex-shrink-0 w-[280px] snap-start"
              >
                <OrderCard order={order} columnId="carousel" />
              </div>
            ))}
          </SortableContext>
        </div>
        
        {/* Botón de desplazamiento derecho */}
        <Button 
          variant="outline" 
          size="icon" 
          className="hidden md:flex ml-2 z-10"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Indicador de deslizamiento para móviles */}
      <div className="flex justify-center mt-2 md:hidden">
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};
