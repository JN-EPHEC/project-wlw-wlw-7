import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
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
  photoURL?: string;
};

type ModalState = {
  visible: boolean;
  type: "remove" | "block" | null;
  friend: Friend | null;
};

export default function ManageFriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
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

  const loadFriends = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const friendIds = userData.friends || [];

      const friendsPromises = friendIds.map((friendId: string) =>
        getDoc(doc(db, "users", friendId))
      );
      const friendsDocs = await Promise.all(friendsPromises);

      const friendsData: Friend[] = friendsDocs
        .filter(friendDoc => friendDoc.exists())
        .map(friendDoc => {
          const data = friendDoc.data();
          return {
            uid: friendDoc.id,
            displayName: data.displayName || data.username || "Utilisateur",
            username: data.username || data.email?.split('@')[0] || "user",
            photoURL: data.photoURL,
          };
        });

      friendsData.sort((a, b) => a.displayName.localeCompare(b.displayName));
      setFriends(friendsData);
    } catch (e) {
      console.error("Error loading friends:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFriends();
  }, [loadFriends]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    
    const query = searchQuery.toLowerCase();
    return friends.filter(friend => 
      friend.displayName.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const handleViewProfile = useCallback((friend: Friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/Profile/Friend_profile",
      params: { friendId: friend.uid }
    } as any);
  }, [router]);

  const handleRemoveFriend = useCallback((friend: Friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalState({
      visible: true,
      type: "remove",
      friend: friend,
    });
  }, []);

  const confirmRemoveFriend = useCallback(async () => {
    const friend = modalState.friend;
    if (!friend) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await Promise.all([
        updateDoc(doc(db, "users", user.uid), {
          friends: arrayRemove(friend.uid),
        }),
        updateDoc(doc(db, "users", friend.uid), {
          friends: arrayRemove(user.uid),
        })
      ]);

      setFriends(prev => prev.filter(f => f.uid !== friend.uid));
      Alert.alert("✅", `${friend.displayName} a été retiré de vos amis.`);
    } catch (e) {
      console.error("Error removing friend:", e);
      Alert.alert("❌", "Impossible de retirer cet ami.");
    } finally {
      setModalState({ visible: false, type: null, friend: null });
    }
  }, [modalState.friend]);

  const handleBlockUser = useCallback((friend: Friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setModalState({
      visible: true,
      type: "block",
      friend: friend,
    });
  }, []);

  const confirmBlockUser = useCallback(async () => {
    const friend = modalState.friend;
    if (!friend) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await Promise.all([
        updateDoc(doc(db, "users", user.uid), {
          blockedUsers: arrayUnion(friend.uid),
          friends: arrayRemove(friend.uid),
        }),
        updateDoc(doc(db, "users", friend.uid), {
          friends: arrayRemove(user.uid),
        })
      ]);

      setFriends(prev => prev.filter(f => f.uid !== friend.uid));
      Alert.alert("✅", `${friend.displayName} a été bloqué.`);
    } catch (e) {
      console.error("Error blocking user:", e);
      Alert.alert("❌", "Impossible de bloquer cet utilisateur.");
    } finally {
      setModalState({ visible: false, type: null, friend: null });
    }
  }, [modalState.friend]);

  const renderFriend = useCallback(({ item }: { item: Friend }) => (
    <TouchableOpacity 
      style={styles.friendCard}
      onPress={() => handleViewProfile(item)}
      activeOpacity={0.7}
    >
      {/* AVATAR + INFO */}
      <View style={styles.friendInfo}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
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
          <Text style={styles.friendName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.friendUsername} numberOfLines={1}>
            @{item.username}
          </Text>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFriend(item);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="person-remove-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleBlockUser(item);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="ban-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleViewProfile, handleRemoveFriend, handleBlockUser]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
        style={styles.emptyIconContainer}
      >
        <Icon name="people-outline" size={48} color={COLORS.textPrimary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "Aucun résultat" : "Aucun ami"}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery 
          ? "Essayez une autre recherche" 
          : "Ajoutez des amis depuis l'onglet Profil"}
      </Text>
    </View>
  ), [searchQuery]);

  const keyExtractor = useCallback((item: Friend) => item.uid, []);

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Gérer mes amis</Text>
        
        <View style={{ width: 40 }} />
      </View>

      {/* COMPTEUR + RECHERCHE */}
      <View style={styles.topSection}>
        <View style={styles.countCard}>
          <Text style={styles.countNumber}>{friends.length}</Text>
          <Text style={styles.countLabel}>amis</Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LISTE */}
      <FlatList
        data={filteredFriends}
        renderItem={renderFriend}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredFriends.length === 0 && styles.emptyListContent
        ]}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
      />

      {/* MODAL */}
      <ConfirmModal
        visible={modalState.visible}
        title={
          modalState.type === "remove"
            ? "Retirer cet ami ?"
            : "Bloquer cet utilisateur ?"
        }
        message={
          modalState.type === "remove"
            ? `${modalState.friend?.displayName} sera retiré de vos amis.`
            : `${modalState.friend?.displayName} sera bloqué et retiré de vos amis.`
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
    </View>
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
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
  topSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  countCard: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  countNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.primary,
  },
  countLabel: {
    fontSize: 16,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
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
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});