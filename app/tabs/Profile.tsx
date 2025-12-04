import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../components/Colors";
import { auth } from "../../firebase_Config";

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Récupérer les infos du user connecté
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "Utilisateur");
      setEmail(user.email || "");
    }
  }, []);

  const handleLogout = async () => {
    try {
      console.log("▶ Logging out...");
      await signOut(auth);
      console.log("✅ User logged out");
      router.replace("/login");
    } catch (e: any) {
      console.error("❌ Error logging out:", e);
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          {/* AVATAR */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          {/* USERNAME */}
          <Text style={styles.username}>{username}</Text>

          {/* EMAIL */}
          <Text style={styles.email}>{email}</Text>

          {/* BADGE FREE */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Free</Text>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity style={styles.buttonWrapper}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Modifier mon profil</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonWrapper, { marginTop: 12 }]}
            onPress={handleLogout}
          >
            <View style={[styles.button, { backgroundColor: COLORS.error }]}>
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.buttonWrapper, { marginTop: 12 }]}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Passer en premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  profileCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  button: {
    height: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});