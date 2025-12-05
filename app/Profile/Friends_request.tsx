import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
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
import { notifyUser } from "../../service/notificationService";

export default function FriendRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const requestsRef = collection(db, "friendRequests");
      const q = query(
        requestsRef,
        where("to", "==", currentUser.uid),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);
      const requestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequests(requestsList);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: string, fromUserId: string, fromUsername: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Mettre à jour le statut de la demande
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      });

      // 2. Ajouter chacun dans la liste d'amis de l'autre
      const currentUserRef = doc(db, "users", currentUser.uid);
      const otherUserRef = doc(db, "users", fromUserId);

      await Promise.all([
        updateDoc(currentUserRef, {
          friends: arrayUnion(fromUserId)
        }),
        updateDoc(otherUserRef, {
          friends: arrayUnion(currentUser.uid)
        })
      ]);

      // 3. Envoyer la notification d'acceptation
      await notifyUser(
        fromUserId,
        "friend_accept",
        "Demande acceptée",
        `${currentUser.displayName} a accepté votre demande d'ami`,
        { fromUserId: currentUser.uid }
      );

      Alert.alert("Succès", `Vous êtes maintenant ami avec ${fromUsername} !`);
      
      // Retirer de la liste
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error: any) {
      console.error("Error accepting request:", error);
      Alert.alert("Erreur", "Impossible d'accepter la demande");
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      // Supprimer la demande
      await deleteDoc(doc(db, "friendRequests", requestId));
      
      // Retirer de la liste
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Error declining request:", error);
      Alert.alert("Erreur", "Impossible de refuser la demande");
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demandes d'amis</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* REQUESTS LIST */}
        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucune demande d'ami</Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {request.fromUsername?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View style={styles.requestText}>
                    <Text style={styles.username}>{request.fromUsername}</Text>
                    <Text style={styles.message}>vous a envoyé une demande d'ami</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptRequest(request.id, request.from, request.fromUsername)}
                  >
                    <Icon name="checkmark" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => declineRequest(request.id)}
                  >
                    <Icon name="close" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
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
    marginBottom: 32,
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
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  requestText: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
  },
});