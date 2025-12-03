// app/lib/auth-context.tsx
import {
  User,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import { auth, db, googleProvider } from "../../firebaseConfig";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  onboardingCompleted: boolean | null;
  profileChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  lastAuthError: unknown | null;
  clearAuthError: () => void;
  markOnboardingCompleted: () => void;

};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [lastAuthError, setLastAuthError] = useState<unknown | null>(null);

  // 🔐 Gère l'état de connexion + création du document user si besoin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setOnboardingCompleted(null);
      setProfileChecked(false);
      if (!firebaseUser) {
        setProfileChecked(true);
        return;
      }
      // on fait la partie Firestore dans une IIFE avec try/catch
      (async () => {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            await setDoc(
              userRef,
              {
                email: firebaseUser.email,
                createdAt: new Date(),
                onboardingCompleted: false,
              },
              { merge: true }
            );

            setOnboardingCompleted(false);
            setProfileChecked(true);
            return;
          }
          const userData = snap.data();
          setOnboardingCompleted(Boolean(userData?.onboardingCompleted));
          setProfileChecked(true);
        } catch (error: any) {
          // IMPORTANT : pas de console.error ici, juste un log
          console.log(
            "Impossible de synchroniser le document utilisateur :",
            error?.message ?? error
          );
          // On ne rethrow PAS → pas d'écran rouge
          setOnboardingCompleted(null);
          setProfileChecked(true);
        }
      })();
    });

    return unsubscribe;
  }, []);

  // Résout le redirect pour Google/Apple sur mobile
  useEffect(() => {
    const resolveRedirectResult = async () => {
      try {
        if (Platform.OS !== "web") {
          await getRedirectResult(auth);
        }
      } catch (error) {
        setLastAuthError(error);
      }
    };

    resolveRedirectResult();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithProvider = () =>
    Platform.OS === "web" ? signInWithPopup : signInWithRedirect;

  const loginWithGoogle = async () => {
    const performLogin = loginWithProvider();
    try {
      await performLogin(auth, googleProvider);
    } catch (error) {
      setLastAuthError(error);
      throw error;
    }
  };


  const register = async (email: string, password: string, username: string) => {
    const normalizedUsername = username.trim();
    const normalizedLower = normalizedUsername.toLowerCase();

    const existingUsernames = await getDocs(
      query(collection(db, "users"), where("usernameLower", "==", normalizedLower))
    );

    if (!existingUsernames.empty) {
      throw new Error("Ce nom d'utilisateur est déjà pris.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, "users", cred.user.uid);

    await setDoc(
      userRef,
      {
        email,
        username: normalizedUsername,
        usernameLower: normalizedLower,
        createdAt: new Date(),
        onboardingCompleted: false,
        accountType: null,
        interests: [],
      },
      { merge: true }
    );
    setOnboardingCompleted(false);
    setProfileChecked(true);
  };

  const markOnboardingCompleted = () => setOnboardingCompleted(true);

  const logout = async () => {
    await signOut(auth);
    // reset local auth-related state after sign out
    setUser(null);
    setOnboardingCompleted(null);
    setProfileChecked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        onboardingCompleted,
        profileChecked,
        login,
        loginWithGoogle,
        register,
        logout,
        lastAuthError,
        clearAuthError: () => setLastAuthError(null),
        markOnboardingCompleted
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
