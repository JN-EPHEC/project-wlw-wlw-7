import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/auth-context";

function NavigationGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || (segments.length as number) === 0) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    // Pas connecté → redirige vers login
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // Connecté → redirige vers home s'il reste dans (auth)
    if (user && inAuthGroup) {
      router.replace("/(app)/home");
      return;
    }
  }, [loading, user, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard />
    </AuthProvider>
  );
}
