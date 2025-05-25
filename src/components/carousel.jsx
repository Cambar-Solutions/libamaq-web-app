import React, { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useImagePreload } from '../hooks/useImagePreload';
import { usePrevNextButtons, PrevButton, NextButton } from './ui/EmblaCarouselArrowButtons';
import { useDotButton, DotButton } from './ui/EmblaCarouselDotButton';

const Carousel = ({ images, onImagesLoaded, className = '' }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false })
  ]);

  // Usamos el hook personalizado para precargar las imágenes
  const { isComplete, progress } = useImagePreload(images, {
    onComplete: onImagesLoaded
  });

  // Configuración de los botones de navegación
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi);

  // Configuración de los puntos de navegación
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

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
    <div className={`embla w-full max-w-5xl mx-auto py-8 ${className}`}>
      {/* Barra de progreso de carga */}
      {!isComplete && (
        <div className="flex justify-center items-center h-20 mb-4">
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="ml-3 text-sm text-gray-500">{progress}%</span>
        </div>
      )}
      
      {/* Contenedor principal del carrusel */}
      <div 
        className={`embla__viewport overflow-hidden rounded-lg ${!isComplete ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
        ref={emblaRef}
      >
        <div className="embla__container">
          {images.map((img, index) => (
            <div className="embla__slide" key={index}>
              <img
                src={img}
                alt={getAltText(img)}
                className="w-full h-96 object-cover rounded-lg"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="embla__controls mt-4">
        <div className="flex items-center justify-between">
          {/* Botones de navegación */}
          <div className="embla__buttons flex gap-2">
            <PrevButton 
              onClick={onPrevButtonClick} 
              disabled={prevBtnDisabled} 
              className="p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition-colors"
            />
            <NextButton 
              onClick={onNextButtonClick} 
              disabled={nextBtnDisabled}
              className="p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition-colors"
            />
          </div>

          {/* Puntos de navegación */}
          <div className="embla__dots flex gap-2">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la diapositiva ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Estilos */}
      <style jsx global>{`
        .embla {
          --slide-spacing: 1rem;
          --slide-size: 100%;
          --slide-height: 24rem;
        }
        .embla__viewport {
          overflow: hidden;
        }
        .embla__container {
          backface-visibility: hidden;
          display: flex;
          touch-action: pan-y;
          margin-left: calc(var(--slide-spacing) * -1);
        }
        .embla__slide {
          flex: 0 0 var(--slide-size);
          min-width: 0;
          padding-left: var(--slide-spacing);
          position: relative;
        }
        .embla__button {
          -webkit-appearance: none;
          appearance: none;
          touch-action: manipulation;
          display: inline-flex;
          text-decoration: none;
          cursor: pointer;
          border: 0;
          padding: 0;
          margin: 0;
        }
        .embla__button:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .embla__button__svg {
          width: 1.5rem;
          height: 1.5rem;
        }
        .embla__dots {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .embla__dot {
          -webkit-appearance: none;
          appearance: none;
          touch-action: manipulation;
          cursor: pointer;
          border: 0;
          padding: 0;
          margin: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: transparent;
        }
        .embla__dot:after {
          box-shadow: inset 0 0 0 0.2rem rgba(156, 163, 175, 0.5);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          display: flex;
          content: '';
        }
        .embla__dot--selected:after {
          box-shadow: inset 0 0 0 0.2rem #3b82f6;
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default Carousel;
