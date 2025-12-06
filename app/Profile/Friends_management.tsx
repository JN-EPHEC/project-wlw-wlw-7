import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import ConfirmModal from "../../components/ConfirmModal";
import { auth, db } from "../../firebase_Config";

type Friend = {
  uid: string;
  displayName: string;
  username: string;
  email: string;
};

type ModalState = {
  visible: boolean;
  type: "remove" | "block" | null;
  friend: Friend | null;
};

export default function ManageFriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: null,
    friend: null,
  });

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Charger les amis et les utilisateurs bloqués
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const friendIds = userData.friends || [];
      setBlockedUsers(userData.blockedUsers || []);

      // Charger les détails de chaque ami
      const friendsData: Friend[] = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, "users", friendId));
        if (friendDoc.exists()) {
          const data = friendDoc.data();
          friendsData.push({
            uid: friendId,
            displayName: data.displayName || data.username,
            username: data.username,
            email: data.email,
          });
        }
      }

      setFriends(friendsData);
    } catch (e) {
      console.error("Error loading friends:", e);
      window.alert("Erreur: Impossible de charger la liste d'amis.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFriends();
  };

  const handleRemoveFriend = (friend: Friend) => {
    console.log("🔵 Opening remove modal for:", friend.displayName);
    setModalState({
      visible: true,
      type: "remove",
      friend: friend,
    });
  };

  const confirmRemoveFriend = async () => {
    const friend = modalState.friend;
    if (!friend) return;

    console.log("🔴 User confirmed removal");
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("❌ No user authenticated");
        return;
      }

      console.log("▶ Removing friend from current user...");
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(friend.uid),
      });
      console.log("✅ Friend removed from current user");

      console.log("▶ Removing current user from friend's list...");
      await updateDoc(doc(db, "users", friend.uid), {
        friends: arrayRemove(user.uid),
      });
      console.log("✅ Current user removed from friend's list");

      setFriends((prev) => prev.filter((f) => f.uid !== friend.uid));
      window.alert(`✅ ${friend.displayName} a été retiré de vos amis.`);
    } catch (e: any) {
      console.error("❌ Error removing friend:", e);
      console.error("❌ Error code:", e.code);
      console.error("❌ Error message:", e.message);
      window.alert("❌ Impossible de retirer cet ami: " + e.message);
    }
  };

  const handleBlockUser = (friend: Friend) => {
    console.log("🔵 Opening block modal for:", friend.displayName);
    setModalState({
      visible: true,
      type: "block",
      friend: friend,
    });
  };

  const confirmBlockUser = async () => {
    const friend = modalState.friend;
    if (!friend) return;

    console.log("🔴 User confirmed blocking");
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("❌ No user authenticated");
        return;
      }

      console.log("▶ Adding to blocked users and removing from friends...");
      await updateDoc(doc(db, "users", user.uid), {
        blockedUsers: arrayUnion(friend.uid),
        friends: arrayRemove(friend.uid),
      });
      console.log("✅ User blocked and removed from friends");

      console.log("▶ Removing current user from friend's list...");
      await updateDoc(doc(db, "users", friend.uid), {
        friends: arrayRemove(user.uid),
      });
      console.log("✅ Current user removed from friend's list");

      setFriends((prev) => prev.filter((f) => f.uid !== friend.uid));
      setBlockedUsers((prev) => [...prev, friend.uid]);
      window.alert(`✅ ${friend.displayName} a été bloqué.`);
    } catch (e: any) {
      console.error("❌ Error blocking user:", e);
      console.error("❌ Error code:", e.code);
      console.error("❌ Error message:", e.message);
      window.alert("❌ Impossible de bloquer cet utilisateur: " + e.message);
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <LinearGradient
          colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </View>

      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item)}
        >
          <Icon name="person-remove" size={20} color={COLORS.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBlockUser(item)}
        >
          <Icon name="ban" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>Aucun ami pour le moment</Text>
      <Text style={styles.emptySubtext}>
        Ajoutez des amis pour partager vos activités !
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router as any).push("/Profile")}
        >
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gérer mes amis</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{friends.length}</Text>
          <Text style={styles.statLabel}>Amis</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{blockedUsers.length}</Text>
          <Text style={styles.statLabel}>Bloqués</Text>
        </View>
      </View>

      {/* LISTE DES AMIS */}
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* BOUTON VOIR LES BLOQUÉS */}
      {blockedUsers.length > 0 && (
        <TouchableOpacity
          style={styles.blockedButtonWrapper}
          onPress={() => (router as any).push("/Profile/Blocked_users")}
        >
          <View style={styles.blockedButton}>
            <Icon name="ban" size={20} color={COLORS.error} />
            <Text style={styles.blockedButtonText}>
              Voir les utilisateurs bloqués ({blockedUsers.length})
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* MODAL DE CONFIRMATION */}
      <ConfirmModal
        visible={modalState.visible}
        title={
          modalState.type === "remove"
            ? "Retirer cet ami"
            : "Bloquer cet utilisateur"
        }
        message={
          modalState.type === "remove"
            ? `Voulez-vous retirer ${modalState.friend?.displayName} de vos amis ?`
            : `Voulez-vous bloquer ${modalState.friend?.displayName} ?\n\nCette personne sera retirée de vos amis et ne pourra plus vous envoyer de demandes.`
        }
        confirmText={modalState.type === "remove" ? "Retirer" : "Bloquer"}
        cancelText="Annuler"
        isDangerous={true}
        onConfirm={
          modalState.type === "remove"
            ? confirmRemoveFriend
            : confirmBlockUser
        }
        onCancel={() =>
          setModalState({ visible: false, type: null, friend: null })
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  friendActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  blockedButtonWrapper: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    borderRadius: 999,
    overflow: "hidden",
  },
  blockedButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.error,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  blockedButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.error,
  },
});