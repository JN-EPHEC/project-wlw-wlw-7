import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text, // AJOUT IMPORT
  TextInput,
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
  photoURL?: string;
};

type ModalState = {
  visible: boolean;
  type: "remove" | "block" | "unfriend" | null;
  friend: Friend | null;
};

export default function ManageFriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
            displayName: data.displayName || data.username || "Utilisateur",
            username: data.username || data.email?.split('@')[0] || "user",
            email: data.email || "",
            photoURL: data.photoURL,
          });
        }
      }

      // Trier par ordre alphabétique
      friendsData.sort((a, b) => a.displayName.localeCompare(b.displayName));
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredFriends = friends.filter(friend => 
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (friend: Friend) => {
    (router as any).push({
      pathname: "/Profile/Friend_profile",
      params: { friendId: friend.uid }
    });
  };

  const handleRemoveFriend = (friend: Friend) => {
    setModalState({
      visible: true,
      type: "remove",
      friend: friend,
    });
  };

  const confirmRemoveFriend = async () => {
    const friend = modalState.friend;
    if (!friend) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(friend.uid),
      });

      await updateDoc(doc(db, "users", friend.uid), {
        friends: arrayRemove(user.uid),
      });

      setFriends((prev) => prev.filter((f) => f.uid !== friend.uid));
      window.alert(`✅ ${friend.displayName} a été retiré de vos amis.`);
    } catch (e: any) {
      console.error("❌ Error removing friend:", e);
      window.alert("❌ Impossible de retirer cet ami.");
    } finally {
      setModalState({ visible: false, type: null, friend: null });
    }
  };

  const handleBlockUser = (friend: Friend) => {
    setModalState({
      visible: true,
      type: "block",
      friend: friend,
    });
  };

  const confirmBlockUser = async () => {
    const friend = modalState.friend;
    if (!friend) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        blockedUsers: arrayUnion(friend.uid),
        friends: arrayRemove(friend.uid),
      });

      await updateDoc(doc(db, "users", friend.uid), {
        friends: arrayRemove(user.uid),
      });

      setFriends((prev) => prev.filter((f) => f.uid !== friend.uid));
      setBlockedUsers((prev) => [...prev, friend.uid]);
      window.alert(`✅ ${friend.displayName} a été bloqué.`);
    } catch (e: any) {
      console.error("❌ Error blocking user:", e);
      window.alert("❌ Impossible de bloquer cet utilisateur.");
    } finally {
      setModalState({ visible: false, type: null, friend: null });
    }
  };

  const handleSendMessage = (friend: Friend) => {
    (router as any).push({
      pathname: "/Chat/Chat_screen",
      params: { 
        friendId: friend.uid,
        friendName: friend.displayName 
      }
    });
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <TouchableOpacity 
      style={styles.friendCard}
      onPress={() => handleViewProfile(item)}
      activeOpacity={0.7}
    >
      <View style={styles.friendInfo}>
        {item.photoURL ? (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
          </View>
        ) : (
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {item.displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </View>

      <View style={styles.friendActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => handleSendMessage(item)}
        >
          <Icon name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.moreButton]}
          onPress={(e) => {
            e.stopPropagation();
            // Menu contextuel ou navigation vers détails
          }}
        >
          <Icon name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
        style={styles.emptyIconContainer}
      >
        <Icon name="people-outline" size={48} color={COLORS.textPrimary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Aucun ami pour le moment</Text>
      <Text style={styles.emptySubtext}>
        Ajoutez des amis pour partager vos activités et jouer ensemble !
      </Text>
      
      <TouchableOpacity
        style={styles.addFriendsButton}
        onPress={() => (router as any).push("/Profile/Search_friends")}
      >
        <Icon name="person-add" size={20} color={COLORS.textPrimary} />
        <Text style={styles.addFriendsButtonText}>Rechercher des amis</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            style={styles.statIconContainer}
          >
            <Icon name="people" size={24} color={COLORS.textPrimary} />
          </LinearGradient>
          <View>
            <Text style={styles.statNumber}>{friends.length}</Text>
            <Text style={styles.statLabel}>Amis</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
            <Icon name="ban" size={24} color="#FF3B30" />
          </View>
          <View>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{blockedUsers.length}</Text>
            <Text style={styles.statLabel}>Bloqués</Text>
          </View>
        </View>
      </View>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un ami..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* TITRE SECTION */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes amis</Text>
        <Text style={styles.sectionCount}>({filteredFriends.length})</Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de vos amis...</Text>
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
        <Text style={styles.headerTitle}>Mes amis</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => (router as any).push("/Profile/Search_friends")}
        >
          <Icon name="person-add" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* LISTE DES AMIS */}
      <FlatList
        data={filteredFriends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />

      {/* MENU ACTION RAPIDE */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => (router as any).push("/Profile/Friends_request")}
        >
          <View style={styles.quickActionBadge}>
            <Icon name="person-add" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>Demandes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => (router as any).push("/Profile/Blocked_users")}
          disabled={blockedUsers.length === 0}
        >
          <View style={[styles.quickActionBadge, blockedUsers.length === 0 && styles.quickActionDisabled]}>
            <Icon name="ban" size={20} color={blockedUsers.length === 0 ? COLORS.textSecondary : "#FF3B30"} />
            {blockedUsers.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{blockedUsers.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.quickActionText, blockedUsers.length === 0 && styles.quickActionDisabledText]}>
            Bloqués
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => (router as any).push("/Profile/Search_friends")}
        >
          <View style={styles.quickActionBadge}>
            <Icon name="search" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>Rechercher</Text>
        </TouchableOpacity>
      </View>

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
            ? `Êtes-vous sûr de vouloir retirer ${modalState.friend?.displayName} de vos amis ?\n\nCette action est réversible.`
            : `Voulez-vous bloquer ${modalState.friend?.displayName} ?\n\nCette personne sera :\n• Retirée de vos amis\n• Ne pourra plus vous contacter\n• Ne pourra plus voir vos activités\n\nCette action est réversible depuis la liste des utilisateurs bloqués.`
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
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
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: 120,
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
    marginHorizontal: 24,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
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
  messageButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366F1',
  },
  moreButton: {
    backgroundColor: COLORS.neutralGray800,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  addFriendsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addFriendsButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  quickActions: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    justifyContent: "space-around",
  },
  quickActionButton: {
    alignItems: "center",
    gap: 4,
  },
  quickActionBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  quickActionDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
  },
  quickActionDisabledText: {
    color: COLORS.textSecondary,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
});