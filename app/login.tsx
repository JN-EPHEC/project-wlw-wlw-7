// app/login.tsx
import { useAuth } from "@/Auth_context";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function LoginScreen() {
  const { signInWithEmail, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Si l'utilisateur est déjà connecté, on le redirige vers les tabs
  useEffect(() => {
    if (!loading && user) {
      router.replace("./tabs/Home");
    }
  }, [loading, user, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Email et mot de passe sont obligatoires.");
      return;
    }

    try {
      await signInWithEmail(email, password);
      console.log("Connexion réussie !");
      router.replace("./tabs/Home"); // on remplace le login dans l'historique
    } catch (e: any) {
      console.log(e);
      Alert.alert("Erreur connexion", e.message || "Connexion impossible.");
    }
  };

  if (loading) {
    // Auth en train de checker si quelqu'un est déjà connecté
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Chargement...</Text>
      </View>
    );
  }

  // Si user est déjà connecté, l'effet useEffect va de toute façon le rediriger
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title="Se connecter" onPress={handleLogin} />

      <Text
        style={styles.link}
        onPress={() => router.push("/register")}
      >
        Pas encore de compte ? Inscris-toi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  link: {
    marginTop: 18,
    textAlign: "center",
    textDecorationLine: "underline",
    },
});