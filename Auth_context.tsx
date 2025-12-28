import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { listenAuthChanges, logout, signIn, signUp } from "./Auth_service";
import { db } from "./firebase_Config";
import { registerForPushNotificationsAsync, savePushToken } from "./service/notificationService";

// Interface pour le profil utilisateur
interface UserProfile {
  displayName: string;
  isPremium: boolean;
  email?: string;
  photoURL?: string;
  expoPushToken?: string;
  notificationsEnabled?: boolean;
  // Ajoute d'autres champs si nécessaire
}

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isRegistering: boolean;
  setIsRegistering: (value: boolean) => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
};  

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = listenAuthChanges((currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
    });
    return unsubscribe;
  }, []); 

  // 👇 NOUVEAU : Setup des notifications après connexion
  useEffect(() => {
    const setupNotifications = async () => {
      if (user && !isRegistering) {
        
        try {
          const token = await registerForPushNotificationsAsync();
          
          if (token) {
            await savePushToken(user.uid, token);
          } else {
          }
        } catch (error) {
          console.error("❌ Erreur setup notifications:", error);
        }
      }
    };

    setupNotifications();
  }, [user, isRegistering]);

  // Écouter les changements du profil utilisateur dans Firestore
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    // Écouter le document utilisateur dans Firestore
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            displayName: data.displayName || data.name || user.displayName || "Utilisateur",
            isPremium: data.isPremium || false,
            email: data.email || user.email || "",
            photoURL: data.photoURL || user.photoURL || "",
            expoPushToken: data.expoPushToken || "",
            notificationsEnabled: data.notificationsEnabled || false,
          });
        } else {
          // Si le document n'existe pas, créer un profil par défaut
          setUserProfile({
            displayName: user.displayName || "Utilisateur",
            isPremium: false,
            email: user.email || "",
            photoURL: user.photoURL || "",
            expoPushToken: "",
            notificationsEnabled: false,
          });
        }
      },
      (error) => {
        console.error("Erreur lors de la récupération du profil:", error);
        // Profil par défaut en cas d'erreur
        setUserProfile({
          displayName: user.displayName || "Utilisateur",
          isPremium: false,
          email: user.email || "",
          photoURL: user.photoURL || "",
          expoPushToken: "",
          notificationsEnabled: false,
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signInWithEmail = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await signUp(email, password);
  };  

  const logoutUser = async () => {
    await logout();
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      loading, 
      isRegistering, 
      setIsRegistering,
      signInWithEmail, 
      signUpWithEmail, 
      logoutUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }   
  return ctx;
};

// Export du type UserProfile pour utilisation ailleurs
export type { UserProfile };

