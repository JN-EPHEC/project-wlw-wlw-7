import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { create } from 'zustand';

// 👉 On importe simplement les instances déjà initialisées
import { auth, db } from './firebase.js';


type Profile = {
  displayName: string;
  city: string;
  persona?: string;
  bio?: string;
  interests: string[];
};

type AuthStore = {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  hasCompletedProfile: boolean;
  email?: string;
  preferredName?: string;
  profile?: Profile;
  userId?: string;
  authError?: string;
  loginExisting: (email: string, password: string) => Promise<void>;
  startSignup: (email: string, preferredName: string, password: string) => Promise<void>;
  completeProfile: (profile: Profile) => Promise<void>;
  reset: () => void;
};

const initialState: Omit<AuthStore, 'loginExisting' | 'startSignup' | 'completeProfile' | 'reset'> = {
  isAuthenticated: false,
  hasCompletedProfile: false,
  isAuthenticating: false,
  email: undefined,
  preferredName: undefined,
  profile: undefined,
  userId: undefined,
  authError: undefined,
};

const parseFirebaseError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur est survenue. Merci de réessayer.';
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,
  loginExisting: async (email, password) => {
    set((state) => ({ ...state, isAuthenticating: true, authError: undefined }));

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      set((state) => ({
        ...state,
        email: user.email ?? email,
        preferredName: user.displayName ?? state.preferredName,
        isAuthenticated: true,
        hasCompletedProfile: true,
        userId: user.uid,
        isAuthenticating: false,
      }));
    } catch (error) {
      set((state) => ({ ...state, isAuthenticating: false, authError: parseFirebaseError(error) }));
      throw error;
    }
  },
  startSignup: async (email, preferredName, password) => {
    set(() => ({ ...initialState, isAuthenticating: true }));

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (preferredName.trim().length > 0) {
        await updateProfile(credential.user, { displayName: preferredName.trim() });
      }

      set((state) => ({
        ...state,
        email,
        preferredName,
        isAuthenticated: true,
        hasCompletedProfile: false,
        userId: credential.user.uid,
        isAuthenticating: false,
        authError: undefined,
      }));
    } catch (error) {
      set((state) => ({ ...state, isAuthenticating: false, authError: parseFirebaseError(error) }));
      throw error;
    }
  },
  completeProfile: async (profile) => {
    const userId = get().userId ?? auth.currentUser?.uid;

    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }

    await setDoc(
      doc(db, 'profiles', userId),
      {
        ...profile,
        email: get().email,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    set((state) => ({
      ...state,
      profile,
      preferredName: profile.displayName,
      hasCompletedProfile: true,
      isAuthenticated: true,
    }));
  },
  reset: () => set(() => ({ ...initialState })),
}));

export type { Profile };

