import React, { useState } from 'react';
import { Package } from 'lucide-react';

const CategoryImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  style,
  iconSize = 48,
  brandColor = '#0000FF'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Si no hay src o hubo error, mostrar ícono por defecto
  if (!src || imageError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{
          ...style,
          backgroundColor: `${brandColor}15`, // Color de marca con baja opacidad
          border: `1px solid ${brandColor}30`
        }}
      >
        <Package 
          size={iconSize} 
          color={brandColor} 
          style={{ opacity: 0.7 }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Mostrar ícono mientras carga la imagen */}
      {!imageLoaded && (
        <div 
          className={`absolute inset-0 flex items-center justify-center ${className}`}
          style={{
            ...style,
            backgroundColor: `${brandColor}15`,
            border: `1px solid ${brandColor}30`
          }}
        >
          <Package 
            size={iconSize} 
            color={brandColor} 
            style={{ opacity: 0.5 }}
          />
        </div>
      )}
      
      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CategoryImageWithFallback; 