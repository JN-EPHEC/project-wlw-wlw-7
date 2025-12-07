import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
<<<<<<< HEAD
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
=======
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
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
=======
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
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;

<<<<<<< HEAD
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
=======
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
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
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

<<<<<<< HEAD
=======
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

>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
<<<<<<< HEAD
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
      </View>
=======
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
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
<<<<<<< HEAD
  content: {
    flex: 1,
=======
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
<<<<<<< HEAD
=======
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
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
<<<<<<< HEAD
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
=======
    marginBottom: 24,
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
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
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  messageAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  messageUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
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
=======
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
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
<<<<<<< HEAD
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
  },
=======
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
>>>>>>> eaf83161e3736f37e740212311bc2c7635600474
});