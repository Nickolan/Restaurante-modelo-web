import { create } from 'zustand';
import api from '../services/api'; // Importamos la instancia de axios ya configurada

const useConfigStore = create((set) => ({
  // Estados existentes
  theme: 'dark',
  loading: false,
  isMenuOpen: false,
  
  // Nuevo estado para las categorías
  categorias: [],

  // Acciones
  setLoading: (status) => set({ loading: status }),
  
  // Función para llamar a la API
  fetchCategorias: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/menu/categoria'); // Ruta solicitada
      set({ categorias: response.data, loading: false });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      set({ loading: false });
    }
  },
}));

export default useConfigStore;