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
  { id: "fire", emoji: "🔥", label: "Chaud" },
  { id: "late", emoji: "⏰", label: "En retard" },
  { id: "thinking", emoji: "🤔", label: "Je réfléchis" },
  { id: "maybe", emoji: "🤷", label: "Peut-être" },
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

      const latestDoc = snapshot.docs[snapshot.docs.length - 1];
      const activityData = { id: latestDoc.id, ...latestDoc.data() } as GroupActivity;
      
      setGroupActivity(activityData);

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
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}j restants`;
    } else if (diffHours > 0) {
      return `${diffHours}h restantes`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min restantes`;
    } else {
      return "Expiré";
    }
  };

  const formatActivityDate = (date: string) => {
    const activityDate = new Date(date);
    return activityDate.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Text style={styles.emptyText}>Aucune activité proposée</Text>
          <Text style={styles.emptySubtext}>Proposez une activité pour commencer !</Text>
        </View>
      </LinearGradient>
    );
  }

  const myVote = groupActivity.participants[currentUser?.uid || ""]?.vote;
  const myReaction = groupActivity.participants[currentUser?.uid || ""]?.reaction;
  const participantCount = Object.keys(groupActivity.participants).length;
  const comingCount = getVoteCount("coming");
  const notComingCount = getVoteCount("not_coming");
  const pendingCount = participantCount - comingCount - notComingCount;

  return (
    <LinearGradient colors={[COLORS.backgroundTop, COLORS.backgroundBottom]} style={styles.container}>
      {/* HEADER */}
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
        {/* 🎯 CARTE ACTIVITÉ AMÉLIORÉE */}
        <View style={styles.activityCard}>
          {/* IMAGE EN BACKGROUND */}
          {groupActivity.activityImage ? (
            <ImageBackground 
              source={{ uri: groupActivity.activityImage }} 
              style={styles.activityImageBackground}
              imageStyle={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.85)"]}
                style={styles.activityOverlay}
              >
                {/* TITRE + CATÉGORIE */}
                <View style={styles.activityHeaderContent}>
                  <Text style={styles.activityTitle}>{groupActivity.activityTitle}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{groupActivity.activityCategory}</Text>
                  </View>
                </View>

                {/* STATS RAPIDES */}
                <View style={styles.quickStats}>
                  <View style={styles.statItem}>
                    <Icon name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.statText}>{comingCount}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="close-circle" size={16} color="#EF4444" />
                    <Text style={styles.statText}>{notComingCount}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="time-outline" size={16} color="#FCD34D" />
                    <Text style={styles.statText}>{pendingCount}</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={["#7C3AED", "#5B21B6"]}
              style={styles.activityImageBackground}
            >
              <View style={styles.activityHeaderContent}>
                <Text style={styles.activityTitle}>{groupActivity.activityTitle}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{groupActivity.activityCategory}</Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* INFOS ACTIVITÉ */}
          <View style={styles.activityInfoSection}>
            {/* DATE & LIEU */}
            <View style={styles.infoRow}>
              <Icon name="calendar" size={18} color="#A78BFA" />
              <Text style={styles.infoText}>{formatActivityDate(groupActivity.activityDate)}</Text>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={openInMaps}>
              <Icon name="location" size={18} color="#EF4444" />
              <Text style={styles.infoText}>{groupActivity.activityLocation}</Text>
              <Icon name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* DEADLINE */}
            <View style={styles.deadlineCard}>
              <Icon name="time-outline" size={16} color="#FCD34D" />
              <Text style={styles.deadlineText}>
                Vote avant : {formatDeadline(groupActivity.deadline)}
              </Text>
            </View>

            {/* BOUTONS DE VOTE */}
            <View style={styles.voteButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.voteButton,
                  styles.voteButtonComing,
                  myVote === "coming" && styles.voteButtonComingActive
                ]}
                onPress={() => handleVote("coming")}
              >
                <Icon 
                  name={myVote === "coming" ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={22} 
                  color={myVote === "coming" ? "#FFFFFF" : "#10B981"} 
                />
                <Text style={[
                  styles.voteButtonText,
                  myVote === "coming" && styles.voteButtonTextActive
                ]}>
                  Je viens
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.voteButton,
                  styles.voteButtonNotComing,
                  myVote === "not_coming" && styles.voteButtonNotComingActive
                ]}
                onPress={() => handleVote("not_coming")}
              >
                <Icon 
                  name={myVote === "not_coming" ? "close-circle" : "close-circle-outline"} 
                  size={22} 
                  color={myVote === "not_coming" ? "#FFFFFF" : "#EF4444"} 
                />
                <Text style={[
                  styles.voteButtonText,
                  myVote === "not_coming" && styles.voteButtonTextActive
                ]}>
                  Je ne viens pas
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 😊 RÉACTIONS COMPACTES */}
        <View style={styles.reactionsSection}>
          <Text style={styles.sectionTitle}>💬 Réagis rapidement</Text>
          <View style={styles.reactionsGrid}>
            {REACTIONS.map((reaction) => {
              const count = getReactionCount(reaction.id);
              const isActive = myReaction === reaction.id;

              return (
                <TouchableOpacity
                  key={reaction.id}
                  style={[
                    styles.reactionButton,
                    isActive && styles.reactionButtonActive
                  ]}
                  onPress={() => handleReaction(reaction.id)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={[
                    styles.reactionLabel,
                    isActive && styles.reactionLabelActive
                  ]}>
                    {reaction.label}
                  </Text>
                  {count > 0 && (
                    <View style={styles.reactionCount}>
                      <Text style={styles.reactionCountText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 👥 PARTICIPANTS AMÉLIORÉS */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>
            👥 Participants ({participantCount})
          </Text>
          
          {Object.entries(groupActivity.participants).map(([userId, participant]) => {
            const user = users[userId];
            if (!user) return null;

            const userReaction = REACTIONS.find(r => r.id === participant.reaction);

            return (
              <View key={userId} style={styles.participantCard}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{user.displayName}</Text>
                  
                  <View style={styles.participantStatus}>
                    {participant.vote === "coming" && (
                      <View style={styles.statusBadgeGreen}>
                        <Icon name="checkmark" size={12} color="#FFFFFF" />
                        <Text style={styles.statusBadgeText}>Vient</Text>
                      </View>
                    )}
                    {participant.vote === "not_coming" && (
                      <View style={styles.statusBadgeRed}>
                        <Icon name="close" size={12} color="#FFFFFF" />
                        <Text style={styles.statusBadgeText}>Absent</Text>
                      </View>
                    )}
                    {participant.vote === "pending" && (
                      <View style={styles.statusBadgeGray}>
                        <Icon name="time" size={12} color="#FFFFFF" />
                        <Text style={styles.statusBadgeText}>En attente</Text>
                      </View>
                    )}
                    
                    {userReaction && (
                      <Text style={styles.participantReaction}>
                        {userReaction.emoji}
                      </Text>
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
    paddingHorizontal: 20,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  // 🎯 CARTE ACTIVITÉ
  activityCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityImageBackground: {
    width: "100%",
    height: 200,
  },
  activityOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  activityHeaderContent: {
    gap: 8,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  // INFOS SECTION
  activityInfoSection: {
    padding: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  deadlineCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(252, 211, 77, 0.15)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(252, 211, 77, 0.3)",
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FCD34D",
  },

  // BOUTONS DE VOTE
  voteButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  voteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  voteButtonComing: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "#10B981",
  },
  voteButtonComingActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  voteButtonNotComing: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#EF4444",
  },
  voteButtonNotComingActive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  voteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  voteButtonTextActive: {
    color: "#FFFFFF",
  },

  // RÉACTIONS
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
    fontSize: 18,
  },
  reactionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  reactionLabelActive: {
    color: COLORS.textPrimary,
  },
  reactionCount: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 4,
  },
  reactionCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // PARTICIPANTS
  participantsSection: {
    marginBottom: 24,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    gap: 6,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  participantStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeGray: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  participantReaction: {
    fontSize: 16,
  },
});
