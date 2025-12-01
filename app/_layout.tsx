import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/auth-context";

import { useFonts } from "expo-font";


function NavigationGuard() {
  const { user, loading, onboardingCompleted, profileChecked } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || !profileChecked) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isOnboardingRoute = inAuthGroup && segments[1] === "sondage-preference";

    // Pas connecté → redirige vers login
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (user && onboardingCompleted === null) {
      return;
    }

    // Connecté mais onboarding non terminé → forcer le passage par le sondage
    if (user && onboardingCompleted === false && !isOnboardingRoute) {
      router.replace("/(auth)/sondage-preference");
      return;
    }

    // Connecté → redirige vers home s'il reste dans (auth)
    if (user && onboardingCompleted !== false && inAuthGroup) {
      router.replace("/(app)/home");
      return;
    }
  }, [
    loading,
    profileChecked,
    user,
    onboardingCompleted,
    segments,
    router,
  ]);

  return <Slot />;
}

export default function RootLayout() {
useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

 

  return (
    <AuthProvider>
      <NavigationGuard />
    </AuthProvider>
  );
}
