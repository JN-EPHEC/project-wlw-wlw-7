// app/(auth)/register.tsx
import { FontAwesome } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRules = [
  { label: "Au moins 8 caractères", test: (value: string) => value.length >= 8 },
  { label: "Une lettre majuscule", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Une lettre minuscule", test: (value: string) => /[a-z]/.test(value) },
  { label: "Un chiffre", test: (value: string) => /\d/.test(value) },
  {
    label: "Un caractère spécial",
    test: (value: string) => /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(value),
  },
];

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
      await register(trimmedEmail, password);
      router.push("./register-next");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de créer le compte pour le moment.";
      setErrors({ general: message });
    } finally {
      setSubmitting(false);
    }
  };

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
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Crée ton profil pour que l'on puisse te proposer quoi faire.
            </Text>

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
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Entrez votre nom d'utilisateur"
                placeholderTextColor="#6E6881"
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
                placeholderTextColor="#6E6881"
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
                      color={rule.valid ? "#46E4D6" : "#6E6881"}
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
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor="#6E6881"
                secureTextEntry
                autoComplete="password-new"
                style={styles.input}
              />
              {errors.confirm && (
                <Text style={styles.errorText}>{errors.confirm}</Text>
              )}
            </View>

            {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.primaryButton, !isFormValid && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={submitting || !isFormValid}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Créer un compte</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Vous avez un compte?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Connectez-vous</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
  passwordChecks: {
    gap: 6,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkText: {
    color: "#6E6881",
    fontSize: 13,
  },
  checkTextValid: {
    color: "#46E4D6",
    fontWeight: "700",
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
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