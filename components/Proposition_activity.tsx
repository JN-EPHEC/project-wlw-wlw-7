import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
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
  memberCount: number;
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
  activity 
}: ProposeActivityModalProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadGroups();
    }
  }, [visible]);

  const loadGroups = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const groupsQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", currentUser.uid)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsList = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Group));

      setGroups(groupsList);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const proposeToGroup = async (groupId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setProposing(true);
    try {
      // Récupérer les membres du groupe
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) {
        Alert.alert("Erreur", "Groupe introuvable");
        return;
      }

      const groupData = groupDoc.data();
      const members = groupData.members || [];

      // Créer les participants avec statut "pending" pour tous sauf le proposeur
      const participants: any = {};
      members.forEach((memberId: string) => {
        participants[memberId] = {
          status: memberId === currentUser.uid ? "coming" : "pending",
          message: memberId === currentUser.uid ? "J'organise ! 🎉" : "",
          updatedAt: new Date().toISOString(),
        };
      });

      // Créer la proposition d'activité
      await addDoc(collection(db, "groupActivities"), {
        groupId,
        activityId: activity.id,
        activityTitle: activity.title,
        activityDescription: activity.description,
        activityImage: activity.image || "",
        activityLocation: activity.location,
        activityDate: activity.date,
        activityCategory: activity.category,
        proposedBy: currentUser.uid,
        proposedAt: new Date().toISOString(),
        participants,
      });

      Alert.alert(
        "Succès ! 🎉",
        `Activité proposée au groupe !`,
        [
          {
            text: "Voir le groupe",
            onPress: () => {
              onClose();
              router.push(`/Groupe/Discu_groupe?id=${groupId}`);
            }
          },
          { text: "OK", onPress: onClose }
        ]
      );
    } catch (error) {
      console.error("Error proposing activity:", error);
      Alert.alert("Erreur", "Impossible de proposer l'activité");
    } finally {
      setProposing(false);
    }
  };

  const createNewGroup = () => {
    onClose();
    router.push("/Groupe/Crea_groupe");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
            style={styles.modalContent}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Proposer à un groupe</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* ACTIVITY PREVIEW */}
            <View style={styles.activityPreview}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityLocation}>📍 {activity.location}</Text>
            </View>

            {/* LOADING */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
              </View>
            ) : (
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* NOUVEAU GROUPE */}
                <TouchableOpacity
                  style={styles.newGroupButton}
                  onPress={createNewGroup}
                  disabled={proposing}
                >
                  <LinearGradient
                    colors={[COLORS.secondary, "#7C3AED"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.newGroupGradient}
                  >
                    <Icon name="add-circle" size={24} color={COLORS.textPrimary} />
                    <Text style={styles.newGroupText}>Créer un nouveau groupe</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* LISTE DES GROUPES */}
                {groups.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>
                      Vous n'avez pas encore de groupes
                    </Text>
                  </View>
                ) : (
                  <View style={styles.groupsList}>
                    <Text style={styles.sectionTitle}>Vos groupes</Text>
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={styles.groupCard}
                        onPress={() => proposeToGroup(group.id)}
                        disabled={proposing}
                      >
                        <View style={styles.groupEmoji}>
                          <Text style={styles.emojiText}>{group.emoji}</Text>
                        </View>
                        <View style={styles.groupInfo}>
                          <Text style={styles.groupName}>{group.name}</Text>
                          <Text style={styles.groupMembers}>
                            {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                          </Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    justifyContent: "center",
    alignItems: "center",
  },
  activityPreview: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  activityLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  newGroupButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  newGroupGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
  },
  newGroupText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  groupEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  groupMembers: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});