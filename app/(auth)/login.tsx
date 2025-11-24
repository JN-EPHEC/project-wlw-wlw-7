// app/(auth)/login.tsx
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { FirebaseError } from "firebase/app";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const message = error instanceof FirebaseError ? error.message : undefined;

  if (!code) {
    return message ?? "Une erreur s'est produite lors de la connexion.";
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
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "La fenêtre de connexion a été fermée avant d'être terminée.";
    case "auth/operation-not-supported-in-this-environment":
      return "Ce mode de connexion n'est pas disponible sur cet appareil.";
    case "auth/missing-client-id":
      return "La configuration Apple semble incomplète ou invalide.";
    case "auth/configuration-not-found":
      return "La connexion Apple n'est pas encore configurée sur ce projet.";
    case "auth/account-exists-with-different-credential":
      return "Un compte existe déjà avec une autre méthode de connexion pour cet email.";
    default:
      return message ?? "Une erreur s'est produite lors de la connexion.";
  }
}

export default function LoginScreen() {
  const {
    user,
    login,
    loginWithGoogle,
    loginWithApple,
    loading,
    lastAuthError,
    clearAuthError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"google" | "apple" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lastAuthError) {
      setError(mapAuthError(lastAuthError));
      setSubmitting(false);
      setActiveProvider(null);
      clearAuthError();
    }
  }, [lastAuthError, clearAuthError]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleWindowFocus = () => {
      // If the popup was closed manually, Firebase sometimes delays error resolution.
      // Clearing the loading state when focus returns avoids a stuck spinner for the user.
      if (activeProvider && submitting && !user) {
        setSubmitting(false);
        setActiveProvider(null);
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [activeProvider, submitting, user]);

  useEffect(() => {
    if (user && submitting) {
      setSubmitting(false);
    }
  }, [user, submitting]);

  const handleLogin = async () => {
    setError(null);
    clearAuthError();

    if (!email.trim() || !password) {
      setError("Veuillez entrer votre e-mail et votre mot de passe.");
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      const message = mapAuthError(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderPress = async (provider: "google" | "apple") => {
    setError(null);
    clearAuthError();
    setActiveProvider(provider);
    setSubmitting(true);

    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithApple();
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
      setActiveProvider(null);
    }
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
            <Text style={styles.title}>Heureux de vous revoir</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour retrouver vos groupes et vos idées de sorties.
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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
                editable={!submitting}
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
                editable={!submitting}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
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
              disabled={submitting}
            >
              {activeProvider === "google" && submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <FontAwesome name="google" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.85}
              onPress={() => handleProviderPress("apple")}
              disabled={submitting}
            >
              {activeProvider === "apple" && submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <FontAwesome name="apple" size={22} color="#FFFFFF" />
              )}
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
    backgroundColor: "#050013",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
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
    backgroundColor: "#09031A",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderColor: "#1F1A2F",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6E6881",
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#2C1026",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
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
    backgroundColor: "#0F0A24",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#1F1A2F",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: "#7C5BBF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#7C5BBF",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    marginVertical: 20,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0F0A24",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderColor: "#1F1A2F",
    borderWidth: 1,
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
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