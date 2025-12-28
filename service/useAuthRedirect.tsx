import { useAuth } from "@/Auth_context";
import { useRouter, useSegments } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase_Config";

export function useAuthRedirect() {
  const { user, loading, isRegistering } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    const checkAndRedirect = async () => {
      // Si on est en train de s'inscrire, ne rien faire
      if (isRegistering) {
        setChecking(false);
        return;
      }

      const inAuthGroup = segments[0] === "(tabs)";
      const onSondage = segments[0] === "sondage";
      const onAuth = segments[0] === "login" || segments[0] === "register";


      if (!user) {
        // Pas de user → rediriger vers login (sauf si déjà sur auth pages)
        if (inAuthGroup || onSondage) {
          router.replace("/login");
        }
      } else {
        // User connecté → vérifier si sondage complété
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const surveyCompleted = userData.surveyCompleted;


            if (!surveyCompleted && !onSondage) {
              // Sondage pas fait → rediriger vers sondage
              router.replace("/sondage");
            } else if (surveyCompleted && (onAuth || onSondage)) {
              // Sondage fait ET sur page auth/sondage → rediriger vers Home
              router.replace("/(tabs)/Home");
            }
          }
        } catch (e) {
          console.error("❌ Error checking survey status:", e);
        }
      }

      setChecking(false);
    };

    checkAndRedirect();
  }, [user, loading, segments, isRegistering]);

  return { checking };
}