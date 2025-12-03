import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { useAuth } from "./auth-context";

export function useOnboardingStatus() {
const { user, loading, onboardingCompleted, profileChecked } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (loading || !profileChecked) return;

      if (!user) {
        setNeedsOnboarding(false);
        setChecking(false);
        return;
      }

      if (onboardingCompleted !== null) {
        setNeedsOnboarding(!onboardingCompleted);
        setChecking(false);
        return;
      }


      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const completed =
          snap.exists() && Boolean(snap.data()?.onboardingCompleted);
        setNeedsOnboarding(!completed);
      } catch (error: any) {
        // 🔹 NE PLUS utiliser console.error ici
        // ça déclenche l'écran rouge dans Expo
        console.log("Unable to verify onboarding status:", error?.message);

        // Optionnel : tu peux traiter le cas "offline" différemment
        // if (error?.message?.includes("client is offline")) {
        //   console.log("Client offline, on laisse passer l'utilisateur.");
        // }

        setNeedsOnboarding(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [loading, onboardingCompleted, profileChecked, user]);

  return { needsOnboarding, checking };
}
