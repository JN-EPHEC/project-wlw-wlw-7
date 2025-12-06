import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { listenAuthChanges, logout, signIn, signUp } from "./Auth_service";

type AuthContextType = {
  user: User | null;
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
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = listenAuthChanges((currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
    });
    return unsubscribe;
  }, []); 

  const signInWithEmail = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await signUp(email, password);
  };  

  const logoutUser = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isRegistering, 
      setIsRegistering,
      signInWithEmail, 
      signUpWithEmail, 
      logoutUser 
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
}