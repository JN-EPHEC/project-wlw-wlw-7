import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../components/Colors";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase_Config";

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    console.log("▶ handleRegister called");
    setError("");

    if (!email || !username || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      console.log("▶ Creating user in Firebase Auth...");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      console.log("✅ User created:", user.uid);

      console.log("▶ Updating profile displayName...");
      await updateProfile(user, { displayName: username });
      console.log("✅ Profile updated");

      console.log("▶ Creating user document in Firestore...");
      const userRef = doc(db, "users", user.uid);
      
      const userData = {
        uid: user.uid,
        email: email.toLowerCase(),
        username: username.trim(),
        createdAt: new Date().toISOString(),
        surveyCompleted: false,
        accountType: null,
        interests: [],
        city: null,
        friends: [], // ← IMPORTANT pour le système d'amis
        expoPushToken: null, // ← IMPORTANT pour les notifications
      };
      
      await setDoc(userRef, userData);
      console.log("✅ Firestore doc created successfully!");

      // REDIRECTION IMMÉDIATE
      console.log("▶ Redirecting to /sondage");
      router.replace("/sondage");

    } catch (e: any) {
      console.error("❌ Error in handleRegister:", e);
      
      let errorMessage = "Inscription impossible.";
      if (e.code === "auth/email-already-in-use") {
        errorMessage = "❌ Cet email est déjà utilisé.";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "❌ Email invalide.";
      } else if (e.code === "auth/weak-password") {
        errorMessage = "❌ Mot de passe trop faible.";
      } else if (e.message) {
        errorMessage = `❌ ${e.message}`;
      }
      
      setError(errorMessage);
    }
  };

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

          {/* FORM */}
          <View style={styles.form}>
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre nom d'utilisateur"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                autoCapitalize="none"
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmer mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* BOUTON CRÉER UN COMPTE */}
            <TouchableOpacity style={styles.primaryButtonWrapper} onPress={handleRegister}>
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Créer un compte</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.bottom}>
            <Text style={styles.bottomText}>Vous avez un compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.bottomLink}>Connectez-vous</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: "flex-start",
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logoText: {
    fontSize: 34,
    fontWeight: "700",
  },
  logoWhat: {
    color: COLORS.titleGradientStart,
  },
  logo2Do: {
    color: COLORS.titleGradientEnd,
  },
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
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 8,
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
    fontSize: 14,
    textAlign: "center",
  },
  primaryButtonWrapper: {
    marginTop: 24,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  primaryButton: {
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  bottom: {
    marginTop: 28,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottomLink: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: "600",
  },
});