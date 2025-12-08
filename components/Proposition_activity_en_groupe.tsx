import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../components/Colors";
import { auth, db } from "../firebase_Config";
import { notifyUser } from "../service/notificationService";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  image?: string;
  date: string;
}

interface ProposeActivityModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupMembers: string[];
}

export default function ProposeActivityModal({
  visible,
  onClose,
  groupId,
  groupMembers,
}: ProposeActivityModalProps) {
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadActivities();
    }
  }, [visible]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const activitiesSnapshot = await getDocs(collection(db, "activities"));
      const activitiesList: Activity[] = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Activity));

      setActivities(activitiesList);
    } catch (error) {
      console.error("Error loading activities:", error);
      Alert.alert("Erreur", "Impossible de charger les activités");
    } finally {
      setLoading(false);
    }
  };

  const proposeActivity = async () => {
    if (!currentUser || !selectedActivity) {
      Alert.alert("Erreur", "Sélectionnez une activité");
      return;
    }

    setProposing(true);
    try {
      // Créer l'activité de groupe avec deadline automatique
      const activityDate = new Date(selectedActivity.date);
      const deadline = new Date(activityDate.getTime() - 60 * 60 * 1000); // 1h avant

      const participants: any = {};
      groupMembers.forEach((memberId: string) => {
        participants[memberId] = {
          vote: memberId === currentUser.uid ? "coming" : "pending",
          reaction: null,
          updatedAt: new Date().toISOString(),
        };
      });

      await addDoc(collection(db, "groupActivities"), {
        groupId,
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        activityDescription: selectedActivity.description,
        activityImage: selectedActivity.image || "",
        activityLocation: selectedActivity.location,
        activityDate: selectedActivity.date,
        activityCategory: selectedActivity.category,
        deadline: deadline.toISOString(),
        proposedBy: currentUser.uid,
        proposedAt: new Date().toISOString(),
        participants,
      });

      // Envoyer les notifications aux autres membres
      const proposerName = currentUser.displayName || "Un membre";
      const otherMembers = groupMembers.filter(id => id !== currentUser.uid);

      Promise.all(
        otherMembers.map(memberId =>
          notifyUser(
            memberId,
            "activity_proposed",
            "Nouvelle activité proposée",
            `${proposerName} propose ${selectedActivity.title}`,
            {
              fromUserId: currentUser.uid,
              groupId,
              activityId: selectedActivity.id,
            }
          ).catch(err => console.error("Notification error:", err))
        )
      ).catch(err => console.error("Notifications error:", err));

      Alert.alert("Succès", `Activité "${selectedActivity.title}" proposée ! 🎉`);
      onClose();
      setSelectedActivity(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error proposing activity:", error);
      Alert.alert("Erreur", "Impossible de proposer l'activité");
    } finally {
      setProposing(false);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient colors={[COLORS.backgroundTop, COLORS.backgroundBottom]} style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposer une activité</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {/* BARRE DE RECHERCHE */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Icon name="search" size={18} color={COLORS.textSecondary} />
                <TextInput
                  placeholder="Rechercher une activité..."
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* LISTE DES ACTIVITÉS */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.activitiesList}>
                {filteredActivities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.activityCard,
                      selectedActivity?.id === activity.id && styles.activityCardSelected
                    ]}
                    onPress={() => setSelectedActivity(activity)}
                  >
                    {activity.image ? (
                      <ImageBackground
                        source={{ uri: activity.image }}
                        style={styles.activityImage}
                        imageStyle={{ borderRadius: 12 }}
                      >
                        <View style={styles.activityOverlay} />
                      </ImageBackground>
                    ) : (
                      <LinearGradient
                        colors={["#7C3AED", "#5B21B6"]}
                        style={styles.activityImage}
                      />
                    )}
                    
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <View style={styles.activityMeta}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{activity.category}</Text>
                        </View>
                      </View>
                      <View style={styles.activityLocation}>
                        <Icon name="location" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.activityLocationText}>{activity.location}</Text>
                      </View>
                    </View>

                    {selectedActivity?.id === activity.id && (
                      <View style={styles.selectedBadge}>
                        <Icon name="checkmark-circle" size={28} color={COLORS.secondary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}

                {filteredActivities.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Icon name="search-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>Aucune activité trouvée</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* BOUTON PROPOSER */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.proposeButtonWrapper}
                onPress={proposeActivity}
                disabled={!selectedActivity || proposing}
              >
                <LinearGradient
                  colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.proposeButton,
                    (!selectedActivity || proposing) && styles.proposeButtonDisabled
                  ]}
                >
                  {proposing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.proposeButtonText}>
                      Proposer cette activité
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  activityCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
  },
  activityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  activityLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityLocationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  selectedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.backgroundBottom,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  proposeButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },
  proposeButton: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  proposeButtonDisabled: {
    opacity: 0.5,
  },
  proposeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});