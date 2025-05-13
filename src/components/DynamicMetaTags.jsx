import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente para gestionar las etiquetas meta dinámicas para productos
 * Este componente modifica las etiquetas meta del documento para mejorar
 * la previsualización cuando se comparten enlaces en redes sociales
 */
const DynamicMetaTags = ({ title, description, image, type = 'website', url }) => {
  const location = useLocation();
  
  // Si no se proporciona URL, usar la URL actual
  const metaUrl = url || window.location.origin + location.pathname;
  
  useEffect(() => {
    if (!title && !description && !image) return;
    
    // Función para obtener o crear una etiqueta meta
    const getOrCreateMetaTag = (property) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      return tag;
    };
    
    // Actualizar título de la página
    if (title) {
      document.title = title;
      getOrCreateMetaTag('og:title').setAttribute('content', title);
      getOrCreateMetaTag('twitter:title').setAttribute('content', title);
    }
    
    // Actualizar descripción
    if (description) {
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        descTag.setAttribute('content', description);
      } else {
        const newDescTag = document.createElement('meta');
        newDescTag.setAttribute('name', 'description');
        newDescTag.setAttribute('content', description);
        document.head.appendChild(newDescTag);
      }
      
      getOrCreateMetaTag('og:description').setAttribute('content', description);
      getOrCreateMetaTag('twitter:description').setAttribute('content', description);
    }
    
    // Actualizar imagen
    if (image) {
      // Asegurarse de que la URL de la imagen sea absoluta
      const absoluteImageUrl = image.startsWith('http') 
        ? image 
        : window.location.origin + (image.startsWith('/') ? '' : '/') + image;
      
      getOrCreateMetaTag('og:image').setAttribute('content', absoluteImageUrl);
      getOrCreateMetaTag('twitter:image').setAttribute('content', absoluteImageUrl);
    }
    
    // Actualizar tipo
    getOrCreateMetaTag('og:type').setAttribute('content', type);
    
    // Actualizar URL
    getOrCreateMetaTag('og:url').setAttribute('content', metaUrl);
    getOrCreateMetaTag('twitter:url').setAttribute('content', metaUrl);
    
    // Twitter card
    getOrCreateMetaTag('twitter:card').setAttribute('content', 'summary_large_image');
    
    // Función de limpieza para restaurar las etiquetas originales al desmontar
    return () => {
      document.title = 'Libamaq | Venta y Renta de Maquinaria y Herramienta en México';
      
      // Restaurar descripción original
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        descTag.setAttribute('content', 'LIBAMAQ ofrece venta, renta y reparación de herramientas eléctricas y maquinaria para construcción. Contamos con las mejores marcas como Bosch, Makita, y más. ¡Visita nuestra tienda y encuentra la herramienta perfecta!');
      }
    };
  }, [title, description, image, type, metaUrl]);
  
  // Este componente no renderiza nada visible
  return null;
};

export default DynamicMetaTags;
