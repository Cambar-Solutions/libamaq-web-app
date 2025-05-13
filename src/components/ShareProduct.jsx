import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Copy, Facebook, MessageCircle, Share2, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import MetaDecorator from './MetaDecorator';

/**
 * Componente para compartir productos en redes sociales con metadatos Open Graph
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Objeto del producto a compartir
 * @param {string} props.baseUrl - URL base del sitio (opcional)
 */
const ShareProduct = ({ product, baseUrl = window.location.origin }) => {
  const [showOptions, setShowOptions] = useState(false);
  
  if (!product) return null;
  
  // Construir la URL completa del producto
  const productUrl = `${baseUrl}/producto/${product.id}`;
  
  // Preparar los datos para compartir
  const title = product.name || 'Producto Libamaq';
  const description = product.shortDescription || product.description?.general || product.description?.details || 'Descubre este producto en nuestra tienda';
  
  // Obtener la URL de la imagen del producto
  // La API devuelve las imágenes en el array multimedia
  const imageUrl = product.multimedia && product.multimedia.length > 0 
    ? product.multimedia[0].url 
    : (product.image || '');
    
  // Log para depuración
  console.log('Datos para compartir:', { title, description, imageUrl, productUrl });
  
  // Función para copiar el enlace al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(productUrl)
      .then(() => {
        toast.success('Enlace copiado al portapapeles');
        setShowOptions(false);
      })
      .catch(() => {
        toast.error('No se pudo copiar el enlace');
      });
  };
  
  // Funciones para compartir en redes sociales
  const shareOnWhatsApp = () => {
    const whatsappText = encodeURIComponent(`${title} - ${description} ${productUrl}`);
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    setShowOptions(false);
  };
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    setShowOptions(false);
  };
  
  const shareOnTwitter = () => {
    const twitterText = encodeURIComponent(`${title} - ${description}`);
    window.open(`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(productUrl)}`, '_blank');
    setShowOptions(false);
  };
  
  return (
    <>
      {/* Componente que maneja los metadatos Open Graph */}
      <MetaDecorator 
        title={title}
        description={description}
        imageUrl={imageUrl}
        url={productUrl}
      />
      
      {/* Botón para mostrar opciones de compartir */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowOptions(!showOptions)}
          className="rounded-full"
          aria-label="Compartir producto"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        {/* Opciones de compartir */}
        {showOptions && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={shareOnFacebook}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </button>
              <button
                onClick={shareOnTwitter}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar enlace
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

ShareProduct.propTypes = {
  product: PropTypes.object.isRequired,
  baseUrl: PropTypes.string
};

export default ShareProduct;
