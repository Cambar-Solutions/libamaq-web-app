import { useEffect } from 'react';

/**
 * Componente para gestionar las etiquetas meta dinámicas para productos
 * Este componente modifica las etiquetas meta del documento para mejorar
 * la previsualización cuando se comparten enlaces en redes sociales
 */
const ProductMetaTags = ({ product, imageUrl }) => {
  useEffect(() => {
    if (!product) return;

    // Obtener la URL actual
    const currentUrl = window.location.href;
    
    // Obtener o crear las etiquetas meta
    let titleTag = document.querySelector('title');
    let descriptionTag = document.querySelector('meta[name="description"]');
    
    // Etiquetas Open Graph
    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    let ogImageTag = document.querySelector('meta[property="og:image"]');
    let ogUrlTag = document.querySelector('meta[property="og:url"]');
    let ogTypeTag = document.querySelector('meta[property="og:type"]');
    
    // Etiquetas para WhatsApp
    let whatsappTitleTag = document.querySelector('meta[property="og:site_name"]');
    
    // Crear las etiquetas si no existen
    if (!titleTag) {
      titleTag = document.createElement('title');
      document.head.appendChild(titleTag);
    }
    
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    
    if (!ogTitleTag) {
      ogTitleTag = document.createElement('meta');
      ogTitleTag.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleTag);
    }
    
    if (!ogDescriptionTag) {
      ogDescriptionTag = document.createElement('meta');
      ogDescriptionTag.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescriptionTag);
    }
    
    if (!ogImageTag) {
      ogImageTag = document.createElement('meta');
      ogImageTag.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageTag);
    }
    
    if (!ogUrlTag) {
      ogUrlTag = document.createElement('meta');
      ogUrlTag.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlTag);
    }
    
    if (!ogTypeTag) {
      ogTypeTag = document.createElement('meta');
      ogTypeTag.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeTag);
    }
    
    if (!whatsappTitleTag) {
      whatsappTitleTag = document.createElement('meta');
      whatsappTitleTag.setAttribute('property', 'og:site_name');
      document.head.appendChild(whatsappTitleTag);
    }
    
    // Actualizar el contenido de las etiquetas
    const productName = product.name || 'Producto';
    const productDescription = product.shortDescription || 'Producto disponible en Libamaq';
    const productImage = imageUrl || (product.multimedia && product.multimedia.length > 0 
      ? product.multimedia[0].url 
      : '/placeholder-product.png');
    const productPrice = product.price ? `$${product.price.toLocaleString()}` : '';
    
    // Actualizar el título y la descripción
    titleTag.textContent = `${productName} ${productPrice} | Libamaq`;
    descriptionTag.setAttribute('content', productDescription);
    
    // Actualizar etiquetas Open Graph
    ogTitleTag.setAttribute('content', `${productName} ${productPrice}`);
    ogDescriptionTag.setAttribute('content', productDescription);
    ogImageTag.setAttribute('content', productImage);
    ogUrlTag.setAttribute('content', currentUrl);
    ogTypeTag.setAttribute('content', 'product');
    
    // Actualizar etiqueta para WhatsApp
    whatsappTitleTag.setAttribute('content', 'Libamaq | Venta y Renta de Maquinaria');
    
    // Función de limpieza para restaurar las etiquetas originales
    return () => {
      titleTag.textContent = 'Libamaq | Venta y Renta de Maquinaria y Herramienta en México';
      descriptionTag.setAttribute('content', 'LIBAMAQ ofrece venta, renta y reparación de herramientas eléctricas y maquinaria para construcción. Contamos con las mejores marcas como Bosch, Makita, y más. ¡Visita nuestra tienda y encuentra la herramienta perfecta!');
      
      // Eliminar las etiquetas Open Graph
      if (ogTitleTag) document.head.removeChild(ogTitleTag);
      if (ogDescriptionTag) document.head.removeChild(ogDescriptionTag);
      if (ogImageTag) document.head.removeChild(ogImageTag);
      if (ogUrlTag) document.head.removeChild(ogUrlTag);
      if (ogTypeTag) document.head.removeChild(ogTypeTag);
      if (whatsappTitleTag) document.head.removeChild(whatsappTitleTag);
    };
  }, [product, imageUrl]);
  
  // Este componente no renderiza nada visible
  return null;
};

export default ProductMetaTags;
