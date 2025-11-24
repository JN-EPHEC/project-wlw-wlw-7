// app/index.tsx
import { Redirect } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuth } from "./lib/auth-context";
import { db } from "./lib/firebaseConfig";

export default function Index() {
  const { user, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const fetchOnboardingState = async () => {
      if (loading) return;

      if (!user) {
        setCheckingProfile(false);
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
        setCheckingProfile(false);
      }
    };

    fetchOnboardingState();
  }, [loading, user]);

  if (loading || checkingProfile) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/register-next" />;
  }

  return <Redirect href="/(app)/home" />;
}