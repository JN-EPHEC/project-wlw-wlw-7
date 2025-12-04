import { useAuth } from "@/Auth_context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../components/Colors";

export default function LoginScreen() {
  const { signInWithEmail, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("./tabs/Home");
    }
  }, [loading, user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Email et mot de passe obligatoires.");
      return;
    }

    try {
      await signInWithEmail(email, password);
      router.replace("./tabs/Home");
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Connexion impossible.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: COLORS.textPrimary }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <Text style={styles.title}>Connexion</Text>

      {/* EMAIL */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.textSecondary}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      {/* PASSWORD */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Mot de passe"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? "eye" : "eye-off"}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* LOGIN BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      {/* LINK REGISTER */}
      <Text style={styles.altText}>Pas de compte ?</Text>

      <Text style={styles.signupLink} onPress={() => router.push("/register")}>
        Inscris-toi
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.neutralGray800,
    marginBottom: 12,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.neutralGray800,
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    fontFamily: "Poppins-Medium",
    textAlign: "center",
    color: COLORS.textPrimary,
    fontSize: 16,
  },

  altText: {
    marginTop: 26,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
  },

  signupLink: {
    textAlign: "center",
    marginTop: 4,
    color: COLORS.secondary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});