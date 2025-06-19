// src/components/ProductImageWithFallback.jsx
import React, { useState } from 'react';

const ProductImageWithFallback = ({ src, alt, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false); // Reset error if it was previously set
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false); // Ensure loaded is false on error
    // console.error("Error cargando imagen:", src); // Para depuración
  };

  return (
    <div className="w-full h-28 sm:h-52 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Fondo con patrón de imagen cuando no hay imagen disponible o ha fallado */}
      {(!imageLoaded || imageError) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-gray-300 rounded-md flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
          </div>
        </div>
      )}

      {/* La imagen real del producto */}
      <img
        src={src}
        alt={alt}
        className={`max-h-full max-w-full object-contain relative z-10 ${className}`}
        style={{ opacity: imageLoaded && !imageError ? "1" : "0" }} // Controla la opacidad en función del estado de carga/error
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ProductImageWithFallback;