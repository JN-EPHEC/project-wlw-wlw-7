import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase_Config";

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) Création du compte dans Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // 2) Optionnel : définir le displayName dans Auth
      await updateProfile(user, {
        displayName: username,
      });

      // 3) Création du document Firestore users/{uid}
      const userRef = doc(db, "users", user.uid);

      await setDoc(userRef, {
        uid: user.uid,
        email: email.toLowerCase(),
        username: username.trim(),
        createdAt: serverTimestamp(),

        // champs pour le sondage (on les remplira plus tard)
        surveyCompleted: false,
        surveyData: null,
      });

      // 4) Rediriger vers la page de sondage (à créer)
      router.replace("/sondage"); // tu créeras /survey plus tard
    } catch (e: any) {
      console.error(e);
      Alert.alert("Erreur", e.message || "Inscription impossible.");
    } finally {
      setSubmitting(false);
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

          {/* FORM */}
          <View style={styles.form}>
            {/* Email */}
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

            {/* Username */}
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

            {/* Mot de passe */}
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

            {/* Confirmer mot de passe */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmer mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* BOUTON CRÉER UN COMPTE */}
            <TouchableOpacity
              style={styles.primaryButtonWrapper}
              onPress={handleRegister}
              disabled={submitting}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Créer un compte</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* BOTTOM : déjà un compte ? */}
          <View style={styles.bottom}>
            <Text style={styles.bottomText}>Vous avez un compte?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.bottomLink}>Connectez - vous</Text>
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
    alignItems: "center",
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
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: COLORS.textPrimary,
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
