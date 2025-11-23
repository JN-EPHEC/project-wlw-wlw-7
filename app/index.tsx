// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "./lib/auth-context";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
