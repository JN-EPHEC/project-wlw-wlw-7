// app/(auth)/login.tsx
import { Link } from "expo-router";
import { Button, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";

export default function LoginScreen() {
  const { user, login, loading } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading && <Text>Chargement...</Text>}

      {!loading && !user && (
        <>
          <Text>Écran de login (placeholder)</Text>
          <Button
            title="Login test"
            onPress={() => login("test@test.com", "azerty123")}
          />
        </>
      )}

      {!loading && user && (
        <>
          <Text>Connecté en tant que {user.email}</Text>
          <Link href="/(app)/home">Aller à Home</Link>
        </>
      )}
    </View>
  );
}
