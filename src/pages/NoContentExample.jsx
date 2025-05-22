import React from 'react';
import NoContentCard from '../components/ui/NoContentCard';

const NoContentExample = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Ejemplos de Tarjetas "No Hay Contenido"</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">TikToks Destacados</h2>
          <NoContentCard 
            title="TikToks no disponibles"
            message="En este momento no tenemos TikToks disponibles. Por favor, vuelve a revisar más tarde."
            componentName="TikTokGallery"
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Galería de Medios</h2>
          <NoContentCard 
            title="No hay medios disponibles"
            message="En este momento no hay contenido multimedia disponible. Por favor, intenta más tarde."
            componentName="BentoGrid"
          />
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Variaciones de Estilo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NoContentCard 
            title="Sin productos"
            message="No hay productos en esta categoría."
            className="bg-gray-50"
          />
          
          <NoContentCard 
            title="Carrito vacío"
            message="Tu carrito de compras está vacío. ¡Agrega algunos productos!"
            className="border border-blue-200"
          />
          
          <NoContentCard 
            title="Sin resultados"
            message="No se encontraron resultados para tu búsqueda."
            className="bg-blue-50"
          />
        </div>
      </div>
    </div>
  );
};

export default NoContentExample;
