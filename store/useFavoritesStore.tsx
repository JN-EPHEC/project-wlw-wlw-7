import type { Activity } from '@/constants/theme';
import { create } from 'zustand';

type FavoritesStore = {
  favorites: Activity[];
  addFavorite: (activity: Activity) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (activity: Activity) => void;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  addFavorite: (activity) =>
    set((s) => ({ favorites: [...s.favorites, activity] })),
  removeFavorite: (id) =>
    set((s) => ({ favorites: s.favorites.filter((a) => a.id !== id) })),
  isFavorite: (id) => get().favorites.some((a) => a.id === id),
  toggleFavorite: (activity) => {
    const { isFavorite, removeFavorite, addFavorite } = get();
    isFavorite(activity.id) ? removeFavorite(activity.id) : addFavorite(activity);
  },
}));