import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (serviceId: string) => void;
  removeFavorite: (serviceId: string) => void;
  isFavorite: (serviceId: string) => boolean;
  toggleFavorite: (serviceId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (serviceId: string) => {
        set((state) => ({
          favorites: [...state.favorites, serviceId]
        }));
      },

      removeFavorite: (serviceId: string) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== serviceId)
        }));
      },

      isFavorite: (serviceId: string) => {
        return get().favorites.includes(serviceId);
      },

      toggleFavorite: (serviceId: string) => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.includes(serviceId)) {
          removeFavorite(serviceId);
        } else {
          addFavorite(serviceId);
        }
      },
    }),
    {
      name: 'banco-tempo-favorites',
    }
  )
);