import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    // Pour l'instant, on simule une authentification simple
    // Dans une vraie app, vous feriez un appel API ici
    const user = {
      id: '1',
      name: 'Utilisateur',
      email: email,
    };
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
