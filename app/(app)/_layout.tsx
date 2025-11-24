// app/(app)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../lib/auth-context";
import { useOnboardingStatus } from "../lib/useOnboardingStatus";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { needsOnboarding, checking } = useOnboardingStatus();

  if (loading || checking) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/register-next" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#050013",
          borderTopColor: "#26263F",
        },
        tabBarActiveTintColor: "#7B5CFF",
        tabBarInactiveTintColor: "#888",
      }}
    >
      {/* ACCUEIL */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      {/* JEUX */}
      <Tabs.Screen
        name="games"
        options={{
          title: "Jeux",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" color={color} size={size} />
          ),
        }}
      />

      {/* GROUPES */}
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groupes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />

      {/* PROFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
