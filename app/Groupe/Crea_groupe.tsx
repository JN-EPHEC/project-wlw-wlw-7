import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
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

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  image?: string;
  date: string;
}

export default function CreateGroupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: Amis, 3: Activité
  
  // Step 1: Info du groupe
  const [groupName, setGroupName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎳");
  
  // Step 2: Amis
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  
  // Step 3: Activité
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFriends();
    loadActivities();
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

  const loadActivities = async () => {
    try {
      const activitiesSnapshot = await getDocs(collection(db, "activities"));
      const activitiesList: Activity[] = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Activity));

      setActivities(activitiesList);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const goToNextStep = () => {
    if (step === 1) {
      if (!groupName.trim()) {
        Alert.alert("Erreur", "Donnez un nom à votre groupe");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedFriends.length === 0) {
        Alert.alert("Erreur", "Sélectionnez au moins un ami");
        return;
      }
      setStep(3);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const createGroup = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!selectedActivity) {
      Alert.alert("Erreur", "Sélectionnez une activité pour votre groupe");
      return;
    }

    setCreating(true);
    try {
      const groupsRef = collection(db, "groups");
      const allMembers = [currentUser.uid, ...selectedFriends].sort();
      
      // Vérifier si un groupe existe déjà avec exactement les mêmes membres
      const existingGroupsQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", currentUser.uid)
      );
      const existingGroupsSnapshot = await getDocs(existingGroupsQuery);
      
      const duplicateGroup = existingGroupsSnapshot.docs.find(doc => {
        const groupMembers = [...doc.data().members].sort();
        return JSON.stringify(groupMembers) === JSON.stringify(allMembers);
      });

      if (duplicateGroup) {
        const duplicateName = duplicateGroup.data().name;
        setCreating(false);
        Alert.alert(
          "Groupe existant",
          `Un groupe "${duplicateName}" existe déjà avec ces mêmes membres. Voulez-vous le consulter ?`,
          [
            { text: "Non", style: "cancel" },
            {
              text: "Voir le groupe",
              onPress: () => {
                router.back();
                router.push(`/Groupe/${duplicateGroup.id}`);
              }
            }
          ]
        );
        return;
      }
      
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

      // Créer l'activité de groupe avec deadline automatique
      const activityDate = new Date(selectedActivity.date);
      const deadline = new Date(activityDate.getTime() - 60 * 60 * 1000); // 1h avant

      const participants: any = {};
      allMembers.forEach((memberId: string) => {
        participants[memberId] = {
          vote: memberId === currentUser.uid ? "coming" : "pending",
          reaction: null,
          updatedAt: new Date().toISOString(),
        };
      });

      await addDoc(collection(db, "groupActivities"), {
        groupId: groupDoc.id,
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

      // Envoyer les notifications
      const creatorName = currentUser.displayName || "Un utilisateur";
      
      Promise.all(
        selectedFriends.map(friendId =>
          notifyUser(
            friendId,
            "group_invite",
            "Nouveau groupe",
            `${creatorName} vous a ajouté au groupe "${groupName}" pour ${selectedActivity.title}`,
            { 
              fromUserId: currentUser.uid,
              groupId: groupDoc.id,
              groupName: groupName,
            }
          ).catch(err => console.error("Notification error:", err))
        )
      ).catch(err => console.error("Notifications error:", err));

      Alert.alert("Succès", `Groupe "${groupName}" créé ! 🎉`, [
        { 
          text: "OK", 
          onPress: () => router.push(`/Groupe/${groupDoc.id}`)
        }
      ]);
    } catch (error: any) {
      console.error("Error creating group:", error);
      Alert.alert("Erreur", "Impossible de créer le groupe");
    } finally {
      setCreating(false);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goToPreviousStep}
            >
              <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {step === 1 ? "Infos du groupe" : step === 2 ? "Ajouter des amis" : "Choisir une activité"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* PROGRESS INDICATOR */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
          </View>

          {/* STEP 1: INFO DU GROUPE */}
          {step === 1 && (
            <>
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
            </>
          )}

          {/* STEP 2: SÉLECTION DES AMIS */}
          {step === 2 && (
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
                    onPress={() => router.push("/Profile/Search_friends")}
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
          )}

          {/* STEP 3: SÉLECTION DE L'ACTIVITÉ */}
          {step === 3 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rechercher une activité</Text>
                <View style={styles.searchBar}>
                  <Icon name="search" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    placeholder="Rechercher..."
                    placeholderTextColor={COLORS.textSecondary}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

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
                        <Icon name="location" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.activityMetaText}>{activity.location}</Text>
                      </View>
                    </View>

                    {selectedActivity?.id === activity.id && (
                      <Icon name="checkmark-circle" size={24} color={COLORS.secondary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* BOUTON SUIVANT/CRÉER */}
          <TouchableOpacity
            style={styles.createButtonWrapper}
            onPress={step === 3 ? createGroup : goToNextStep}
            disabled={creating || (step === 2 && friends.length === 0)}
          >
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.createButton,
                ((creating || (step === 2 && friends.length === 0))) && styles.createButtonDisabled
              ]}
            >
              <Text style={styles.createButtonText}>
                {creating ? "Création..." : step === 3 ? "Créer le groupe" : "Suivant"}
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.neutralGray800,
  },
  progressLineActive: {
    backgroundColor: COLORS.secondary,
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
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  activityCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  activityImage: {
    width: 60,
    height: 60,
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
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
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