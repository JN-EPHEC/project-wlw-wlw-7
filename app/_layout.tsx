import { AuthProvider } from "@/Auth_context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect } from 'react';
import "react-native-reanimated";
import { useColorScheme } from "../hooks/use-color-scheme";
import { useNotifications } from "../hooks/useNotifications";

// Empêche l'écran de démarrage de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  
  // Charger les polices Poppins
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../fonts/Poppins-Bold.ttf'),
  });

  // Initialiser les notifications
  useNotifications();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Cacher l'écran de démarrage une fois les polices chargées
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Afficher rien pendant le chargement des polices
  if (!fontsLoaded && !fontError) {
    return null;
  }

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