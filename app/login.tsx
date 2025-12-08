import { useAuth } from "@/Auth_context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../components/Colors";
import { auth } from "../firebase_Config";
import { signInWithGooglePopup } from "./SimpleGoogleAuth";

export default function LoginScreen() {
  const { signInWithEmail, user, loading, isRegistering } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user && !isRegistering) {
      router.replace("/(tabs)/Home");
    }
  }, [loading, user, isRegistering]);

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email et mot de passe obligatoires.");
      return;
    }

    try {
      await signInWithEmail(email, password);
      router.replace("/(tabs)/Home");
    } catch (e: any) {
      console.error("❌ Login error:", e);
      
      let errorMessage = "Connexion impossible.";
      
      switch (e.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          errorMessage = "❌ Email ou mot de passe incorrect.";
          break;
        case "auth/invalid-email":
          errorMessage = "❌ Email invalide.";
          break;
        case "auth/user-disabled":
          errorMessage = "❌ Ce compte a été désactivé.";
          break;
        case "auth/too-many-requests":
          errorMessage = "❌ Trop de tentatives. Réessayez plus tard.";
          break;
        case "auth/network-request-failed":
          errorMessage = "❌ Erreur réseau. Vérifiez votre connexion.";
          break;
        default:
          if (e.message) {
            errorMessage = `❌ ${e.message}`;
          }
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const result = await signInWithGooglePopup();
      
      if (result.needsSurvey) {
        router.replace("/sondage");
      } else {
        router.replace("/(tabs)/Home");
      }
    } catch (e: any) {
      console.error("❌ Google Sign-In error:", e);
      
      if (e.message === "Connexion annulée") {
        // L'utilisateur a fermé la popup, pas d'erreur à afficher
        return;
      }
      
      setError("❌ Impossible de se connecter avec Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Entrez votre email pour réinitialiser le mot de passe.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("✅ Email de réinitialisation envoyé ! Vérifiez votre boîte mail.");
    } catch (e: any) {
      console.error("❌ Password reset error:", e);
      
      let errorMessage = "Impossible d'envoyer l'email.";
      
      switch (e.code) {
        case "auth/invalid-email":
          errorMessage = "❌ Email invalide.";
          break;
        case "auth/user-not-found":
          errorMessage = "❌ Aucun compte associé à cet email.";
          break;
        default:
          if (e.message) {
            errorMessage = `❌ ${e.message}`;
          }
      }
      
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: COLORS.textPrimary, fontFamily: "Poppins-Regular" }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoWhat}>What</Text>
              <Text style={styles.logo2Do}>2Do</Text>
            </Text>
          </View>

          {/* MESSAGE D'ERREUR */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* MESSAGE DE SUCCÈS */}
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {/* FORM */}
          <View style={styles.form}>
            {/* EMAIL */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre email"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye" : "eye-off"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* LIEN MOT DE PASSE OUBLIÉ */}
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* SOCIAL LOGIN */}
          <View style={styles.socialSection}>
            <Text style={styles.socialSeparatorText}>Ou continuer avec</Text>

            <TouchableOpacity 
              style={styles.socialButtonLight}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#000000" style={{ position: "absolute", left: 18 }} />
              ) : (
                <Ionicons
                  name="logo-google"
                  size={18}
                  color="#000000"
                  style={styles.socialIcon}
                />
              )}
              <Text style={styles.socialButtonLightText}>
                {googleLoading ? "Connexion..." : "Continuer avec Google"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButtonDark}
              onPress={() => setError("Apple Sign-In non implémenté pour ce MVP")}
            >
              <Ionicons
                name="logo-apple"
                size={18}
                color="#FFFFFF"
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonDarkText}>
                Continuer avec Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* BOTTOM SIGNUP */}
          <View style={styles.bottom}>
            <Text style={styles.bottomText}>
              Vous n'avez pas de compte?
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.bottomLink}>Inscrivez-vous</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: "flex-start",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundBottom,
  },

  /* LOGO */

  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },

  logoText: {
    fontSize: 34,
    fontFamily: "Poppins-Bold",
  },

  logoWhat: {
    color: COLORS.titleGradientStart,
  },

  logo2Do: {
    color: COLORS.titleGradientEnd,
  },

  /* ERROR MESSAGE */

  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },

  /* SUCCESS MESSAGE */

  successContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderWidth: 1,
    borderColor: "#34C759",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  successText: {
    color: "#34C759",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },

  /* FORM */

  form: {
    marginBottom: 32,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },

  input: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  passwordInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },

  forgotPasswordButton: {
    alignSelf: "center",
    marginTop: 8,
  },

  forgotPasswordText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: COLORS.secondary,
  },

  primaryButton: {
    marginTop: 24,
    width: "100%",
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  /* SOCIAL */

  socialSection: {
    marginTop: 16,
  },

  socialSeparatorText: {
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },

  socialButtonLight: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  socialButtonDark: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    borderRadius: 999,
    backgroundColor: "#000000",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  socialIcon: {
    position: "absolute",
    left: 18,
  },

  socialButtonLightText: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
  },

  socialButtonDarkText: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
  },

  /* BOTTOM */

  bottom: {
    marginTop: 28,
    alignItems: "center",
  },

  bottomText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  bottomLink: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: COLORS.secondary,
  },
});