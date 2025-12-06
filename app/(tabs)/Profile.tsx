import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [friendsCount, setFriendsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setUsername(user.displayName || "Utilisateur");
        setEmail(user.email || "");

        // Charger le nombre d'amis
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFriendsCount(data.friends?.length || 0);
        }
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    } finally {
      setLoadingStats(false);
    }
  };

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

  const handleEditProfile = () => {
    (router as any).push("/Profile/Modif_prof");
  };

  const handleManageFriends = () => {
    (router as any).push("/Profile/Friends_management");
  };

  const handleFriendRequests = () => {
    (router as any).push("/Profile/Friends_request");
  };

  const handleSearchFriends = () => {
    (router as any).push("/Profile/Search_friends");
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER avec boutons */}
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFriendRequests}
            >
              <Icon name="person-add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSearchFriends}
            >
              <Icon name="search" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
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

          {/* SECTION MES AMIS */}
          <View style={styles.friendsSection}>
            <View style={styles.friendsContent}>
              <View style={styles.friendsLeft}>
                <LinearGradient
                  colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                  style={styles.friendsIconGradient}
                >
                  <Icon name="people" size={22} color={COLORS.textPrimary} />
                </LinearGradient>
                <View style={styles.friendsInfo}>
                  <Text style={styles.friendsSectionTitle}>Mes amis</Text>
                  {loadingStats ? (
                    <ActivityIndicator size="small" color={COLORS.textSecondary} />
                  ) : (
                    <Text style={styles.friendsCount}>{friendsCount} ami{friendsCount > 1 ? 's' : ''}</Text>
                  )}
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.manageFriendsButton}
                onPress={handleManageFriends}
              >
                <Text style={styles.manageFriendsText}>Gérer</Text>
                <Icon name="chevron-forward" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity 
            style={styles.buttonWrapper}
            onPress={handleEditProfile}
          >
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
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
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textSecondary,
  },
  friendsSection: {
    width: "100%",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 24,
  },
  friendsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  friendsIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  friendsInfo: {
    flex: 1,
  },
  friendsSectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  friendsCount: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  manageFriendsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.backgroundTop,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manageFriendsText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
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
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});