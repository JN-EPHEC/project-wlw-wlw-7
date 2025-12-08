import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
<<<<<<< HEAD
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  RefreshControl,
=======
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

<<<<<<< HEAD
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
=======
const QUICK_REACTIONS = [
  { emoji: "👍", text: "D'accord", color: "#10B981" },
  { emoji: "👎", text: "Pas d'accord", color: "#EF4444" },
  { emoji: "😂", text: "MDR", color: "#F59E0B" },
  { emoji: "❤️", text: "J'adore", color: "#EF4444" },
  { emoji: "🔥", text: "Chaud !", color: "#F97316" },
  { emoji: "🤔", text: "Réfléchis", color: "#8B5CF6" },
  { emoji: "👀", text: "Vu", color: "#3B82F6" },
  { emoji: "⏰", text: "En retard", color: "#F59E0B" },
  { emoji: "✅", text: "C'est fait", color: "#10B981" },
  { emoji: "❌", text: "Annulé", color: "#EF4444" },
];

interface Message {
  id: string;
  emoji: string;
  text: string;
  userId: string;
  username: string;
  timestamp: any;
  reactions: { [emoji: string]: string[] };
}

export default function GroupDiscussionScreen() {
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
  const router = useRouter();
  const currentUser = auth.currentUser;

<<<<<<< HEAD
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
=======
  const [groupName, setGroupName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroupName();
      subscribeToMessages();
    }
  }, [groupId]);

  const loadGroupName = async () => {
    if (!groupId) return;
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        setGroupName(groupDoc.data().name);
      }
    } catch (error) {
      console.error("Error loading group:", error);
    }
  };

  const subscribeToMessages = () => {
    if (!groupId) return;

    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        emoji: doc.data().emoji,
        text: doc.data().text,
        userId: doc.data().userId,
        username: doc.data().username,
        timestamp: doc.data().timestamp,
        reactions: doc.data().reactions || {},
      }));

      setMessages(messagesList);
      setLoading(false);
    });

    return unsubscribe;
  };

  const sendReaction = async (reaction: typeof QUICK_REACTIONS[0]) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupId) return;

    setSending(true);
    try {
      const messagesRef = collection(db, "groups", groupId, "messages");
      
      await addDoc(messagesRef, {
        emoji: reaction.emoji,
        text: reaction.text,
        userId: currentUser.uid,
        username: currentUser.displayName || "Utilisateur",
        timestamp: Timestamp.now(),
        reactions: {},
      });

      // Mettre à jour lastActivity du groupe
      await updateDoc(doc(db, "groups", groupId), {
        lastActivity: reaction.text,
      });

      console.log("✅ Reaction sent");
    } catch (error) {
      console.error("Error sending reaction:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la réaction");
    } finally {
      setSending(false);
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupId) return;

    try {
      const messageRef = doc(db, "groups", groupId, "messages", messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;

      const currentReactions = messageDoc.data().reactions || {};
      const usersWhoReacted = currentReactions[emoji] || [];

      // Toggle : si déjà réagi, on retire, sinon on ajoute
      if (usersWhoReacted.includes(currentUser.uid)) {
        await updateDoc(messageRef, {
          [`reactions.${emoji}`]: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(messageRef, {
          [`reactions.${emoji}`]: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString();
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
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

<<<<<<< HEAD
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
=======
  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{groupName}</Text>
            <Text style={styles.headerSubtitle}>Discussion rapide</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* MESSAGES */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="chatbubbles-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                Aucune réaction pour le moment
              </Text>
              <Text style={styles.emptySubtext}>
                Soyez le premier à réagir !
              </Text>
            </View>
          ) : (
            messages.map((message) => {
              const isOwn = message.userId === auth.currentUser?.uid;
              const totalReactions = Object.values(message.reactions).reduce(
                (sum, users) => sum + users.length, 
                0
              );

              return (
                <View
                  key={message.id}
                  style={[styles.messageCard, isOwn && styles.messageCardOwn]}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.messageUserInfo}>
                      <View style={styles.messageAvatar}>
                        <Text style={styles.messageAvatarText}>
                          {message.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.messageUsername}>
                          {isOwn ? "Vous" : message.username}
                        </Text>
                        <Text style={styles.messageTime}>
                          {formatTime(message.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.messageContent}>
                    <Text style={styles.messageEmoji}>{message.emoji}</Text>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>

                  {/* REACTIONS TO MESSAGE */}
                  {totalReactions > 0 && (
                    <View style={styles.messageReactions}>
                      {Object.entries(message.reactions).map(([emoji, users]) => 
                        users.length > 0 ? (
                          <TouchableOpacity
                            key={emoji}
                            style={styles.reactionBubble}
                            onPress={() => reactToMessage(message.id, emoji)}
                          >
                            <Text style={styles.reactionEmoji}>{emoji}</Text>
                            <Text style={styles.reactionCount}>{users.length}</Text>
                          </TouchableOpacity>
                        ) : null
                      )}
                    </View>
                  )}

                  {/* QUICK REACT BUTTONS */}
                  <View style={styles.quickReactButtons}>
                    {["❤️", "😂", "👍", "🔥"].map(emoji => (
                      <TouchableOpacity
                        key={emoji}
                        style={styles.quickReactButton}
                        onPress={() => reactToMessage(message.id, emoji)}
                      >
                        <Text style={styles.quickReactEmoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
              );
            })
          )}
        </ScrollView>

        {/* QUICK REACTIONS BAR */}
        <View style={styles.reactionsBar}>
          <Text style={styles.reactionsBarTitle}>Réaction rapide</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reactionsScroll}
          >
            {QUICK_REACTIONS.map((reaction) => (
              <TouchableOpacity
                key={reaction.emoji}
                style={styles.reactionButton}
                onPress={() => sendReaction(reaction)}
                disabled={sending}
              >
                <Text style={styles.reactionButtonEmoji}>{reaction.emoji}</Text>
                <Text style={styles.reactionButtonText}>{reaction.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
<<<<<<< HEAD
=======
  content: {
    flex: 1,
  },
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
<<<<<<< HEAD
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
=======
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
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
<<<<<<< HEAD
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
=======
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  messageCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageCardOwn: {
    borderColor: COLORS.secondary,
    backgroundColor: "rgba(181, 123, 255, 0.1)",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  messageUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
<<<<<<< HEAD
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
=======
  messageAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  messageUsername: {
    fontSize: 14,
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
<<<<<<< HEAD
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
=======
  messageTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  messageEmoji: {
    fontSize: 32,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  messageReactions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  reactionBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  quickReactButtons: {
    flexDirection: "row",
    gap: 8,
  },
  quickReactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  quickReactEmoji: {
    fontSize: 18,
  },
  reactionsBar: {
    backgroundColor: COLORS.neutralGray800,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    paddingBottom: 32,
  },
  reactionsBarTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  reactionsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  reactionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    minWidth: 100,
  },
  reactionButtonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  reactionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
>>>>>>> 41ea0eb6c35d700a58f4715e4010b3cdee99a5c7
  },
});