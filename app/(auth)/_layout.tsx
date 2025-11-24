// app/(auth)/_layout.tsx
import { Redirect, Stack, usePathname } from "expo-router";
import { useAuth } from "../lib/auth-context";
import { useOnboardingStatus } from "../lib/useOnboardingStatus";
export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { needsOnboarding, checking } = useOnboardingStatus();
  const pathname = usePathname();
  const isOnboarding = pathname?.includes("register-next");

  if (loading || checking) return null;

  if (user && !isOnboarding) {
    if (needsOnboarding) {
      return <Redirect href="/(auth)/register-next" />;
    }
    return <Redirect href="/(app)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-next" />
    </Stack>
  );
}