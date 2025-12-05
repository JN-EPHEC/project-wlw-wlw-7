import { AuthProvider } from "@/Auth_context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "../hooks/use-color-scheme";
import { useNotifications } from "../hooks/useNotifications";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  
  // Initialiser les notifications
  useNotifications();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Landing page */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Auth pages */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="sondage" options={{ headerShown: false }} />
        
        {/* Edit profile (hors tabs) */}
        <Stack.Screen name="Profile/Modif-prof" options={{ headerShown: false }} />
        
        {/* Tabs (Home, Jeux, Groupes, Profile) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}