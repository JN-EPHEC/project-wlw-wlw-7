import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { deleteUser, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumType, setPremiumType] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Recharger les données à chaque fois qu'on revient sur la page
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setUsername(user.displayName || "Utilisateur");
        setEmail(user.email || "");
        setPhotoURL(user.photoURL || null);

        // Charger les données depuis Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFriendsCount(data.friends?.length || 0);
          setIsPremium(data.isPremium || false);
          setPremiumType(data.premiumType || null);
          
          if (data.photoURL) {
            setPhotoURL(data.photoURL);
          }
        }

        // ✅ CORRIGÉ : friendRequests au lieu de friend_requests
        const requestsQuery = query(
          collection(db, "friendRequests"),
          where("toUserId", "==", user.uid),
          where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        setPendingRequestsCount(requestsSnapshot.size);
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (e: any) {
      console.error("❌ Error logging out:", e);
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  const handleEditProfile = () => {
    router.push("/Profile/Modif_prof");
  };

  const handleManageFriends = () => {
    router.push("/Profile/Friends_management");
  };

  const handleFriendRequests = () => {
    router.push("/Profile/Friends_request");
  };

  const handleAddFriend = () => {
    router.push("/Profile/Add_amis");
  };



  const handleCancelSubscription = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isPremium: false,
        premiumType: null,
        premiumCancelledAt: new Date().toISOString(),
      });

      setShowCancelModal(false);
      setIsPremium(false);
      setPremiumType(null);
      loadUserData();
      
      Alert.alert("Succès", "Votre abonnement a été résilié.");
    } catch (e) {
      console.error("❌ Error cancelling subscription:", e);
      Alert.alert("Erreur", "Impossible de résilier l'abonnement.");
    }
  };

  // ✅ FONCTION CORRIGÉE pour supprimer le compte - GÈRE LES DOCUMENTS MANQUANTS
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Aucun utilisateur connecté.");
        return;
      }

      // 1. Récupérer les données de l'utilisateur pour avoir sa liste d'amis
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      let friendsList: string[] = [];
      
      // ✅ Si le document n'existe pas, on continue quand même
      if (userDoc.exists()) {
        const userData = userDoc.data();
        friendsList = userData.friends || [];
      } else {
        console.log("⚠️ Document utilisateur introuvable, on continue la suppression");
      }

      // 2. Retirer l'utilisateur des listes d'amis de ses amis uniquement
      const updatePromises: Promise<void>[] = [];
      
      for (const friendId of friendsList) {
        try {
          const friendRef = doc(db, "users", friendId);
          const friendDoc = await getDoc(friendRef);
          
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            const updatedFriends = (friendData.friends || []).filter(
              (id: string) => id !== user.uid
            );
            updatePromises.push(updateDoc(friendRef, { friends: updatedFriends }));
          }
        } catch (error) {
          console.error(`Erreur pour l'ami ${friendId}:`, error);
          // Continue même si un ami pose problème
        }
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      // 3. Supprimer les demandes d'amis envoyées
      try {
        const sentRequestsQuery = query(
          collection(db, "friendRequests"),
          where("fromUserId", "==", user.uid)
        );
        const sentRequestsSnapshot = await getDocs(sentRequestsQuery);
        const deleteSentPromises: Promise<void>[] = [];
        
        sentRequestsSnapshot.forEach((requestDoc) => {
          deleteSentPromises.push(deleteDoc(requestDoc.ref));
        });

        // 4. Supprimer les demandes d'amis reçues
        const receivedRequestsQuery = query(
          collection(db, "friendRequests"),
          where("toUserId", "==", user.uid)
        );
        const receivedRequestsSnapshot = await getDocs(receivedRequestsQuery);
        
        receivedRequestsSnapshot.forEach((requestDoc) => {
          deleteSentPromises.push(deleteDoc(requestDoc.ref));
        });

        if (deleteSentPromises.length > 0) {
          await Promise.all(deleteSentPromises);
        }
      } catch (error) {
        console.log("Pas de demandes d'amis à supprimer");
      }

      // 5. Supprimer les notifications de l'utilisateur
      try {
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("toUserId", "==", user.uid)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const deleteNotifPromises: Promise<void>[] = [];
        
        notificationsSnapshot.forEach((notifDoc) => {
          deleteNotifPromises.push(deleteDoc(notifDoc.ref));
        });

        if (deleteNotifPromises.length > 0) {
          await Promise.all(deleteNotifPromises);
        }
      } catch (error) {
        console.log("Pas de notifications à supprimer");
      }

      // 6. Supprimer les favoris de l'utilisateur
      try {
        await deleteDoc(doc(db, "userFavorites", user.uid));
      } catch (error) {
        console.log("Pas de favoris à supprimer");
      }

      try {
        await deleteDoc(doc(db, "userFavoriteGames", user.uid));
      } catch (error) {
        console.log("Pas de jeux favoris à supprimer");
      }

      try {
        await deleteDoc(doc(db, "userFavoriteGroups", user.uid));
      } catch (error) {
        console.log("Pas de groupes favoris à supprimer");
      }

      try {
        await deleteDoc(doc(db, "userPinnedGroups", user.uid));
      } catch (error) {
        console.log("Pas de groupes épinglés à supprimer");
      }

      // 7. Supprimer le document utilisateur (même s'il n'existe pas)
      try {
        await deleteDoc(userRef);
      } catch (error) {
        console.log("Document utilisateur déjà supprimé ou inexistant");
      }

      // 8. Supprimer le compte d'authentification
      await deleteUser(user);

      // 9. Déconnexion et redirection
      await signOut(auth);
      
      Alert.alert(
        "Compte supprimé",
        "Votre compte a été supprimé avec succès.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );

    } catch (error: any) {
      console.error("❌ Erreur lors de la suppression du compte:", error);
      
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          "Ré-authentification requise",
          "Pour des raisons de sécurité, veuillez vous reconnecter avant de supprimer votre compte.",
          [
            { text: "Annuler", style: "cancel" },
            { 
              text: "Se reconnecter", 
              onPress: async () => {
                await signOut(auth);
                router.replace("/login");
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Erreur",
          `Une erreur est survenue: ${error.message || "Veuillez réessayer."}`
        );
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fonctions pour les pages légales
  const handlePrivacyPolicy = () => {
    router.push("/legal/Politiquedeconf");
  };

  const handleTermsOfService = () => {
    router.push("/legal/ConditionUtilisation");
  };

  const handleTermsOfSale = () => {
    router.push("/legal/CGV");
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleFriendRequests}
            >
              <Icon name="mail" size={20} color={COLORS.textPrimary} />
              {pendingRequestsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleAddFriend}
            >
              <Icon name="person-add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          {/* AVATAR SECTION - CENTRÉE */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarText}>
                    {username.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="diamond" size={12} color="#FFD700" />
                </View>
              )}
            </View>
            
            {/* USER INFOS - EN DESSOUS DE L'AVATAR */}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.email}>{email}</Text>
              
              {/* STATUS BADGE */}
              <View style={[
                styles.statusBadge,
                isPremium ? styles.premiumStatus : styles.freeStatus
              ]}>
                <Text style={styles.statusText}>
                  {isPremium ? (
                    <>
                      <Icon name="diamond" size={12} color="#FFD700" />{' '}
                      Premium {premiumType === "monthly" ? "Mensuel" : "Annuel"}
                    </>
                  ) : 'Free'}
                </Text>
              </View>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleManageFriends}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                style={styles.quickActionIcon}
              >
                <Icon name="people" size={20} color={COLORS.textPrimary} />
              </LinearGradient>
              <Text style={styles.quickActionText}>Mes amis</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push("/Profile/Modif_prof")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Icon name="settings" size={20} color="#6366F1" />
              </View>
              <Text style={styles.quickActionText}>Paramètres</Text>
            </TouchableOpacity>
            
           
          </View>

          {/* MAIN ACTIONS */}
          <View style={styles.mainActions}>
            <TouchableOpacity 
              style={styles.mainAction}
              onPress={handleEditProfile}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                style={styles.mainActionGradient}
              >
                <Icon name="create" size={20} color={COLORS.textPrimary} />
                <Text style={styles.mainActionText}>Modifier le profil</Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isPremium ? (
              <TouchableOpacity 
                style={[styles.mainAction, styles.premiumAction]}
                onPress={() => router.push("/Profile/Abo_choix")}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.mainActionGradient}
                >
                  <Icon name="diamond" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.mainActionText}>Passer en Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.mainAction, styles.cancelAction]}
                onPress={() => setShowCancelModal(true)}
              >
                <View style={styles.mainActionGradient}>
                  <Icon name="close-circle" size={20} color="#FF3B30" />
                  <Text style={[styles.mainActionText, { color: '#FF3B30' }]}>
                    Résilier Premium
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* LEGAL SECTION */}
          <View style={styles.legalSection}>
            <Text style={styles.legalTitle}>Informations légales</Text>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handlePrivacyPolicy}
            >
              <View style={styles.legalItemLeft}>
                <Icon name="shield-checkmark-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.legalText}>Confidentialité</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handleTermsOfService}
            >
              <View style={styles.legalItemLeft}>
                <Icon name="document-text-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.legalText}>Conditions d'utilisation</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handleTermsOfSale}
            >
              <View style={styles.legalItemLeft}>
                <Icon name="cart-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.legalText}>Conditions de vente</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ACCOUNT ACTIONS */}
          <View style={styles.accountActions}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteAccountButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Icon name="trash-outline" size={16} color="#FF3B30" />
              <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
            </TouchableOpacity>
          </View>
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
            <View style={styles.modalIcon}>
              <Icon name="sad-outline" size={64} color="#FF3B30" />
            </View>

            <Text style={styles.modalTitle}>Nous sommes tristes 😢</Text>
            <Text style={styles.modalMessage}>
              Vraiment ? Vous voulez résilier votre abonnement Premium ?
            </Text>
            
            <Text style={styles.modalWarning}>
              Vous perdrez immédiatement l'accès à tous les avantages Premium.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Rester Premium</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.modalButtonPrimaryText}>Résilier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE SUPPRESSION DU COMPTE */}
      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Icon name="warning-outline" size={64} color="#FF9500" />
            </View>

            <Text style={[styles.modalTitle, { color: '#FF3B30' }]}>
              Supprimer votre compte ? ⚠️
            </Text>
            
            <View style={styles.warningBox}>
              <Icon name="alert-circle" size={20} color="#FF9500" />
              <Text style={styles.warningText}>Cette action est irréversible !</Text>
            </View>

            <Text style={styles.modalMessage}>
              Toutes vos données seront définitivement supprimées :
            </Text>
            
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• Votre profil et historique</Text>
              <Text style={styles.warningItem}>• Toutes vos relations d'amitié</Text>
              <Text style={styles.warningItem}>• Votre abonnement Premium</Text>
              <Text style={styles.warningItem}>• Toutes vos activités</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonSecondaryText}>
                  {isDeleting ? "..." : "Annuler"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButtonDanger, isDeleting && styles.buttonDisabled]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="trash" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalButtonDangerText}>Supprimer</Text>
                  </>
                )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  profileCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  premiumBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  userInfo: {
    alignItems: "center",
    width: "100%",
  },
  username: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  email: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  freeStatus: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  premiumStatus: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickAction: {
    alignItems: "center",
    width: "30%",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  mainActions: {
    gap: 12,
    marginBottom: 24,
  },
  mainAction: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mainActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  mainActionText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  premiumAction: {
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  cancelAction: {
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  legalSection: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legalTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  accountActions: {
    alignItems: "center",
    gap: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  logoutText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FF3B30",
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  deleteAccountText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#FF3B30",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalWarning: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 24,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FF9500",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  warningText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FF9500",
    flex: 1,
  },
  warningList: {
    width: "100%",
    marginBottom: 24,
  },
  warningItem: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 4,
    paddingLeft: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: COLORS.backgroundTop,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonSecondaryText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  modalButtonDanger: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  modalButtonDangerText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    backgroundColor: "#FF6B6B",
    opacity: 0.7,
  },
});