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

        // Charger le nombre d'amis et le statut premium
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFriendsCount(data.friends?.length || 0);
          setIsPremium(data.isPremium || false);
          setPremiumType(data.premiumType || null);
          
          // Mettre à jour la photo si elle existe dans Firestore
          if (data.photoURL) {
            setPhotoURL(data.photoURL);
          }
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

  // Fonction pour supprimer le compte
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Aucun utilisateur connecté.");
        return;
      }

      console.log("▶ Début de la suppression du compte...");

      // 1. Supprimer l'utilisateur de la collection "users"
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);
      console.log("✅ Document utilisateur supprimé de Firestore");

      // 2. Supprimer l'utilisateur de toutes les listes d'amis
      const usersSnapshot = await getDocs(collection(db, "users"));
      const updatePromises: Promise<void>[] = [];
      
      usersSnapshot.forEach((otherUserDoc) => {
        const otherUserData = otherUserDoc.data();
        if (otherUserData.friends && otherUserData.friends.includes(user.uid)) {
          const updatedFriends = otherUserData.friends.filter(
            (friendId: string) => friendId !== user.uid
          );
          const otherUserRef = doc(db, "users", otherUserDoc.id);
          updatePromises.push(updateDoc(otherUserRef, { friends: updatedFriends }));
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`✅ Supprimé de ${updatePromises.length} listes d'amis`);
      }

      // 3. Supprimer les demandes d'amis associées
      const friendRequestsQuery = query(
        collection(db, "friend_requests"),
        where("fromUserId", "==", user.uid)
      );
      const friendRequestsSnapshot = await getDocs(friendRequestsQuery);
      const deleteRequestPromises: Promise<void>[] = [];
      
      friendRequestsSnapshot.forEach((requestDoc) => {
        deleteRequestPromises.push(deleteDoc(requestDoc.ref));
      });

      // Supprimer aussi les demandes reçues
      const receivedRequestsQuery = query(
        collection(db, "friend_requests"),
        where("toUserId", "==", user.uid)
      );
      const receivedRequestsSnapshot = await getDocs(receivedRequestsQuery);
      
      receivedRequestsSnapshot.forEach((requestDoc) => {
        deleteRequestPromises.push(deleteDoc(requestDoc.ref));
      });

      if (deleteRequestPromises.length > 0) {
        await Promise.all(deleteRequestPromises);
        console.log(`✅ ${deleteRequestPromises.length} demandes d'amis supprimées`);
      }

      // 4. Supprimer le compte d'authentification Firebase
      await deleteUser(user);
      console.log("✅ Compte d'authentification supprimé");

      // 5. Déconnexion et redirection
      await signOut(auth);
      
      Alert.alert(
        "Compte supprimé",
        "Votre compte a été supprimé avec succès. Nous sommes tristes de vous voir partir.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );

    } catch (error: any) {
      console.error("❌ Erreur lors de la suppression du compte:", error);
      
      // Si l'erreur est liée à la ré-authentification
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
          "Une erreur est survenue lors de la suppression du compte. Veuillez réessayer."
        );
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fonctions pour les pages légales
  const handlePrivacyPolicy = () => {
    (router as any).push("/legal/privacy");
  };

  const handleTermsOfService = () => {
    (router as any).push("/legal/terms");
  };

  const handleTermsOfSale = () => {
    (router as any).push("/legal/sales");
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
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
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

          {/* SECTION PAGES LÉGALES */}
          <View style={styles.legalSection}>
            <Text style={styles.legalSectionTitle}>Informations légales</Text>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handlePrivacyPolicy}
            >
              <View style={styles.legalItemLeft}>
                <View style={styles.legalIcon}>
                  <Icon name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.legalText}>Politique de confidentialité</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handleTermsOfService}
            >
              <View style={styles.legalItemLeft}>
                <View style={styles.legalIcon}>
                  <Icon name="document-text-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.legalText}>Conditions d'utilisation</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handleTermsOfSale}
            >
              <View style={styles.legalItemLeft}>
                <View style={styles.legalIcon}>
                  <Icon name="cart-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.legalText}>Conditions de vente</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* BUTTONS - MODIFIER LE PROFIL EN PREMIER */}
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

          {/* BOUTON DÉCONNEXION */}
          <TouchableOpacity
            style={[styles.buttonWrapper, { marginTop: 12 }]}
            onPress={handleLogout}
          >
            <View style={[styles.button, { backgroundColor: COLORS.error }]}>
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>

          {/* BOUTON PASSER EN PREMIUM (seulement si non premium) */}
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

          {/* BOUTON RÉSILIER ABONNEMENT (seulement si premium) */}
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

          {/* BOUTON SUPPRIMER LE COMPTE (très subtil) */}
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Icon name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
          </TouchableOpacity>
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

      {/* MODAL DE SUPPRESSION DU COMPTE */}
      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sadIcon}>
              <Icon name="warning-outline" size={64} color="#FF9500" />
            </View>

            <Text style={styles.deleteModalTitle}>Supprimer définitivement votre compte ? ⚠️</Text>
            
            <View style={styles.warningBox}>
              <Icon name="alert-circle" size={24} color="#FF9500" style={styles.warningIcon} />
              <Text style={styles.warningTitle}>Cette action est irréversible !</Text>
            </View>

            <Text style={styles.deleteModalSubtext}>
              La suppression de votre compte entraînera :
            </Text>
            <Text style={styles.deleteBullet}>• La perte définitive de toutes vos données</Text>
            <Text style={styles.deleteBullet}>• La suppression de votre profil et historique</Text>
            <Text style={styles.deleteBullet}>• La suppression de toutes vos relations d'amitié</Text>
            <Text style={styles.deleteBullet}>• L'annulation de votre abonnement Premium</Text>
            <Text style={styles.deleteBullet}>• L'impossibilité de récupérer votre compte</Text>

            <Text style={styles.deleteModalMessage}>
              Êtes-vous absolument sûr de vouloir continuer ?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonCancelText}>
                  {isDeleting ? "Annulation..." : "Annuler"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButtonConfirm, isDeleting && styles.deleteButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="trash" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.deleteModalButtonConfirmText}>
                      Supprimer définitivement
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteModalFooter}>
              Cette opération peut prendre quelques secondes.
            </Text>
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
    fontSize: 32,
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
  // Nouveaux styles pour la section légale
  legalSection: {
    width: "100%",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 12,
    marginBottom: 12,
  },
  legalSectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legalIcon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  legalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
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
  // Styles pour le bouton supprimer le compte
  deleteAccountButton: {
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  deleteAccountText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#FF3B30",
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
    marginTop: 16,
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
  // Styles pour la modal de suppression
  deleteModalTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FF9500",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  warningIcon: {
    marginRight: 10,
  },
  warningTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#FF9500",
    flex: 1,
  },
  deleteModalSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "left",
    marginBottom: 8,
    width: "100%",
  },
  deleteBullet: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 18,
    width: "100%",
  },
  deleteModalMessage: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  deleteModalButtonConfirm: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  deleteButtonDisabled: {
    backgroundColor: "#FF6B6B",
  },
  deleteModalButtonConfirmText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  deleteModalFooter: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});