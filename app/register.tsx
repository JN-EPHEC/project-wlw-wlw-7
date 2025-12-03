// app/(auth)/register.tsx
import { FontAwesome } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "./lib/auth-context";

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRules = [
  { label: "Au moins 8 caractères", test: (value: string) => value.length >= 8 },
  { label: "Une lettre majuscule", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Une lettre minuscule", test: (value: string) => /[a-z]/.test(value) },
  { label: "Un chiffre", test: (value: string) => /\d/.test(value) },
  {
    label: "Un caractère spécial",
    test: (value: string) => /[!@#$%^&*(),.?\":{}|<>\\-_=+]/.test(value),
  },
];

function mapRegisterError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  const code = (error as any)?.code as string | undefined;

  if (!code) {
    return "Impossible de créer le compte pour le moment.";
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "Un compte existe déjà avec cet e-mail.";
    case "auth/invalid-email":
      return "Adresse e-mail invalide.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible.";
    case "auth/operation-not-allowed":
      return "La création de compte par e-mail/mot de passe est désactivée.";
    default:
      return "Impossible de créer le compte pour le moment.";
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirm?: string;
    general?: string;
  }>({});

  const passwordChecks = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, valid: rule.test(password) })),
    [password]
  );

  const isFormValid =
    emailRegex.test(email.trim()) &&
    username.trim().length >= 3 &&
    passwordChecks.every((check) => check.valid) &&
    confirm === password;

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const newErrors: typeof errors = {};

    if (!trimmedEmail) {
      newErrors.email = "L'email est obligatoire.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Entre une adresse email valide.";
    }

    if (!trimmedUsername) {
      newErrors.username = "Choisis un nom d'utilisateur.";
    } else if (trimmedUsername.length < 3) {
      newErrors.username = "3 caractères minimum.";
    }

    if (!password) {
      newErrors.password = "Crée un mot de passe solide.";
    } else if (!passwordChecks.every((check) => check.valid)) {
      newErrors.password = "Le mot de passe doit respecter toutes les règles.";
    }

    if (!confirm) {
      newErrors.confirm = "Confirme ton mot de passe.";
    } else if (confirm !== password) {
      newErrors.confirm = "Les mots de passe ne correspondent pas.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      await register(trimmedEmail, password, trimmedUsername);
      router.replace("/sondage-preference");
    } catch (err) {
      console.log("Register error:", (err as any)?.code, err);
      const message = mapRegisterError(err);
      setErrors({ general: message });
    } finally {
      setSubmitting(false);
    }
  };

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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={styles.header}>
              {Platform.OS === "web" ? (
                <Text
                  // @ts-ignore props web
                  style={{
                    ...styles.logoText,
                    backgroundImage: "linear-gradient(90deg, #A259FF, #00A3FF)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  } as any}
                >
                  What2Do
                </Text>
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
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Entrez votre nom d'utilisateur"
                  placeholderTextColor={COLORS.textDisabled}
                  autoCapitalize="none"
                  style={styles.input}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor={COLORS.textDisabled}
                  secureTextEntry
                  autoComplete="password-new"
                  style={styles.input}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <View style={styles.passwordChecks}>
                  {passwordChecks.map((rule) => (
                    <View key={rule.label} style={styles.checkRow}>
                      <FontAwesome
                        name={rule.valid ? "check-circle" : "circle"}
                        size={14}
                        color={rule.valid ? "#46E4D6" : COLORS.textDisabled}
                      />
                      <Text
                        style={[
                          styles.checkText,
                          rule.valid && styles.checkTextValid,
                        ]}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirmer mot de passe</Text>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor={COLORS.textDisabled}
                  secureTextEntry
                  autoComplete="password-new"
                  style={styles.input}
                />
                {errors.confirm && (
                  <Text style={styles.errorText}>{errors.confirm}</Text>
                )}
              </View>

              {errors.general && (
                <Text style={[styles.errorText, { textAlign: "center" }]}>
                  {errors.general}
                </Text>
              )}

              {/* Bouton gradient */}
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={submitting || !isFormValid}
                onPress={handleRegister}
                style={[
                  styles.buttonWrapper,
                  (!isFormValid || submitting) && styles.buttonDisabled,
                ]}
              >
                <LinearGradient
                  colors={[COLORS.logoStart, COLORS.logoEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  {submitting ? (
                    <ActivityIndicator color={COLORS.textPrimary} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Créer un compte</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Vous avez un compte ?</Text>
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Connectez-vous</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    ...TYPO.h1,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  form: {
    gap: 16,
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
    textAlign: "center",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  passwordChecks: {
    gap: 6,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkText: {
    color: COLORS.textDisabled,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  checkTextValid: {
    color: "#46E4D6",
    fontFamily: "Poppins-Medium",
  },
  buttonWrapper: {
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...TYPO.button,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
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
