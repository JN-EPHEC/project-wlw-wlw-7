import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

interface GroupActivity {
  id: string;
  activityTitle: string;
  activityDescription: string;
  activityImage: string;
  activityLocation: string;
  activityDate: string;
  activityCategory: string;
  proposedBy: string;
  proposedAt: string;
  participants: {
    [userId: string]: {
      status: "pending" | "coming" | "late" | "thinking" | "unavailable";
      message: string;
      updatedAt: string;
    };
  };
}

interface Member {
  id: string;
  username: string;
}

const REACTIONS = [
  { status: "coming", label: "J'arrive !", emoji: "✅", color: "#10B981" },
  { status: "late", label: "10min de retard", emoji: "⏱️", color: "#F59E0B" },
  { status: "thinking", label: "Je réfléchis", emoji: "🤔", color: "#6366F1" },
  { status: "unavailable", label: "Pas dispo", emoji: "❌", color: "#EF4444" },
];

export default function DiscuGroupeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;

  const [groupActivity, setGroupActivity] = useState<GroupActivity | null>(null);
  const [members, setMembers] = useState<{ [key: string]: Member }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proposerName, setProposerName] = useState("");

  useEffect(() => {
    loadGroupActivity();
  }, [groupId]);

  const loadGroupActivity = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupId) return;

    try {
      // Charger l'activité du groupe
      const activitiesQuery = query(
        collection(db, "groupActivities"),
        where("groupId", "==", groupId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      if (activitiesSnapshot.empty) {
        setGroupActivity(null);
        setLoading(false);
        return;
      }

      // Prendre la dernière activité proposée
      const latestActivity = activitiesSnapshot.docs[activitiesSnapshot.docs.length - 1];
      const activityData = {
        id: latestActivity.id,
        ...latestActivity.data()
      } as GroupActivity;

      setGroupActivity(activityData);

      // Charger les infos des membres
      const memberIds = Object.keys(activityData.participants);
      const membersData: { [key: string]: Member } = {};

      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, "users", memberId));
        if (memberDoc.exists()) {
          membersData[memberId] = {
            id: memberId,
            username: memberDoc.data().username || "Utilisateur",
          };
        }
      }

      setMembers(membersData);

      // Charger le nom du proposeur
      const proposerDoc = await getDoc(doc(db, "users", activityData.proposedBy));
      if (proposerDoc.exists()) {
        setProposerName(proposerDoc.data().username || "Un membre");
      }
    } catch (error) {
      console.error("Error loading group activity:", error);
      Alert.alert("Erreur", "Impossible de charger l'activité");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateMyStatus = async (status: string, message: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupActivity) return;

    try {
      const activityRef = doc(db, "groupActivities", groupActivity.id);
      
      await updateDoc(activityRef, {
        [`participants.${currentUser.uid}.status`]: status,
        [`participants.${currentUser.uid}.message`]: message,
        [`participants.${currentUser.uid}.updatedAt`]: new Date().toISOString(),
      });

      // Mettre à jour localement
      setGroupActivity(prev => {
        if (!prev) return null;
        return {
          ...prev,
          participants: {
            ...prev.participants,
            [currentUser.uid]: {
              status: status as any,
              message,
              updatedAt: new Date().toISOString(),
            }
          }
        };
      });
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour votre statut");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroupActivity();
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

  if (!groupActivity) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <Icon name="calendar-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Aucune activité proposée</Text>
          <Text style={styles.emptySubtext}>
            Les membres peuvent proposer des activités depuis l'onglet Home
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const currentUser = auth.currentUser;
  const myStatus = currentUser ? groupActivity.participants[currentUser.uid] : null;

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activité du groupe</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ACTIVITY CARD */}
        <View style={styles.activityCard}>
          {groupActivity.activityImage ? (
            <ImageBackground
              source={{ uri: groupActivity.activityImage }}
              style={styles.activityImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.imageOverlay} />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{groupActivity.activityCategory}</Text>
              </View>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={["#7C3AED", "#5B21B6"]}
              style={styles.activityImage}
            >
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{groupActivity.activityCategory}</Text>
              </View>
            </LinearGradient>
          )}

          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>{groupActivity.activityTitle}</Text>
            <Text style={styles.activityDescription}>{groupActivity.activityDescription}</Text>
            
            <View style={styles.activityMeta}>
              <View style={styles.metaItem}>
                <Icon name="location" size={16} color={COLORS.error} />
                <Text style={styles.metaText}>{groupActivity.activityLocation}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="calendar" size={16} color={COLORS.secondary} />
                <Text style={styles.metaText}>
                  {new Date(groupActivity.activityDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>

            <Text style={styles.proposedBy}>
              Proposé par {proposerName}
            </Text>
          </View>
        </View>

        {/* MES RÉACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma réponse</Text>
          <View style={styles.reactionsGrid}>
            {REACTIONS.map((reaction) => (
              <TouchableOpacity
                key={reaction.status}
                style={[
                  styles.reactionButton,
                  myStatus?.status === reaction.status && styles.reactionButtonActive,
                  { borderColor: reaction.color }
                ]}
                onPress={() => updateMyStatus(reaction.status, reaction.label)}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text 
                  style={[
                    styles.reactionLabel,
                    myStatus?.status === reaction.status && { color: reaction.color }
                  ]}
                >
                  {reaction.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PARTICIPANTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participants ({Object.keys(groupActivity.participants).length})
          </Text>
          <View style={styles.participantsList}>
            {Object.entries(groupActivity.participants).map(([userId, participant]) => {
              const member = members[userId];
              if (!member) return null;

              const reaction = REACTIONS.find(r => r.status === participant.status);
              const isPending = participant.status === "pending";

              return (
                <View key={userId} style={styles.participantCard}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantAvatarText}>
                      {member.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{member.username}</Text>
                    {isPending ? (
                      <Text style={styles.participantStatus}>En attente de réponse...</Text>
                    ) : (
                      <View style={styles.participantReaction}>
                        <Text style={styles.reactionEmoji}>{reaction?.emoji}</Text>
                        <Text style={[styles.participantMessage, { color: reaction?.color }]}>
                          {participant.message}
                        </Text>
                      </View>
                    )}
                  </View>

                  {!isPending && reaction && (
                    <View style={[styles.statusIndicator, { backgroundColor: reaction.color }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  activityCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  activityImage: {
    height: 200,
    justifyContent: "flex-end",
    padding: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  activityInfo: {
    padding: 20,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  activityMeta: {
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  proposedBy: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reactionButton: {
    width: "48%",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  reactionButtonActive: {
    backgroundColor: "rgba(124, 58, 237, 0.1)",
  },
  reactionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  reactionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  participantAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  participantStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  participantReaction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  participantMessage: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});