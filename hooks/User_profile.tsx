import { useAuth } from "@/Auth_context";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase_config";

export type UserProfile = {
    displayName: string | null;
    username : string | null;
    bio: string | null;
    city : string | null;
    age : number | null;
    interests: string[];
    createdAt : number;
};

type UserProfileResult = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
};

export function useUserProfile(): UserProfileResult {
  const {user} = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.uid ?? null; 

    useEffect(() => {
    if (!userId) {
        setProfile(null);
        setLoading(false);
        return;
    }

    const ref = doc(db, "users", userId);

    const unsubscribe = onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
            setProfile(null);
        } else {
            setProfile(snap.data() as UserProfile);
        }
        setLoading(false);
    }, 
    (err) => {
        console.error("Erreur Firestore profil :", err);
        setError("Impossible de charger le profil");
        setLoading(false);
        }
    );
    return unsubscribe;
    }, [userId]);

  const saveProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!userId) {
        throw new Error("Aucun utilisateur connecté");
    }

    const ref = doc(db, "users", userId);
    const baseProfile: UserProfile = {
        displayName: user?.displayName ?? user?.email ?? null,
        username : null,
        bio: null,
        city : null,
        age : null,
        interests: [],
        createdAt: Date.now(),
    };

    try {
        if (!profile){
            await setDoc(ref, {
                ...baseProfile,
                ...data,
            });
        } else {
            await updateDoc(ref, {
                ...data,
            });
        }
        } catch (err) {
            console.error("Erreur sauvegarde profil :", err);
            throw err;
        }
        }, 
        [userId, profile, user]
    );

    return {profile, loading, error, saveProfile};
  }