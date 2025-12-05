import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";
import { notifyUser } from "../../service/notificationService";

const EMOJIS = ["🎳", "🎮", "🍕", "🎬", "⚽", "🎵", "🎨", "📚", "✈️", "🏖️", "🎉", "💼"];

interface Friend {
  id: string;
  username: string;
  email: string;
}

export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎳");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.data();
      const friendIds = userData?.friends || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const friendsData: Friend[] = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, "users", friendId));
        if (friendDoc.exists()) {
          friendsData.push({
            id: friendId,
            username: friendDoc.data().username || "Utilisateur",
            email: friendDoc.data().email || "",
          });
        }
      }

      setFriends(friendsData);
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Erreur", "Impossible de charger vos amis");
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const createGroup = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!groupName.trim()) {
      Alert.alert("Erreur", "Donnez un nom à votre groupe");
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert("Erreur", "Sélectionnez au moins un ami");
      return;
    }

    setCreating(true);
    try {
      const groupsRef = collection(db, "groups");
      const allMembers = [currentUser.uid, ...selectedFriends];
      
      const groupData = {
        name: groupName.trim(),
        emoji: selectedEmoji,
        members: allMembers,
        memberCount: allMembers.length,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        lastActivity: "Groupe créé",
      };

      const groupDoc = await addDoc(groupsRef, groupData);
      console.log("✅ Group created:", groupDoc.id);

      // Envoyer les notifications en arrière-plan (sans bloquer l'interface)
      const creatorName = currentUser.displayName || "Un utilisateur";
      
      Promise.all(
        selectedFriends.map(friendId =>
          notifyUser(
            friendId,
            "group_invite",
            "Nouveau groupe",
            `${creatorName} vous a ajouté au groupe "${groupName}"`,
            { 
              fromUserId: currentUser.uid,
              groupId: groupDoc.id,
              groupName: groupName,
            }
          ).catch(err => console.error("Notification error:", err))
        )
      ).catch(err => console.error("Notifications error:", err));

      // Rediriger immédiatement
      Alert.alert("Succès", `Groupe "${groupName}" créé !`, [
        { 
          text: "OK", 
          onPress: () => router.back()
        }
      ]);
    } catch (error: any) {
      console.error("Error creating group:", error);
      Alert.alert("Erreur", "Impossible de créer le groupe");
    } finally {
      setCreating(false);
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
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Créer un groupe</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nom du groupe</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Bowling 🎳"
              placeholderTextColor={COLORS.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={30}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir un emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ajouter des amis ({selectedFriends.length} sélectionné{selectedFriends.length > 1 ? "s" : ""})
            </Text>
            
            {friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>
                  Vous n'avez pas encore d'amis
                </Text>
                <TouchableOpacity 
                  style={styles.addFriendsButton}
                  onPress={() => (router as any).push("/Profile/Search_friends")}
                >
                  <Text style={styles.addFriendsButtonText}>
                    Ajouter des amis
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friends.map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendCard,
                      selectedFriends.includes(friend.id) && styles.friendCardSelected
                    ]}
                    onPress={() => toggleFriend(friend.id)}
                  >
                    <View style={styles.friendInfo}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {friend.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.friendName}>{friend.username}</Text>
                        <Text style={styles.friendEmail}>{friend.email}</Text>
                      </View>
                    </View>
                    
                    <View style={[
                      styles.checkbox,
                      selectedFriends.includes(friend.id) && styles.checkboxChecked
                    ]}>
                      {selectedFriends.includes(friend.id) && (
                        <Icon name="checkmark" size={16} color={COLORS.textPrimary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.createButtonWrapper}
            onPress={createGroup}
            disabled={creating || friends.length === 0}
          >
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.createButton,
                (creating || friends.length === 0) && styles.createButtonDisabled
              ]}
            >
              <Text style={styles.createButtonText}>
                {creating ? "Création..." : "Créer le groupe"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiButtonSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  emojiText: {
    fontSize: 28,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  friendCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  friendEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  addFriendsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.secondary,
  },
  addFriendsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  createButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 24,
  },
  createButton: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});