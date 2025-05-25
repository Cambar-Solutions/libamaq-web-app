import { useEffect, useRef, useState, useMemo } from 'react';
import { useVideoStore } from '../../stores/useVideoStore';
import { Play, Pause } from 'lucide-react';

const VideoPlayer = ({ 
  id, 
  src, 
  type, 
  autoPlay = false, 
  className = '',
  thumbnail = null,
  ...props 
}) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { playingVideoId, setPlayingVideo } = useVideoStore();
  const isPlaying = playingVideoId === id;
  // Determinar si es un video de YouTube o YouTube Short
  const isYouTube = useMemo(() => {
    return src?.includes('youtube.com') || src?.includes('youtu.be');
  }, [src]);
  
  const isYouTubeShort = useMemo(() => {
    return src?.includes('youtube.com/shorts/');
  }, [src]);
  
  // Determinar si es un video de Vimeo
  const isVimeo = useMemo(() => {
    return src?.includes('vimeo.com');
  }, [src]);
  
  // Obtener la URL del iframe de YouTube
  const getYouTubeUrl = useMemo(() => {
    if (!src) return '';
    
    // Para YouTube Shorts
    if (src.includes('youtube.com/shorts/')) {
      const videoId = src.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1&controls=1`;
    }
    
    // Para videos normales de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = src.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1&controls=1`;
    }
    
    return src;
  }, [src, isPlaying]);

  // Manejar la reproducción/pausa
  useEffect(() => {
    if (!videoRef.current) return;
    
    const videoElement = videoRef.current;
    
    try {
      if (isPlaying) {
        // Para YouTube y Vimeo, el autoplay se maneja a través de la URL
        if (isYouTube || isVimeo) return;
        
        // Para videos HTML5
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA o superior
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error al reproducir el video:', error);
            });
          }
        }
      } else {
        videoElement.pause();
      }
    } catch (error) {
      console.error('Error en el reproductor de video:', error);
    }
  }, [isPlaying, isYouTube, isVimeo]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      // Si este video estaba reproduciéndose, limpiar el estado
      if (playingVideoId === id) {
        useVideoStore.getState().clearPlayingVideo();
      }
    };
  }, [id, playingVideoId]);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setPlayingVideo(isPlaying ? null : id);
  };

  const handleVideoClick = (e) => {
    // Si es un iframe (YouTube/Vimeo), no manejamos el clic para no interferir con los controles
    if (isYouTube || isVimeo) return;
    
    e.stopPropagation();
    setPlayingVideo(isPlaying ? null : id);
  };

  // Renderizado condicional basado en el tipo de video
  if (isYouTube) {
    // Para YouTube Shorts, usamos una relación de aspecto 9:16 (177.78%)
    // Para videos normales, usamos 16:9 (56.25%)
    const paddingBottom = isYouTubeShort ? '177.78%' : '56.25%';
    
    return (
      <div 
        className={`relative w-full overflow-hidden rounded-lg ${className}`}
        style={{
          maxWidth: isYouTubeShort ? '400px' : '100%',
          margin: isYouTubeShort ? '0 auto' : '0',
        }}
      >
        <div 
          className="relative w-full" 
          style={{ 
            paddingBottom,
            height: 0
          }}
        >
          <iframe
            ref={videoRef}
            src={getYouTubeUrl}
            title="Reproductor de video de YouTube"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            loading="lazy"
            style={{
              backgroundColor: 'black'
            }}
          />
        </div>
      </div>
    );
  }

  if (isVimeo) {
    return (
      <div className={`relative w-full h-0 pb-[56.25%] overflow-hidden rounded-lg ${className}`}>
        <iframe
          ref={videoRef}
          src={`${src}${isPlaying ? '?autoplay=1' : '?autoplay=0'}`}
          title="Reproductor de video de Vimeo"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }

  // Para videos HTML5 normales
  return (
    <div 
      className={`relative w-full h-0 pb-[56.25%] overflow-hidden rounded-lg group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute top-0 left-0 w-full h-full object-cover"
        poster={thumbnail}
        onLoadedData={() => setIsLoading(false)}
        {...props}
      />
      
      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Overlay de controles personalizados */}
      {!isPlaying && (
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'bg-black/40' : 'bg-black/20'
          }`}
        >
          <button 
            onClick={handlePlayClick}
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 focus:outline-none"
            aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
          >
            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
          </button>
        </div>
      )}
      
      {/* Botón de pausa cuando está reproduciéndose */}
      {isPlaying && isHovered && (
        <button 
          onClick={handlePlayClick}
          className="absolute top-4 right-4 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center z-10"
          aria-label="Pausar video"
        >
          <Pause className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
