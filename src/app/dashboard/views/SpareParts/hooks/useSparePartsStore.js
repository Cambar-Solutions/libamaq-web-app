import { create } from 'zustand';
import { getAllSpareParts } from '../../../../../services/admin/sparePartService';

const useSparePartsStore = create((set, get) => ({
  spareParts: [],
  filteredSpareParts: [],
  isLoading: false,
  searchTerm: '',
  error: null,

  fetchSpareParts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllSpareParts();
      set({
        spareParts: response.data,
        filteredSpareParts: response.data,
        isLoading: false
      });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  setSearchTerm: (term) => {
    set((state) => {
      if (!term.trim()) {
        return { searchTerm: '', filteredSpareParts: state.spareParts };
      }
      const lower = term.toLowerCase();
      const filtered = state.spareParts.filter(
        (sparePart) =>
          sparePart.name.toLowerCase().includes(lower) ||
          sparePart.code.toLowerCase().includes(lower) ||
          sparePart.externalId?.toLowerCase().includes(lower) ||
          sparePart.description?.toLowerCase().includes(lower)
      );
      return { searchTerm: term, filteredSpareParts: filtered };
    });
  },

  addSparePart: (sparePart) =>
    set((state) => ({
      spareParts: [sparePart, ...state.spareParts],
      filteredSpareParts: [sparePart, ...state.filteredSpareParts]
    })),
  updateSparePart: (updated) =>
    set((state) => ({
      spareParts: state.spareParts.map((s) => (s.id === updated.id ? updated : s)),
      filteredSpareParts: state.filteredSpareParts.map((s) => (s.id === updated.id ? updated : s))
    })),
  removeSparePart: (id) =>
    set((state) => ({
      spareParts: state.spareParts.filter((s) => s.id !== id),
      filteredSpareParts: state.filteredSpareParts.filter((s) => s.id !== id)
    })),
}));

export default useSparePartsStore; 