import React, { useState, useEffect } from 'react';
import { getAllActiveLandings } from '../../services/admin/landingService';
import { Loader2 } from 'lucide-react';

// Funciones auxiliares para detectar y formatear URLs de video
const isYouTubeUrl = (url) => {
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/.test(url);
};

const getYouTubeEmbedUrl = (url) => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return url;
};

const isVimeoUrl = (url) => {
  return /vimeo\.com\/(?:.*#|\/)?([0-9]+)/.test(url);
};

const getVimeoEmbedUrl = (url) => {
  const match = url.match(/vimeo\.com\/(?:.*#|\/)?([0-9]+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
};

const BentoGrid = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definiciones de tamaños para el grid dinámico
  const gridSizes = [
    { colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1 md:row-span-1' }, // Grande horizontal
    { colSpan: 'col-span-1 md:col-span-1', rowSpan: 'row-span-1 md:row-span-1' }, // Pequeño
    { colSpan: 'col-span-1 md:col-span-1', rowSpan: 'row-span-1 md:row-span-2' }, // Vertical
    { colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1 md:row-span-2' }, // Grande
    { colSpan: 'col-span-1 md:col-span-1', rowSpan: 'row-span-1 md:row-span-2' }, // Vertical
    { colSpan: 'col-span-1 md:col-span-1', rowSpan: 'row-span-1 md:row-span-1' }  // Pequeño
  ];

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const response = await getAllActiveLandings();
        
        // Verificar la estructura de la respuesta
        console.log('Respuesta de API:', response);
        
        // Determinar si la respuesta es un array o si tiene una propiedad que contiene el array
        let dataArray = [];
        
        if (Array.isArray(response)) {
          dataArray = response;
        } else if (response && typeof response === 'object') {
          // Buscar en las propiedades del objeto si alguna es un array
          const possibleArrayProps = Object.keys(response).filter(key => 
            Array.isArray(response[key])
          );
          
          if (possibleArrayProps.length > 0) {
            dataArray = response[possibleArrayProps[0]];
          } else if (response.result && Array.isArray(response.result)) {
            dataArray = response.result;
          } else if (response.data && Array.isArray(response.data)) {
            dataArray = response.data;
          }
        }
        
        console.log('Array de datos procesado:', dataArray);
        
        // Filtrar solo imágenes y videos
        const filteredItems = dataArray.filter(item => 
          item && (item.type === 'IMAGE' || item.type === 'VIDEO')
        );
        
        console.log('Items filtrados:', filteredItems);
        
        // Mapear los items a nuestro formato con tamaños dinámicos
        const mappedItems = filteredItems.map((item, index) => ({
          id: item.id,
          type: item.type === 'IMAGE' ? 'image' : 'video',
          src: item.url,
          alt: item.title || 'Media item',
          title: item.title || 'Sin título',
          description: item.description || '',
          // Asignar tamaños de manera cíclica usando el índice
          colSpan: gridSizes[index % gridSizes.length].colSpan,
          rowSpan: gridSizes[index % gridSizes.length].rowSpan
        }));
        
        setMediaItems(mappedItems);
        setError(null);
      } catch (err) {
        console.error('Error al cargar medios:', err);
        setError('No se pudieron cargar las imágenes y videos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedia();
  }, []);

  const renderGridItem = (item) => {
    const classes = [
      'rounded-xl', 
      'overflow-hidden', 
      'shadow-lg', 
      'hover:shadow-xl', 
      'transition-shadow',
      'relative',
      item.colSpan, 
      item.rowSpan
    ].join(' ');

    return (
      <div key={item.id} className={classes}>
        {item.type === 'image' ? (
          <>
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-bold text-sm md:text-base truncate">{item.title}</h3>
              {item.description && (
                <p className="text-xs md:text-sm line-clamp-2">{item.description}</p>
              )}
            </div>
          </>
        ) : (
          <>
            {isYouTubeUrl(item.src) ? (
              // Reproductor de YouTube
              <div className="relative w-full h-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getYouTubeEmbedUrl(item.src)}
                  title={item.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : isVimeoUrl(item.src) ? (
              // Reproductor de Vimeo
              <div className="relative w-full h-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getVimeoEmbedUrl(item.src)}
                  title={item.title}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              // Reproductor HTML5 para otros videos
              <video 
                controls 
                className="w-full h-full object-cover cursor-pointer"
                poster={item.src.replace(/\.[^/.]+$/, ".jpg")} // Intenta usar una versión JPG como poster
                playsInline
              >
                <source src={item.src} type="video/mp4" />
                <source src={item.src} type="video/webm" />
                <source src={item.src} type="video/ogg" />
                <p>Tu navegador no soporta video HTML5. <a href={item.src} target="_blank" rel="noopener noreferrer">Descargar video</a></p>
              </video>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-bold text-sm md:text-base truncate">{item.title}</h3>
              {item.description && (
                <p className="text-xs md:text-sm line-clamp-2">{item.description}</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-16">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Cargando contenido...</span>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No hay imágenes o videos disponibles.</p>
        </div>
      ) : (
        <div className="
          grid
          grid-cols-1        /* 1 col en móvil */
          sm:grid-cols-2     /* 2 cols en tablet */
          md:grid-cols-4     /* 4 cols en escritorio */
          md:grid-rows-3       /* 3 filas en escritorio */
          auto-rows-auto       /* filas según contenido en móvil/tablet */
          gap-4 sm:gap-6 md:gap-8
          p-4 sm:p-6 md:p-8
          h-auto               /* altura flexible en móvil/tablet */
          md:h-[90vh]          /* altura en escritorio */
        ">
          {mediaItems.map(renderGridItem)}
        </div>
      )}
    </div>
  );
};

export default BentoGrid;
