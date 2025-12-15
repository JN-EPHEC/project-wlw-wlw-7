import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

type BlockedUser = {
  uid: string;
  displayName: string;
  username: string;
  email: string;
};

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const blockedIds = userData.blockedUsers || [];

      // Charger les détails de chaque utilisateur bloqué
      const blockedData: BlockedUser[] = [];
      for (const blockedId of blockedIds) {
        const blockedDoc = await getDoc(doc(db, "users", blockedId));
        if (blockedDoc.exists()) {
          const data = blockedDoc.data();
          blockedData.push({
            uid: blockedId,
            displayName: data.displayName || data.username,
            username: data.username,
            email: data.email,
          });
        }
      }

      setBlockedUsers(blockedData);
    } catch (e) {
      console.error("Error loading blocked users:", e);
      Alert.alert("Erreur", "Impossible de charger les utilisateurs bloqués.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBlockedUsers();
  };

  const handleUnblock = (user: BlockedUser) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const confirmUnblock = async () => {
    if (!selectedUser) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        blockedUsers: arrayRemove(selectedUser.uid),
      });

      setBlockedUsers((prev) => prev.filter((u) => u.uid !== selectedUser.uid));
      Alert.alert("✅ Succès", `${selectedUser.displayName} a été débloqué.`);
      setModalVisible(false);
      setSelectedUser(null);
    } catch (e: any) {
      console.error("Error unblocking user:", e);
      Alert.alert("Erreur", "Impossible de débloquer cet utilisateur.");
    }
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <LinearGradient
          colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
      >
        <Icon name="checkmark-circle" size={20} color={COLORS.success} />
        <Text style={styles.unblockButtonText}>Débloquer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="happy-outline" size={64} color={COLORS.success} />
      </View>
      <Text style={styles.emptyText}>Aucun utilisateur bloqué</Text>
      <Text style={styles.emptySubtext}>
        Vous n'avez bloqué personne pour le moment.
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
          onPress={() => router.back()}
        >
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utilisateurs bloqués</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="ban" size={24} color={COLORS.error} />
          <Text style={styles.statNumber}>{blockedUsers.length}</Text>
          <Text style={styles.statLabel}>Utilisateurs bloqués</Text>
        </View>
      </View>

      {/* INFO BOX */}
      {blockedUsers.length > 0 && (
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Ces utilisateurs ne peuvent plus vous envoyer de demandes d'amis ni vous contacter.
          </Text>
        </View>
      )}

      {/* LISTE DES UTILISATEURS BLOQUÉS */}
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* MODAL DE CONFIRMATION */}
      <ConfirmModal
        visible={modalVisible}
        title="Débloquer cet utilisateur"
        message={`Voulez-vous débloquer ${selectedUser?.displayName} ?\n\nCette personne pourra à nouveau vous envoyer des demandes d'amis.`}
        confirmText="Débloquer"
        cancelText="Annuler"
        isDangerous={false}
        onConfirm={confirmUnblock}
        onCancel={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
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
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    marginHorizontal: 24,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.info,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  userCard: {
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
  userInfo: {
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  unblockButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  unblockButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});