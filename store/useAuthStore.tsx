import { create } from 'zustand';

type Profile = {
  displayName: string;
  city: string;
  persona?: string;
  bio?: string;
  interests: string[];
};

type AuthStore = {
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  email?: string;
  preferredName?: string;
  profile?: Profile;
  loginExisting: (email: string) => void;
  startSignup: (email: string, preferredName: string) => void;
  completeProfile: (profile: Profile) => void;
  reset: () => void;
};

const initialState = {
  isAuthenticated: false,
  hasCompletedProfile: false,
  email: undefined as string | undefined,
  preferredName: undefined as string | undefined,
  profile: undefined as Profile | undefined,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  loginExisting: (email) =>
    set((state) => ({
      ...state,
      email,
      isAuthenticated: true,
      hasCompletedProfile: true,
    })),
  startSignup: (email, preferredName) =>
    set(() => ({
      ...initialState,
      email,
      preferredName,
      isAuthenticated: true,
      hasCompletedProfile: false,
    })),
  completeProfile: (profile) =>
    set((state) => ({
      ...state,
      profile,
      preferredName: profile.displayName,
      hasCompletedProfile: true,
      isAuthenticated: true,
    })),
  reset: () => set(() => ({ ...initialState })),
}));

export type { Profile };

