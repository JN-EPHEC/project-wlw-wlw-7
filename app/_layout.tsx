import { AuthProvider } from "@/Auth_context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "../hooks/use-color-scheme";

export const unstable_settings = {
  initialRouteName: "login", // La landing page est le login
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* LOGIN est la première page */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          
          {/* REGISTER */}
          <Stack.Screen name="register" options={{ headerShown: false }} />
          
          {/* SONDAGE */}
          <Stack.Screen name="sondage" options={{ headerShown: false }} />
          
          {/* TABS (Home, etc.) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          {/* MODAL */}
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}