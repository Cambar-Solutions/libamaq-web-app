import React from 'react';
import { getAllActiveLandings } from '../../services/admin/landingService';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NoContentCard from './NoContentCard';

// Helpers para detectar y formatear URLs de contenido multimedia
const isYouTubeUrl = url => {
  if (!url) return false;
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/.test(url);
};

const isYouTubeShortUrl = url => {
  if (!url) return false;
  return url.includes('youtube.com/shorts/');
};

const getYouTubeEmbedUrl = url => {
  // Manejar YouTube Shorts
  if (isYouTubeShortUrl(url)) {
    const shortId = url.split('/shorts/')[1]?.split('?')[0];
    if (shortId) {
      return `https://www.youtube.com/embed/${shortId}?autoplay=0&rel=0`;
    }
  }
  
  // Manejar videos normales de YouTube
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
  );
  return match && match[1]
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`
    : url;
};

const isVimeoUrl = url => {
  if (!url) return false;
  return /vimeo\.com\/(?:.*#|\/)?([0-9]+)/.test(url);
};

const getVimeoEmbedUrl = url => {
  const match = url.match(/vimeo\.com\/(?:.*#|\/)?([0-9]+)/);
  return match && match[1]
    ? `https://player.vimeo.com/video/${match[1]}`
    : url;
};

const isTikTokUrl = url => {
  if (!url) return false;
  return url.includes('tiktok.com');
};

const isImageUrl = url => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

const isVideoUrl = url => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) || 
         isYouTubeUrl(url) || 
         isYouTubeShortUrl(url) || 
         isVimeoUrl(url);
};

// Determina el tipo de contenido basado en la URL
const getContentTypeFromUrl = url => {
  if (isImageUrl(url)) return 'image';
  if (isVideoUrl(url)) return 'video';
  if (isTikTokUrl(url)) return 'tiktok';
  return 'unknown';
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
  const { 
    data: mediaItems = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['media-items'],
    queryFn: async () => {
      const response = await getAllActiveLandings();
      console.log("Respuesta de getAllActiveLandings:", response);
      
      let dataArray = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object') {
        // Buscar cualquier array en la respuesta
        const arrProp = Object.keys(response).find(k => Array.isArray(response[k]));
        dataArray = arrProp ? response[arrProp] : response.result || response.data || [];
        
        // Si todavía no tenemos un array, intentar extraer cualquier array anidado
        if (!Array.isArray(dataArray) && typeof dataArray === 'object') {
          const nestedArrays = Object.values(dataArray).filter(val => Array.isArray(val));
          if (nestedArrays.length > 0) {
            dataArray = nestedArrays[0];
          } else {
            dataArray = [dataArray]; // Convertir a array si es un objeto único
          }
        }
      }
      
      console.log("Data Array procesado:", dataArray);

      // Filtrar solo items con URL válida (no necesitamos filtrar por type)
      const filtered = dataArray.filter(item => item && item.url);
      console.log("Items filtrados con URL:", filtered);

      const results = await Promise.all(
        filtered.map(item =>
          new Promise(resolve => {
            // Determinar el tipo basado en la URL en lugar de confiar en el campo type
            const contentType = getContentTypeFromUrl(item.url);
            console.log(`URL: ${item.url}, Tipo detectado: ${contentType}`);
            
            // Excluir TikToks ya que se muestran en TikTokGallery
            if (contentType === 'tiktok') {
              resolve(null); // Resolver con null para filtrar después
              return;
            }
            
            const base = {
              id: item.id,
              type: contentType, // Usar el tipo detectado por URL
              src: item.url,
              alt: item.title || 'Media item',
              title: item.title || 'Sin título',
              description: item.description || ''
            };
            
            if (contentType === 'image') {
              const img = new Image();
              img.src = item.url;
              img.onload = () => {
                Object.assign(base, getSpanForImage(img.naturalWidth, img.naturalHeight));
                resolve(base);
              };
              img.onerror = () => {
                // Si falla la carga como imagen, intentar como video
                Object.assign(base, {
                  type: 'video',
                  colSpan: 'col-span-1 md:col-span-2',
                  rowSpan: 'row-span-1 md:row-span-2'
                });
                resolve(base);
              };
            } else if (contentType === 'video') {
              Object.assign(base, {
                colSpan: 'col-span-1 md:col-span-2',
                rowSpan: 'row-span-1 md:row-span-2'
              });
              resolve(base);
            } else {
              // Para tipos desconocidos, usar tamaño predeterminado
              Object.assign(base, {
                colSpan: 'col-span-1 md:col-span-1',
                rowSpan: 'row-span-1 md:row-span-1'
              });
              resolve(base);
            }
          })
        )
      );
      
      // Filtrar los elementos nulos (TikToks) y devolver solo contenido válido
      return results.filter(item => item !== null);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
  });

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
    } else if (item.type === 'video') {
      // Verificar si es un YouTube Short
      if (isYouTubeShortUrl(item.src)) {
        mediaContent = (
          <div className="relative w-full h-full" style={{ paddingBottom: '177.77%' }}>
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
      }
      // Verificar si es un video normal de YouTube
      else if (isYouTubeUrl(item.src)) {
        mediaContent = (
          <div className="relative w-full h-full" style={{ paddingBottom: '56.25%' }}>
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
      } 
      // Luego verificar si es un video de Vimeo
      else if (isVimeoUrl(item.src)) {
        mediaContent = (
          <div className="relative w-full h-full" style={{ paddingBottom: '56.25%' }}>
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
      } 
      // Finalmente, si es un archivo de video directo
      else {
        mediaContent = (
          <div className="relative w-full h-full" style={{ paddingBottom: '56.25%' }}>
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
    } else {
      // Para cualquier otro tipo de contenido desconocido
      mediaContent = (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 p-4">
          <p className="text-gray-500">Contenido no soportado: {item.src}</p>
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
        <div className="text-center p-8 text-red-500">{error.message || 'Error al cargar medios.'}</div>
      ) : mediaItems.length === 0 ? (
        <NoContentCard
          title="No hay medios disponibles"
          message="En este momento no hay contenido multimedia disponible. Por favor, intenta más tarde."
          componentName="BentoGrid"
          className="my-8"
        />
      ) : (
        <div className="grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-auto gap-4 sm:gap-6 md:gap-8 p-4 h-auto md:h-[90vh]">
          {mediaItems.map(renderGridItem)}
        </div>
      )}
    </div>
  );
};

export default BentoGrid;