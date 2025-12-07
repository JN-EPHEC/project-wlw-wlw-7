import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
import { auth, db } from "../firebase_Config";
import { COLORS } from "./Colors";

interface Group {
  id: string;
  name: string;
  emoji: string;
  members: string[];
}

interface ProposeActivityModalProps {
  visible: boolean;
  onClose: () => void;
  activity: {
    id: string;
    title: string;
    description: string;
    image?: string;
    location: string;
    date: string;
    category: string;
  };
}

export default function ProposeActivityModal({
  visible,
  onClose,
  activity,
}: ProposeActivityModalProps) {
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && currentUser) {
      loadGroups();
    }
  }, [visible, currentUser]);

  const loadGroups = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const groupsQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", currentUser.uid)
      );
      const querySnapshot = await getDocs(groupsQuery);

      const groupsList: Group[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Group));

      setGroups(groupsList);
    } catch (error) {
      console.error("Error loading groups:", error);
      Alert.alert("Erreur", "Impossible de charger vos groupes");
    } finally {
      setLoading(false);
    }
  };

  const proposeToGroup = async (groupId: string) => {
    if (!currentUser) return;

    try {
      // Récupérer les membres du groupe
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) {
        Alert.alert("Erreur", "Groupe introuvable");
        return;
      }

      const groupMembers = groupDoc.data().members;

      // Créer l'activité de groupe avec deadline automatique
      const activityDate = new Date(activity.date);
      const deadline = new Date(activityDate.getTime() - 60 * 60 * 1000); // 1h avant

      const participants: any = {};
      groupMembers.forEach((memberId: string) => {
        participants[memberId] = {
          vote: memberId === currentUser.uid ? "coming" : "pending",
          reaction: null,
          updatedAt: new Date().toISOString(),
        };
      });

      const { addDoc } = await import("firebase/firestore");
      await addDoc(collection(db, "groupActivities"), {
        groupId,
        activityId: activity.id,
        activityTitle: activity.title,
        activityDescription: activity.description,
        activityImage: activity.image || "",
        activityLocation: activity.location,
        activityDate: activity.date,
        activityCategory: activity.category,
        deadline: deadline.toISOString(),
        proposedBy: currentUser.uid,
        proposedAt: new Date().toISOString(),
        participants,
      });

      Alert.alert("Succès", `Activité proposée au groupe ! 🎉`, [
        {
          text: "Voir le groupe",
          onPress: () => {
            onClose();
            router.push(`/Groupe/${groupId}`);
          },
        },
        { text: "OK", onPress: onClose },
      ]);
    } catch (error) {
      console.error("Error proposing activity:", error);
      Alert.alert("Erreur", "Impossible de proposer l'activité");
    }
  };

  const createNewGroup = () => {
    onClose();
    router.push("/Groupe/Crea_groupe");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposer à un groupe</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* ACTIVITÉ SÉLECTIONNÉE */}
            <View style={styles.activityPreview}>
              <Text style={styles.activityPreviewTitle}>Activité sélectionnée :</Text>
              <View style={styles.activityCard}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityCategory}>{activity.category}</Text>
              </View>
            </View>

            {/* BOUTON CRÉER UN NOUVEAU GROUPE */}
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={createNewGroup}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createGroupGradient}
              >
                <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.createGroupText}>Créer un nouveau groupe</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* LISTE DES GROUPES */}
            {groups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Vous n'avez pas encore de groupes</Text>
                <Text style={styles.emptySubtext}>
                  Créez un groupe pour proposer cette activité !
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Vos groupes :</Text>
                <View style={styles.groupsList}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={styles.groupCard}
                      onPress={() => proposeToGroup(group.id)}
                    >
                      <View style={styles.groupEmoji}>
                        <Text style={styles.groupEmojiText}>{group.emoji}</Text>
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupMembers}>
                          {group.members.length} membre{group.members.length > 1 ? "s" : ""}
                        </Text>
                      </View>
                      <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  activityPreview: {
    marginBottom: 24,
  },
  activityPreviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  activityCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  createGroupButton: {
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 32,
  },
  createGroupGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  createGroupText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  groupsList: {
    gap: 12,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  groupEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  groupEmojiText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});