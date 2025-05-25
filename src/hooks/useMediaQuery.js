import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Verificamos si window está disponible (para evitar errores en SSR)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Establecemos el valor inicial
      setMatches(media.matches);
      
      // Definimos el listener para cambios
      const listener = () => setMatches(media.matches);
      
      // Agregamos el listener
      media.addEventListener('change', listener);
      
      // Limpiamos el listener al desmontar
      return () => media.removeEventListener('change', listener);
    }
    
    // Por defecto, devolvemos false si no hay window
    return () => {};
  }, [query]);

  return matches;
};
