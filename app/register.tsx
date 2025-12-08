import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../Auth_context";
import { COLORS } from "../components/Colors";
import { auth, db } from "../firebase_Config";

export default function RegisterScreen() {
  const router = useRouter();
  const { setIsRegistering } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log("▶ handleRegister called");
    setError("");
    setLoading(true);
    setIsRegistering(true); // Empêcher les redirections automatiques

    // Validation des champs
    if (!email || !username || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    // Variable pour stocker l'ID du user créé (pour rollback si besoin)
    let createdUserId: string | null = null;

    try {
      // 1. Créer un compte temporaire pour pouvoir lire Firestore
      console.log("▶ Creating temporary auth account...");
      const tempCred = await createUserWithEmailAndPassword(auth, email, password);
      createdUserId = tempCred.user.uid;
      console.log("✅ Temporary account created:", createdUserId);

      // 2. MAINTENANT qu'on est authentifié, vérifier si le username existe
      console.log("▶ Checking if username exists...");
      const usersRef = collection(db, "users");
      const usernameQuery = query(usersRef, where("username", "==", username.trim().toLowerCase()));
      const querySnapshot = await getDocs(usernameQuery);
      
      if (!querySnapshot.empty) {
        // Username déjà pris ! Supprimer le compte et arrêter
        console.log("❌ Username already exists, deleting account...");
        
        // Supprimer le compte et se déconnecter immédiatement
        const userToDelete = tempCred.user;
        await auth.signOut(); // Déconnexion AVANT suppression
        await userToDelete.delete();
        
        setError("❌ Ce nom d'utilisateur est déjà utilisé.");
        setLoading(false);
        setIsRegistering(false); // Réactiver les redirections
        return;
      }
      console.log("✅ Username available");

      // 3. Username dispo, continuer l'inscription normale
      console.log("▶ Updating profile...");
      await updateProfile(tempCred.user, { displayName: username });
      console.log("✅ Profile updated");

      // 4. Créer le document Firestore
      console.log("▶ Creating user document in Firestore...");
      const userRef = doc(db, "users", tempCred.user.uid);
      
      const userData = {
        uid: tempCred.user.uid,
        email: email.toLowerCase(),
        username: username.trim().toLowerCase(),
        displayName: username.trim(),
        createdAt: new Date().toISOString(),
        surveyCompleted: false,
        accountType: null,
        interests: [],
        city: null,
        friends: [],
        blockedUsers: [], // AJOUT pour la gestion des utilisateurs bloqués
        expoPushToken: null,
      };
      
      await setDoc(userRef, userData);
      console.log("✅ User document created successfully!");

      // 5. Redirection
      console.log("▶ Redirecting to /sondage");
      setLoading(false);
      setIsRegistering(false); // Réactiver les redirections
      router.replace("/sondage");

    } catch (e: any) {
      console.error("❌ Error in handleRegister:", e);
      
      // Si on a créé un compte, le supprimer en cas d'erreur
      if (createdUserId) {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await currentUser.delete();
            await auth.signOut();
          }
        } catch (deleteError) {
          console.error("Error deleting user during rollback:", deleteError);
        }
      }
      
      let errorMessage = "Inscription impossible.";
      
      // Messages d'erreur Firebase personnalisés
      switch (e.code) {
        case "auth/email-already-in-use":
          errorMessage = "❌ Cet email est déjà utilisé.";
          break;
        case "auth/invalid-email":
          errorMessage = "❌ Email invalide.";
          break;
        case "auth/weak-password":
          errorMessage = "❌ Mot de passe trop faible.";
          break;
        case "auth/network-request-failed":
          errorMessage = "❌ Erreur réseau. Vérifiez votre connexion.";
          break;
        case "auth/too-many-requests":
          errorMessage = "❌ Trop de tentatives. Réessayez plus tard.";
          break;
        default:
          if (e.message) {
            errorMessage = `❌ ${e.message}`;
          }
      }
      
      setError(errorMessage);
      setLoading(false);
      setIsRegistering(false); // Réactiver les redirections
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
          {/* LOGO SIMPLE : Deux couleurs */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoWhat}>What</Text>
              <Text style={styles.logo2Do}>2do</Text>
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
                editable={!loading}
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
                editable={!loading}
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
                editable={!loading}
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
                editable={!loading}
              />
            </View>

            {/* BOUTON CRÉER UN COMPTE */}
            <TouchableOpacity 
              style={styles.primaryButtonWrapper} 
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>Créer un compte</Text>
                )}
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
    fontFamily: "Poppins-Bold",
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
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
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
    fontSize: 14,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-SemiBold",
  },
  bottom: {
    marginTop: 28,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottomLink: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.secondary,
  },
});