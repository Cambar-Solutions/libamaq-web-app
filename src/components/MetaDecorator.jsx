import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';

/**
 * Componente que actualiza dinámicamente las metaetiquetas Open Graph para compartir contenido
 * en redes sociales con vista previa adecuada.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del contenido a compartir
 * @param {string} props.description - Descripción del contenido
 * @param {string} props.imageUrl - URL de la imagen para la vista previa
 * @param {string} props.url - URL completa del contenido (opcional, por defecto usa la URL actual)
 */
const MetaDecorator = ({ title, description, imageUrl, url }) => {
  useEffect(() => {
    // Validar que la URL de la imagen sea válida
    if (!imageUrl) {
      console.warn('MetaDecorator: No se proporcionó una URL de imagen válida');
    } else {
      console.log('MetaDecorator: Configurando imagen:', imageUrl);
    }

    // Guardar las metaetiquetas originales para restaurarlas cuando el componente se desmonte
    const originalTitle = document.title;
    const originalMetaTags = {};
    
    // Función para actualizar o crear una metaetiqueta
    const updateMetaTag = (name, content, property = null) => {
      let metaTag;
      
      if (property) {
        metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
      } else {
        metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', name);
          document.head.appendChild(metaTag);
        }
        // Guardar el valor original
        originalMetaTags[name] = metaTag.getAttribute('content');
      }
      
      metaTag.setAttribute('content', content);
      return metaTag;
    };
    
    // Actualizar el título de la página
    document.title = title;
    
    // Actualizar metaetiquetas básicas
    updateMetaTag('description', description);
    
    // Actualizar metaetiquetas Open Graph
    updateMetaTag(null, title, 'og:title');
    updateMetaTag(null, description, 'og:description');
    
    // Asegurarse de que la URL de la imagen sea absoluta
    const absoluteImageUrl = imageUrl && !imageUrl.startsWith('http') 
      ? `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}` 
      : imageUrl;
    
    if (absoluteImageUrl) {
      updateMetaTag(null, absoluteImageUrl, 'og:image');
      // Añadir dimensiones de imagen si están disponibles (mejora la previsualización)
      updateMetaTag(null, 'summary_large_image', 'og:image:type');
    }
    
    updateMetaTag(null, url || window.location.href, 'og:url');
    updateMetaTag(null, 'product', 'og:type');
    
    // Actualizar metaetiquetas Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    if (absoluteImageUrl) {
      updateMetaTag('twitter:image', absoluteImageUrl);
    }
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    
    // Limpiar al desmontar el componente
    return () => {
      document.title = originalTitle;
      
      // Restaurar metaetiquetas originales
      Object.keys(originalMetaTags).forEach(name => {
        const metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag && originalMetaTags[name]) {
          metaTag.setAttribute('content', originalMetaTags[name]);
        }
      });
      
      // Eliminar metaetiquetas Open Graph y Twitter que no existían antes
      const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
      const twitterTags = ['twitter:card', 'twitter:image'];
      
      [...ogTags, ...twitterTags].forEach(tag => {
        const selector = tag.startsWith('og:') ? `meta[property="${tag}"]` : `meta[name="${tag}"]`;
        const metaTag = document.querySelector(selector);
        if (metaTag && !originalMetaTags[tag]) {
          document.head.removeChild(metaTag);
        }
      });
    };
  }, [title, description, imageUrl, url]);

  // Este componente no renderiza nada visible
  return null;
};

MetaDecorator.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  url: PropTypes.string
};

export default MetaDecorator;
