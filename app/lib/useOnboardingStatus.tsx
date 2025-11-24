import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { db } from "./firebaseConfig";

export function useOnboardingStatus() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (loading) return;

      if (!user) {
        setNeedsOnboarding(false);
        setChecking(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const completed = snap.exists() && Boolean(snap.data()?.onboardingCompleted);
        setNeedsOnboarding(!completed);
      } catch (error) {
        console.error("Unable to verify onboarding status", error);
        setNeedsOnboarding(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [loading, user]);

  return { needsOnboarding, checking };
}