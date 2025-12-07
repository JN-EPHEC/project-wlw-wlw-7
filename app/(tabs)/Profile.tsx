import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
  const [isPremium, setIsPremium] = useState(false);
  const [premiumType, setPremiumType] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setUsername(user.displayName || "Utilisateur");
        setEmail(user.email || "");

        // Charger le nombre d'amis et le statut premium
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFriendsCount(data.friends?.length || 0);
          setIsPremium(data.isPremium || false);
          setPremiumType(data.premiumType || null);
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

  const handleCancelSubscription = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Résilier l'abonnement dans Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isPremium: false,
        premiumType: null,
        premiumCancelledAt: new Date().toISOString(),
      });

      console.log("✅ Subscription cancelled");
      
      setShowCancelModal(false);
      setIsPremium(false);
      setPremiumType(null);
      
      // Recharger les données
      loadUserData();
    } catch (e) {
      console.error("❌ Error cancelling subscription:", e);
      Alert.alert("Erreur", "Impossible de résilier l'abonnement.");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER avec boutons */}
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>Profil</Text>
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

          {/* BADGE FREE/PREMIUM */}
          {isPremium ? (
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Icon name="diamond" size={14} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
              <Text style={styles.badgeTextPremium}>
                Premium {premiumType === "monthly" ? "Mensuel" : "Annuel"}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Free</Text>
            </View>
          )}

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

          {!isPremium && (
            <TouchableOpacity 
              style={[styles.buttonWrapper, { marginTop: 12 }]}
              onPress={() => (router as any).push("/Profile/Abo_choix")}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Passer en premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* BOUTON RÉSILIER ABONNEMENT */}
          {isPremium && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.cancelButtonText}>
                Voulez-vous résilier votre abonnement ?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE RÉSILIATION */}
      <Modal
        transparent
        visible={showCancelModal}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sadIcon}>
              <Icon name="sad-outline" size={64} color="#FF3B30" />
            </View>

            <Text style={styles.modalTitle}>Vous partez déjà ? 😢</Text>
            <Text style={styles.modalMessage}>
              Nous sommes tristes de vous voir partir...
            </Text>
            <Text style={styles.modalSubtext}>
              Votre abonnement Premium sera annulé immédiatement. Vous perdrez l'accès à tous les avantages Premium.
            </Text>
            <Text style={styles.modalHope}>
              On a hâte de vous revoir ! 💙
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Rester Premium</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.modalButtonConfirmText}>Résilier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textSecondary,
  },
  badgeTextPremium: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
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
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#FF3B30",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sadIcon: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  modalSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  modalHope: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#6366F1",
    textAlign: "center",
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: COLORS.backgroundTop,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonConfirmText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});