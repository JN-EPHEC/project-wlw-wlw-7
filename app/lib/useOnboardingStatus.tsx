import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { db } from "./firebaseConfig";

export function useOnboardingStatus() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const fetchOnboardingState = async () => {
      if (loading) return;

      if (!user) {
        setChecking(false);
        setNeedsOnboarding(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const completed = snap.exists() && snap.data()?.onboardingCompleted;
        setNeedsOnboarding(!completed);
      } catch (error) {
        console.error("Unable to fetch onboarding status", error);
        setNeedsOnboarding(false);
      } finally {
        setChecking(false);
      }
    };

    fetchOnboardingState();
  }, [loading, user]);

  return { needsOnboarding, checking };
}
