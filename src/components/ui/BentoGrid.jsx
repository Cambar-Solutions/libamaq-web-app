import React, { useState, useEffect } from 'react';
import { getAllActiveLandings } from '../../services/admin/landingService';
import { Loader2 } from 'lucide-react';

// Helpers para detectar y formatear URLs de video
const isYouTubeUrl = url =>
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/.test(url);

const getYouTubeEmbedUrl = url => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
  );
  return match && match[1]
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`
    : url;
};

const isVimeoUrl = url => /vimeo\.com\/(?:.*#|\/)?([0-9]+)/.test(url);

const getVimeoEmbedUrl = url => {
  const match = url.match(/vimeo\.com\/(?:.*#|\/)?([0-9]+)/);
  return match && match[1]
    ? `https://player.vimeo.com/video/${match[1]}`
    : url;
};

// Determina el span en el grid según dimensiones reales y tamaño absoluto
const getSpanForImage = (width, height) => {
  let col = 1;
  let row = 1;

  // Primer, imágenes muy pequeñas ocupan al menos 2x2
  if (width < 800 && height < 800) {
    col = 1;
    row = 2;
  } else {
    // Verticales ocupan al menos 2 filas
    if (height > width) row = 3;
    // Umbrales de ancho para columnas
    if (width > 1600) {
      col = 3;
    } else if (width > 800) {
      col = 2;
    }
    // Umbrales de alto para filas
    if (height > 1600) {
      row = Math.max(row, 3);
    } else if (height > 800) {
      row = Math.max(row, 2);
    }
  }

  return {
    colSpan: `col-span-1 md:col-span-${col}`,
    rowSpan: `row-span-1 md:row-span-${row}`
  };
};

const BentoGrid = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const response = await getAllActiveLandings();
        let dataArray = [];
        if (Array.isArray(response)) {
          dataArray = response;
        } else if (response && typeof response === 'object') {
          const arrProp = Object.keys(response).find(k => Array.isArray(response[k]));
          dataArray = arrProp ? response[arrProp] : response.result || response.data || [];
        }

        const filtered = dataArray.filter(
          item => item && (item.type === 'IMAGE' || item.type === 'VIDEO')
        );

        const loaded = await Promise.all(
          filtered.map(item =>
            new Promise(resolve => {
              const base = {
                id: item.id,
                type: item.type === 'IMAGE' ? 'image' : 'video',
                src: item.url,
                alt: item.title || 'Media item',
                title: item.title || 'Sin título',
                description: item.description || ''
              };
              if (item.type === 'IMAGE') {
                const img = new Image();
                img.src = item.url;
                img.onload = () => {
                  Object.assign(base, getSpanForImage(img.naturalWidth, img.naturalHeight));
                  resolve(base);
                };
                img.onerror = () => resolve(base);
              } else {
                Object.assign(base, {
                  colSpan: 'col-span-1 md:col-span-2',
                  rowSpan: 'row-span-1 md:row-span-2'
                });
                resolve(base);
              }
            })
          )
        );

        setMediaItems(loaded);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al cargar medios.');
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const renderGridItem = item => {
    const classes = [
      'rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative',
      item.colSpan,
      item.rowSpan
    ].join(' ');

    let mediaContent;
    if (item.type === 'image') {
      mediaContent = (
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      );
    } else if (isYouTubeUrl(item.src)) {
      mediaContent = (
        <div className="relative w-full h-full" style={{ paddingBottom: '75%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={getYouTubeEmbedUrl(item.src)}
            title={item.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else if (isVimeoUrl(item.src)) {
      mediaContent = (
        <div className="relative w-full h-full" style={{ paddingBottom: '75%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={getVimeoEmbedUrl(item.src)}
            title={item.title}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else {
      mediaContent = (
        <div className="relative w-full h-full" style={{ paddingBottom: '75%' }}>
          <video
            controls
            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
            poster={item.src.replace(/\.[^/.]+$/, '.jpg')}
            playsInline
          >
            <source src={item.src} type="video/mp4" />
            <source src={item.src} type="video/webm" />
            Tu navegador no soporta video HTML5.
          </video>
        </div>
      );
    }

    return (
      <div key={item.id} className={classes}>
        {mediaContent}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-sm md:text-base truncate">{item.title}</h3>
          {item.description && <p className="text-xs md:text-sm line-clamp-2">{item.description}</p>}
        </div>
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
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No hay medios disponibles.</div>
      ) : (
        <div className="grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-auto gap-4 sm:gap-6 md:gap-8 p-4 h-auto md:h-[90vh]">
          {mediaItems.map(renderGridItem)}
        </div>
      )}
    </div>
  );
};

export default BentoGrid;