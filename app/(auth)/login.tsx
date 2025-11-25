// app/(auth)/login.tsx
import { FontAwesome } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
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
import { useOnboardingStatus } from "../lib/useOnboardingStatus";

const COLORS = {
  backgroundStart: "#110A1E",
  backgroundEnd: "#0A0612",
  primary: "#3A2A60",
  secondary: "#B57BFF",
  logoStart: "#A259FF",
  logoEnd: "#00A3FF",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textDisabled: "#6B7280",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  overlay: "rgba(59,130,246,0.6)",
  neutralGray800: "#1F2937",
  inputBackground: "#141329",
};

const TYPO = {
  h1: { fontFamily: "Poppins-Bold" as const, fontSize: 32 },
  label: { fontFamily: "Poppins-Medium" as const, fontSize: 14 },
  body: { fontFamily: "Poppins-Regular" as const, fontSize: 16 },
  button: { fontFamily: "Poppins-SemiBold" as const, fontSize: 16 },
};

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
  const [activeProvider, setActiveProvider] =
    useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { needsOnboarding, checking } = useOnboardingStatus();

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

  useEffect(() => {
    if (loading || checking || !user) return;

    if (needsOnboarding) {
      router.replace("/register-next");
      return;
    }

    router.replace("/home");
  }, [user, loading, checking, needsOnboarding, router]);

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
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
          style={styles.gradient}
        >
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            {/* Logo gradient (mobile) / couleur simple (web) */}
            <View style={styles.header}>
              {Platform.OS === "web" ? (
                <Text style={styles.logoTextWeb}>What2Do</Text>
              ) : (
                <MaskedView
                  maskElement={<Text style={styles.logoText}>What2Do</Text>}
                >
                  <LinearGradient
                    colors={[COLORS.logoStart, COLORS.logoEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.logoText, { opacity: 0 }]}>
                      What2Do
                    </Text>
                  </LinearGradient>
                </MaskedView>
              )}
            </View>

            {/* Form */}
            <View style={styles.form}>
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
                  placeholderTextColor={COLORS.textDisabled}
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
                  placeholderTextColor={COLORS.textDisabled}
                  secureTextEntry
                  autoComplete="password"
                  style={styles.input}
                  editable={!submitting}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.primaryButton,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>Se connecter</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Ou continuer avec</Text>
              <View style={styles.line} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                activeOpacity={0.85}
                onPress={() => handleProviderPress("google")}
                disabled={submitting}
              >
                {activeProvider === "google" && submitting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <FontAwesome name="google" size={20} color="#000000" />
                )}
                <Text style={styles.googleButtonText}>
                  Continuer avec Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                activeOpacity={0.85}
                onPress={() => handleProviderPress("apple")}
                disabled={submitting}
              >
                {activeProvider === "apple" && submitting ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <FontAwesome
                    name="apple"
                    size={22}
                    color={COLORS.textPrimary}
                  />
                )}
                <Text style={styles.appleButtonText}>
                  Continuer avec Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Vous n'avez pas de compte ?
              </Text>
              <Link href="/register" style={styles.link}>
                Inscrivez-vous
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    ...TYPO.h1,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  // pour le web on met une couleur secondaire (MaskView bug sur web)
  logoTextWeb: {
    ...TYPO.h1,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  form: {
    gap: 20,
  },
  errorBox: {
    backgroundColor: "#2C1026",
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    ...TYPO.label,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: TYPO.body.fontSize,
    fontFamily: TYPO.body.fontFamily,
    borderWidth: 1,
    borderColor: COLORS.neutralGray800,
    textAlign: "center", // texte + placeholder centrés
  },
  primaryButton: {
    marginTop: 24,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...TYPO.button,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutralGray800,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: "center", // centre le contenu (icône + texte)
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: COLORS.neutralGray800,
  },
  googleButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#000000",
    textAlign: "center",
  },
  appleButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  footer: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
  },
  link: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.secondary,
    textDecorationLine: "underline",
  },
});
