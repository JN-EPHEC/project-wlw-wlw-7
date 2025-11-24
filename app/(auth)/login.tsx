// app/(auth)/login.tsx
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../lib/auth-context";

function mapAuthError(error: unknown): string {
  const code = (error as any)?.code as string | undefined;

  if (!code) {
    return "Une erreur s'est produite lors de la connexion.";
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Mot de passe incorrect.";
    case "auth/user-not-found":
      return "Aucun compte ne correspond à cet e-mail.";
    case "auth/invalid-email":
      return "Adresse e-mail invalide.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessayez plus tard.";
    default:
      return "Une erreur s'est produite lors de la connexion.";
  }
}


export default function LoginScreen() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    // petite validation basique côté client
    if (!email.trim() || !password) {
      setError("Veuillez entrer votre e-mail et votre mot de passe.");
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      // si login échoue, ça throw et on passe dans le catch
    } catch (err) {
      const message = mapAuthError(err);
      setError(message);
      // si tu veux en plus un popup :
      // Alert.alert("Connexion impossible", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderPress = (provider: "google" | "apple") => {
    Alert.alert(
      "Bientôt disponible",
      `La connexion avec ${provider === "google" ? "Google" : "Apple"} sera disponible prochainement.`
    );
  };

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9B5DE5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.logoText, styles.logoPink]}>What</Text>
            <Text style={[styles.logoText, styles.logoBlue]}>2</Text>
            <Text style={[styles.logoText, styles.logoTeal]}>Do</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Entrez votre email"
                placeholderTextColor="#6E6881"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor="#6E6881"
                secureTextEntry
                autoComplete="password"
                style={styles.input}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Ou continuer avec</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.85}
              onPress={() => handleProviderPress("google")}
            >
              <FontAwesome name="google" size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.85}
              onPress={() => handleProviderPress("apple")}
            >
              <FontAwesome name="apple" size={22} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous n'avez pas de compte?</Text>
            <Link href="/(auth)/register" style={styles.link}>
              Inscrivez-vous
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050013",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoPink: {
    color: "#B74BD9",
  },
  logoBlue: {
    color: "#6E5BFF",
  },
  logoTeal: {
    color: "#46E4D6",
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#1C1630",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: "#7C5BBF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#1F1A2F",
  },
  dividerText: {
    color: "#6E6881",
    fontSize: 13,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: "#0F0A1F",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "auto",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  link: {
    color: "#46E4D6",
    fontSize: 14,
    fontWeight: "700",
  },
});
