import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
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
  groupId: string;
  activityId: string;
  activityTitle: string;
  activityDescription: string;
  activityImage: string;
  activityLocation: string;
  activityDate: string;
  activityCategory: string;
  deadline: string;
  proposedBy: string;
  proposedAt: string;
  participants: {
    [userId: string]: {
      vote: "coming" | "not_coming" | "pending";
      reaction: string | null;
      updatedAt: string;
    };
  };
}

interface User {
  username: string;
  displayName: string;
}

const REACTIONS = [
  { id: "fire", emoji: "🔥", label: "Trop Cool" },
  { id: "hot", emoji: "🔥", label: "Je suis chaud" },
  { id: "late", emoji: "⏰", label: "Je serai en retard" },
  { id: "thinking", emoji: "🤔", label: "Je réfléchis" },
  { id: "unavailable", emoji: "😐", label: "Pas dispo" },
  { id: "maybe", emoji: "❓", label: "Peut-être" },
];

export default function GroupDiscussionScreen() {
  const { id: groupId } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [groupActivity, setGroupActivity] = useState<GroupActivity | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!groupId || !currentUser) return;

    const groupActivitiesQuery = query(
      collection(db, "groupActivities"),
      where("groupId", "==", groupId)
    );

    const unsubscribe = onSnapshot(groupActivitiesQuery, async (snapshot) => {
      if (snapshot.empty) {
        setGroupActivity(null);
        setLoading(false);
        return;
      }

      // Prendre la dernière activité proposée
      const latestDoc = snapshot.docs[snapshot.docs.length - 1];
      const activityData = { id: latestDoc.id, ...latestDoc.data() } as GroupActivity;
      
      setGroupActivity(activityData);

      // Charger les infos des participants
      const participantIds = Object.keys(activityData.participants);
      const usersData: { [key: string]: User } = {};

      for (const userId of participantIds) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          usersData[userId] = {
            username: userDoc.data().username || "Utilisateur",
            displayName: userDoc.data().displayName || "Utilisateur",
          };
        }
      }

      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, currentUser]);

  const handleVote = async (vote: "coming" | "not_coming") => {
    if (!currentUser || !groupActivity) return;

    try {
      const activityRef = doc(db, "groupActivities", groupActivity.id);
      await updateDoc(activityRef, {
        [`participants.${currentUser.uid}.vote`]: vote,
        [`participants.${currentUser.uid}.updatedAt`]: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleReaction = async (reactionId: string) => {
    if (!currentUser || !groupActivity) return;

    try {
      const activityRef = doc(db, "groupActivities", groupActivity.id);
      const currentReaction = groupActivity.participants[currentUser.uid]?.reaction;
      
      // Toggle: si même réaction, la retirer
      const newReaction = currentReaction === reactionId ? null : reactionId;

      await updateDoc(activityRef, {
        [`participants.${currentUser.uid}.reaction`]: newReaction,
        [`participants.${currentUser.uid}.updatedAt`]: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error reacting:", error);
    }
  };

  const openInMaps = () => {
    if (!groupActivity) return;
    const address = encodeURIComponent(groupActivity.activityLocation);
    const url = `https://maps.google.com/?q=${address}`;
    Linking.openURL(url);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const hours = deadlineDate.getHours().toString().padStart(2, "0");
    const minutes = deadlineDate.getMinutes().toString().padStart(2, "0");
    return `${hours}h${minutes}`;
  };

  const formatActivityDate = (date: string) => {
    const activityDate = new Date(date);
    const hours = activityDate.getHours().toString().padStart(2, "0");
    const minutes = activityDate.getMinutes().toString().padStart(2, "0");
    return `${hours}h${minutes}`;
  };

  const getVoteCount = (vote: "coming" | "not_coming") => {
    if (!groupActivity) return 0;
    return Object.values(groupActivity.participants).filter(p => p.vote === vote).length;
  };

  const getReactionCount = (reactionId: string) => {
    if (!groupActivity) return 0;
    return Object.values(groupActivity.participants).filter(p => p.reaction === reactionId).length;
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.backgroundTop, COLORS.backgroundBottom]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </LinearGradient>
    );
  }

  if (!groupActivity) {
    return (
      <LinearGradient colors={[COLORS.backgroundTop, COLORS.backgroundBottom]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discussion</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Icon name="calendar-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Aucune activité proposée pour le moment</Text>
          <Text style={styles.emptySubtext}>Proposez une activité pour commencer !</Text>
        </View>
      </LinearGradient>
    );
  }

  const myVote = groupActivity.participants[currentUser?.uid || ""]?.vote;
  const myReaction = groupActivity.participants[currentUser?.uid || ""]?.reaction;
  const participantCount = Object.keys(groupActivity.participants).length;

  return (
    <LinearGradient colors={[COLORS.backgroundTop, COLORS.backgroundBottom]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
      >
        {/* CARTE ACTIVITÉ */}
        <View style={styles.activityCard}>
          <LinearGradient
            colors={["rgba(99, 102, 241, 0.2)", "rgba(139, 92, 246, 0.2)"]}
            style={styles.activityCardGradient}
          >
            {/* EN-TÊTE */}
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>{groupActivity.activityTitle} {groupActivity.activityCategory}</Text>
              <View style={styles.deadlineBadge}>
                <Icon name="time-outline" size={12} color={COLORS.textPrimary} />
                <Text style={styles.deadlineText}>
                  Vote avant {formatDeadline(groupActivity.deadline)} • {participantCount} participant{participantCount > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {/* IMAGE ACTIVITÉ */}
            {groupActivity.activityImage ? (
              <ImageBackground source={{ uri: groupActivity.activityImage }} style={styles.activityImage} imageStyle={{ borderRadius: 12 }}>
                <View style={styles.activityImageOverlay} />
                <Text style={styles.activityImageTitle}>{groupActivity.activityTitle}</Text>
              </ImageBackground>
            ) : null}

            {/* BOUTONS DE VOTE */}
            <View style={styles.voteButtonsContainer}>
              <TouchableOpacity
                style={[styles.voteButton, styles.voteButtonComing, myVote === "coming" && styles.voteButtonActive]}
                onPress={() => handleVote("coming")}
              >
                <Icon name="checkmark-circle" size={20} color={myVote === "coming" ? "#FFFFFF" : "#10B981"} />
                <Text style={[styles.voteButtonText, myVote === "coming" && styles.voteButtonTextActive]}>
                  Je viens ({getVoteCount("coming")})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voteButton, styles.voteButtonNotComing, myVote === "not_coming" && styles.voteButtonActive]}
                onPress={() => handleVote("not_coming")}
              >
                <Icon name="close-circle" size={20} color={myVote === "not_coming" ? "#FFFFFF" : "#EF4444"} />
                <Text style={[styles.voteButtonText, myVote === "not_coming" && styles.voteButtonTextActive]}>
                  Je ne viens pas ({getVoteCount("not_coming")})
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOCALISATION */}
            <TouchableOpacity style={styles.locationContainer} onPress={openInMaps}>
              <Icon name="location" size={16} color="#EF4444" />
              <Text style={styles.locationText}>
                Rendez-vous à {groupActivity.activityLocation} à {formatActivityDate(groupActivity.activityDate)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapsLink} onPress={openInMaps}>
              <Text style={styles.mapsLinkText}>[Ouvrir dans Google Maps]</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* RÉACTIONS À LA PROPOSITION */}
        <View style={styles.reactionsSection}>
          <Text style={styles.sectionTitle}>Réagis à la proposition :</Text>
          <View style={styles.reactionsGrid}>
            {REACTIONS.map((reaction) => {
              const count = getReactionCount(reaction.id);
              const isActive = myReaction === reaction.id;

              return (
                <TouchableOpacity
                  key={reaction.id}
                  style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
                  onPress={() => handleReaction(reaction.id)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={[styles.reactionLabel, isActive && styles.reactionLabelActive]}>{reaction.label}</Text>
                  {count > 0 && (
                    <View style={styles.reactionBadge}>
                      <Text style={styles.reactionBadgeText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* LISTE DES PARTICIPANTS */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>Participants :</Text>
          {Object.entries(groupActivity.participants).map(([userId, participant]) => {
            const user = users[userId];
            if (!user) return null;

            const userReaction = REACTIONS.find(r => r.id === participant.reaction);

            return (
              <View key={userId} style={styles.participantCard}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>{user.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{user.displayName}</Text>
                  <View style={styles.participantStatus}>
                    {participant.vote === "coming" && (
                      <>
                        <Icon name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={[styles.participantStatusText, { color: "#10B981" }]}>Vient</Text>
                      </>
                    )}
                    {participant.vote === "not_coming" && (
                      <>
                        <Icon name="close-circle" size={14} color="#EF4444" />
                        <Text style={[styles.participantStatusText, { color: "#EF4444" }]}>Ne vient pas</Text>
                      </>
                    )}
                    {participant.vote === "pending" && (
                      <>
                        <Icon name="help-circle" size={14} color={COLORS.textSecondary} />
                        <Text style={[styles.participantStatusText, { color: COLORS.textSecondary }]}>En attente</Text>
                      </>
                    )}
                    {userReaction && (
                      <>
                        <Text style={styles.reactionDot}>•</Text>
                        <Text style={styles.participantReaction}>{userReaction.emoji} {userReaction.label}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
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
  activityCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  activityCardGradient: {
    padding: 20,
  },
  activityHeader: {
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deadlineText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activityImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: "flex-end",
    padding: 12,
  },
  activityImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
  },
  activityImageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    zIndex: 1,
  },
  voteButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  voteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  voteButtonComing: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "#10B981",
  },
  voteButtonNotComing: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#EF4444",
  },
  voteButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  voteButtonTextActive: {
    color: "#FFFFFF",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mapsLink: {
    alignSelf: "flex-start",
  },
  mapsLinkText: {
    fontSize: 13,
    color: "#6366F1",
    fontWeight: "600",
  },
  reactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  reactionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  reactionLabelActive: {
    color: COLORS.textPrimary,
  },
  reactionBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 4,
  },
  reactionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  participantsSection: {
    marginBottom: 24,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  participantAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  participantStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  participantStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  reactionDot: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  participantReaction: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});