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
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../lib/auth-context";

function mapAuthError(error: unknown): string {
  const code = (error as any)?.code as string | undefined;
  const message = error instanceof FirebaseError ? error.message : undefined;

  if (!code) {
    return (
      message ?? "Une erreur s'est produite lors de la connexion."
    );
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
    case "auth/invalid-credential":
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
            <View style={styles.fieldGroup}>
@@ -131,59 +201,61 @@ export default function LoginScreen() {
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
              disabled={submitting}
            >
              <FontAwesome name="google" size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.85}
              onPress={() => handleProviderPress("apple")}
              disabled={submitting}
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