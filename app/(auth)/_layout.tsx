// app/(auth)/_layout.tsx
import { Redirect, Stack, usePathname } from "expo-router";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { useOnboardingStatus } from "../lib/useOnboardingStatus";
export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { needsOnboarding, checking } = useOnboardingStatus();
  const pathname = usePathname();
  const isOnboarding = pathname?.includes("sondage-preference");

  if (loading || checking)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0B031A" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#9B5DE5" />
        </View>
      </SafeAreaView>
    );



  if (user && !isOnboarding) {
    if (needsOnboarding) {
      return <Redirect href="/sondage-preference" />;
    }
      return <Redirect href="/home" />;
  }

  return (
     <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="sondage-preference" />
    </Stack>
  );
}