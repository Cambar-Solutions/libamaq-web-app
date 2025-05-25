import React, { useState, useEffect, useCallback } from 'react';
import { getAllActiveLandings } from '../../services/admin/landingService';
import { Loader2, ExternalLink, Play, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NoContentCard from './NoContentCard';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import { useVideoStore } from '../../stores/useVideoStore';

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
      return `https://www.youtube.com/embed/${shortId}?autoplay=1&rel=0&modestbranding=1`;
    }
  }
  
  // Manejar videos normales de YouTube
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
  );
  return match && match[1]
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
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

// Determina el span en el grid según el tipo de contenido
const getSpanForImage = (width, height, type, src) => {
  // Para YouTube Shorts, usar un diseño más alto
  if (type === 'video' && src && src.includes('youtube.com/shorts/')) {
    return { col: 1, row: 2 }; // 1 columna, 2 filas de alto
  }
  
  // Para videos verticales
  if (type === 'video' && height > width) {
    return { col: 1, row: 2 }; // 1 columna, 2 filas de alto
  }
  
  // Para videos horizontales
  if (type === 'video') {
    return { col: 2, row: 1 }; // 2 columnas, 1 fila de alto
  }
  
  // Para imágenes, mantener la lógica anterior
  // Imágenes pequeñas ocupan al menos 1x1
  if (width < 800 && height < 800) {
    return { col: 1, row: 1 };
  }
  
  // Imágenes verticales ocupan 1 columna x 2 filas
  if (height > width * 1.2) {
    return { col: 1, row: 2 };
  }
  
  // Imágenes horizontales ocupan 2 columnas x 1 fila
  if (width > height * 1.2) {
    return { col: 2, row: 1 };
  }
  
  // Cuadradas o casi cuadradas ocupan 1x1
  return { col: 1, row: 1 };
};

// Renombramos el componente a MasonryGallery para reflejar el nuevo diseño
const MasonryGallery = () => {
  // Estado para el modal de visualización
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Estado para reproducir shorts en la card
  const [playingInCardId, setPlayingInCardId] = useState(null);
  // Estado para controlar el overlay en dispositivos móviles
  const [touchedItemId, setTouchedItemId] = useState(null);
  // Detectar si es un dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es un dispositivo móvil al cargar el componente
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
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

  const renderMasonryItem = item => {
    if (!item) return null;
    
    // Verificar si es un YouTube Short
    const isYouTubeShort = item.type === 'video' && isYouTubeShortUrl(item.src);
    
    const classes = [
      'overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative',
      // Eliminar bordes redondeados para todos los shorts
      isYouTubeShort ? 'rounded-none' : 'rounded-xl',
      item.colSpan,
      item.rowSpan
    ].filter(Boolean).join(' ');

    let mediaContent;
    if (item.type === 'image') {
      mediaContent = (
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          loading="lazy"
        />
      );
    } else if (item.type === 'video') {
      // Verificar si es un YouTube Short
      if (isYouTubeShortUrl(item.src)) {
        // Para shorts de YouTube, usamos la URL directa a YouTube para mejor interactividad
        const shortId = item.src.split('/shorts/')[1]?.split('?')[0];
        mediaContent = (
          <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${shortId}?autoplay=1&loop=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&playsinline=1`}
              title={item.title || 'YouTube Short'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      }
      // Verificar si es un video normal de YouTube
      else if (isYouTubeUrl(item.src)) {
        mediaContent = (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={getYouTubeEmbedUrl(item.src)}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
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

    // Validar que el item exista
    if (!item) return null;
    
    // Usar el nuevo VideoPlayer para el contenido multimedia
    const displayContent = (
      <div className="w-full h-full">
        {item.type === 'video' && isYouTubeUrl(item.src) ? (
          <VideoPlayer
            id={item.id}
            src={getYouTubeEmbedUrl(item.src)}
            type="youtube"
            className="rounded-lg"
          />
        ) : item.type === 'video' && isVimeoUrl(item.src) ? (
          <VideoPlayer
            id={item.id}
            src={getVimeoEmbedUrl(item.src)}
            type="vimeo"
            className="rounded-lg"
          />
        ) : item.type === 'video' ? (
          <VideoPlayer
            id={item.id}
            src={item.src}
            type="video"
            thumbnail={item.thumbnail}
            className="rounded-lg"
            controls
          />
        ) : (
          mediaContent
        )}
      </div>
    );

    return (
      <motion.div 
        key={item.id} 
        className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        variants={itemVariants}
        onClick={() => {
          // En dispositivos móviles, al hacer clic en un item:
          if (isMobile) {
            // Si es un short de YouTube, no hacemos nada (los controles nativos de YouTube se encargan)
            if (item.type === 'video' && isYouTubeShortUrl(item.src)) {
              return;
            }
            
            // Para otros tipos, alternamos el estado de tocado
            if (touchedItemId === item.id) {
              // Si ya está tocado, abrimos el modal
              if (item.type === 'video' && !isYouTubeShortUrl(item.src)) {
                setSelectedItem(item);
                setIsPlaying(true);
              } else if (item.type === 'image') {
                setSelectedItem(item);
                setIsPlaying(false);
              }
              setTouchedItemId(null);
            } else {
              // Si no está tocado, lo marcamos como tocado para mostrar el overlay
              setTouchedItemId(item.id);
            }
          }
        }}
      >
        <div className="relative overflow-hidden">
          {/* Para los shorts de YouTube, usamos un contenedor especial */}
          {item && item.type === 'video' && isYouTubeShortUrl(item.src) ? (
            <div className="w-full h-full" style={{ pointerEvents: 'none' }}>
              <div style={{ pointerEvents: 'auto' }}>
                {displayContent}
              </div>
            </div>
          ) : (
            displayContent
          )}
          
          {/* Overlay con botones de acción - visible en hover (PC) o después de tocar (móvil) */}
          {/* No mostramos el overlay para shorts de YouTube para permitir la interacción con los controles */}
          {!(item.type === 'video' && isYouTubeShortUrl(item.src)) && (
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 transition-all duration-300 ${isMobile ? 
                (touchedItemId === item.id ? 'opacity-100' : 'opacity-0') : 
                'opacity-0 group-hover:opacity-100'}`}
            >
              <div className="flex justify-end space-x-2">
                {/* Solo mostramos botones para videos normales e imágenes, no para shorts */}
                {item.type === 'video' && !isYouTubeShortUrl(item.src) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                      setIsPlaying(true);
                    }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 flex items-center text-xs font-medium"
                  >
                    <ExternalLink size={14} className="mr-1" /> Ver completo
                  </button>
                )}
                
                {item.type === 'image' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                      setIsPlaying(false);
                    }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 flex items-center text-xs font-medium"
                  >
                    <ExternalLink size={14} className="mr-1" /> Ver imagen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Filtros para la galería
  const [filter, setFilter] = useState('all');
  
  // Filtrar elementos según el tipo seleccionado
  const filteredItems = React.useMemo(() => {
    if (!Array.isArray(mediaItems)) return [];
    
    return filter === 'all' 
      ? mediaItems.filter(item => item && item.id) // Solo items válidos
      : mediaItems.filter(item => item && item.id && item.type === filter);
  }, [mediaItems, filter]);
  
  // Variantes para animaciones con Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  // Función para cerrar el modal
  const closeModal = () => {
    setSelectedItem(null);
    // Limpiar el video que se está reproduciendo al cerrar el modal
    useVideoStore.getState().clearPlayingVideo();
  };
  
  // Función para verificar si un elemento es un YouTube Short
  const isItemYouTubeShort = (item) => {
    return item && item.type === 'video' && isYouTubeShortUrl(item.src);
  };
  
  // Manejar el cambio de filtro para detener cualquier reproducción
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    // Detener la reproducción al cambiar de filtro
    useVideoStore.getState().clearPlayingVideo();
  }, []);

  return (
    <div className="w-full py-12 bg-gradient-to-t from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Contenido Multimedia</h2>
        <p className="text-slate-600 text-center mb-8">Explora nuestros videos, shorts e imágenes</p>
        
        {/* Filtros */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-wrap justify-center gap-2 bg-white/70 backdrop-blur-sm p-2 rounded-full">
            <button 
              onClick={() => handleFilterChange('all')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-black hover:bg-blue-200/40'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => handleFilterChange('video')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'video' ? 'bg-blue-600 text-white' : 'text-black hover:bg-blue-200/40'}`}
            >
              Videos
            </button>
            <button 
              onClick={() => handleFilterChange('image')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'image' ? 'bg-blue-600 text-white' : 'text-black hover:bg-blue-200/40'}`}
            >
              Imágenes
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
            <span className="ml-2 text-slate-700">Cargando contenido...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-700 bg-red-100 p-6 rounded-xl shadow-sm">
            <p>Error al cargar el contenido multimedia.</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="bg-white/80 shadow-sm rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">No hay contenido multimedia</h3>
            <p className="text-slate-600">No se ha encontrado contenido multimedia para mostrar.</p>
          </div>
        ) : (
          <motion.div 
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.filter(item => item).map(renderMasonryItem)}
          </motion.div>
        )}
      </div>
      
      {/* Modal para visualización de contenido */}
      {/* Modal para visualizar contenido en pantalla completa - No se muestra para shorts de YouTube */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => {
              setSelectedItem(null);
              setIsPlaying(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full max-h-[90dvh] overflow-hidden rounded-xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón de cierre */}
              <button 
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                onClick={() => {
                  setSelectedItem(null);
                  setIsPlaying(false);
                }}
              >
                <X size={20} />
              </button>
              
              {/* Contenido del modal - No mostramos shorts de YouTube aquí */}
              <div className="w-full h-full">
                {selectedItem.type === 'image' ? (
                  <img 
                    src={selectedItem.src} 
                    alt={selectedItem.alt || 'Imagen'} 
                    className="w-full h-full object-contain"
                  />
                ) : selectedItem.type === 'video' && !isYouTubeShortUrl(selectedItem.src) ? (
                  isYouTubeUrl(selectedItem.src) ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getYouTubeEmbedUrl(selectedItem.src)}
                        title={selectedItem.title || 'Video'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : isVimeoUrl(selectedItem.src) ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getVimeoEmbedUrl(selectedItem.src)}
                        title={selectedItem.title || 'Video'}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <video
                        className="absolute top-0 left-0 w-full h-full"
                        controls
                        autoPlay={isPlaying}
                        playsInline
                      >
                        <source src={selectedItem.src} type="video/mp4" />
                        <source src={selectedItem.src} type="video/webm" />
                        Tu navegador no soporta video HTML5.
                      </video>
                    </div>
                  )
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasonryGallery;