// app/index.tsx
import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "./lib/auth-context";
import { useOnboardingStatus } from "./lib/useOnboardingStatus";

export default function Index() {
  const { user, loading } = useAuth();
  const { needsOnboarding, checking } = useOnboardingStatus();

  if (loading || checking) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/register-next" />;
  }

  return <Redirect href="/(app)/home" />;
}