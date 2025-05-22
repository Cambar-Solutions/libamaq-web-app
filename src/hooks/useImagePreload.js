import { useState, useEffect } from 'react';

/**
 * Hook personalizado para precargar imágenes y mejorar el rendimiento
 * @param {Array} imageSources - Array de URLs de imágenes a precargar
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.sequential - Si es true, carga las imágenes secuencialmente
 * @param {Function} options.onComplete - Callback cuando todas las imágenes se han cargado
 * @returns {Object} Estado de carga de las imágenes
 */
export function useImagePreload(imageSources = [], options = {}) {
  const { sequential = false, onComplete } = options;
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!imageSources.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    // Reiniciar el estado cuando cambian las fuentes
    setLoadedCount(0);
    setIsComplete(false);
    setErrors([]);

    const imageCache = new Map();
    let mounted = true;

    const loadImage = (src) => {
      // Si la imagen ya está en caché, no la cargamos de nuevo
      if (imageCache.has(src)) {
        handleImageLoaded();
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          if (mounted) {
            imageCache.set(src, true);
            handleImageLoaded();
          }
          resolve();
        };
        
        img.onerror = (err) => {
          if (mounted) {
            setErrors(prev => [...prev, src]);
            handleImageLoaded();
          }
          reject(err);
        };
        
        img.src = src;
      });
    };

    const handleImageLoaded = () => {
      if (mounted) {
        setLoadedCount(prev => {
          const newCount = prev + 1;
          if (newCount === imageSources.length) {
            setIsComplete(true);
            onComplete?.();
          }
          return newCount;
        });
      }
    };

    if (sequential) {
      // Carga secuencial (una después de otra)
      const loadSequentially = async () => {
        for (const src of imageSources) {
          if (!mounted) break;
          try {
            await loadImage(src);
          } catch (err) {
            console.error(`Error cargando imagen: ${src}`, err);
          }
        }
      };
      
      loadSequentially();
    } else {
      // Carga paralela (todas a la vez)
      imageSources.forEach(src => {
        loadImage(src).catch(err => {
          console.error(`Error cargando imagen: ${src}`, err);
        });
      });
    }

    return () => {
      mounted = false;
    };
  }, [imageSources, sequential, onComplete]);

  return {
    loadedCount,
    totalCount: imageSources.length,
    progress: imageSources.length ? Math.round((loadedCount / imageSources.length) * 100) : 100,
    isComplete,
    errors,
  };
}

// Caché global para imágenes precargadas
const globalImageCache = new Map();

/**
 * Función para precargar imágenes de forma global
 * @param {Array} sources - Array de URLs de imágenes a precargar
 * @returns {Promise} Promesa que se resuelve cuando todas las imágenes se han cargado
 */
export function preloadImages(sources = []) {
  if (!sources.length) return Promise.resolve();

  const promises = sources.map(src => {
    if (globalImageCache.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        globalImageCache.set(src, true);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  });

  return Promise.all(promises);
}

export default useImagePreload;
