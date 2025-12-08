import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

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
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  },
});