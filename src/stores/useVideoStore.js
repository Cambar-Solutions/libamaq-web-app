import { create } from 'zustand';

/**
 * Store para manejar el estado de reproducción de videos
 * - playingVideoId: ID del video que se está reproduciendo actualmente (null si ninguno)
 * - setPlayingVideo: Función para establecer qué video debe reproducirse
 * - clearPlayingVideo: Función para detener la reproducción
 */
export const useVideoStore = create((set) => ({
  playingVideoId: null,
  setPlayingVideo: (id) => set({ playingVideoId: id }),
  clearPlayingVideo: () => set({ playingVideoId: null }),
}));
