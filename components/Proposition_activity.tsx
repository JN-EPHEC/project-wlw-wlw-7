import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../components/Colors";
import CustomDateTimePicker from "../components/DateTimePicker";
import { auth, db } from "../firebase_Config";
import { notifyUser } from "../service/notificationService";

interface Friend {
  id: string;
  displayName: string;
  photoURL?: string;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  members: string[];
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

interface ProposeActivityModalProps {
  visible: boolean;
  onClose: () => void;
  preSelectedActivity?: Activity | null;
}

export default function ProposeActivityModal({
  visible,
  onClose,
  preSelectedActivity = null,
}: ProposeActivityModalProps) {
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(preSelectedActivity);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<'new' | 'existing' | null>(null);
  const [step, setStep] = useState<'activity' | 'date' | 'recipient'>(preSelectedActivity ? 'date' : 'activity');
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
      if (preSelectedActivity) {
        setSelectedActivity(preSelectedActivity);
        setStep('date');
      }
    }
  }, [visible, preSelectedActivity]);

  // 🔧 FONCTION CORRIGÉE pour charger les amis depuis users.friends
  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Charger les activités seulement si pas d'activité pré-sélectionnée
      if (!preSelectedActivity) {
        const activitiesSnapshot = await getDocs(collection(db, "activities"));
        const activitiesList: Activity[] = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Activity));
        setActivities(activitiesList);
      }

      // Charger les groupes existants
      const groupsQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", currentUser.uid)
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsList: Group[] = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Group));
      setGroups(groupsList);

      // 🔧 NOUVELLE MÉTHODE : Charger les amis depuis le champ friends de l'user
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const friendIds: string[] = userData.friends || [];
        
        console.log("🔍 Friend IDs trouvés:", friendIds);

        // Récupérer les infos de chaque ami
        const friendsList: Friend[] = [];
        
        for (const friendId of friendIds) {
          try {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            if (friendDoc.exists()) {
              const friendData = friendDoc.data();
              friendsList.push({
                id: friendId,
                displayName: friendData.displayName || friendData.username || "Utilisateur",
                photoURL: friendData.photoURL || null,
              });
            }
          } catch (error) {
            console.error(`Erreur lors du chargement de l'ami ${friendId}:`, error);
          }
        }
        
        console.log("✅ Amis chargés:", friendsList.length, "ami(s)");
        setFriends(friendsList);
      } else {
        console.log("⚠️ Document user introuvable");
      }

    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
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

  const handleNext = () => {
    if (step === 'activity' && selectedActivity) {
      setStep('date');
    } else if (step === 'date' && selectedDate) {
      setStep('recipient');
    }
  };

  const handlePropose = async () => {
    if (!currentUser || !selectedActivity || !selectedDate) {
      Alert.alert("Erreur", "Données manquantes");
      return;
    }

    if (recipientType === 'new' && selectedFriends.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins un ami");
      return;
    }

    if (recipientType === 'existing' && !selectedGroup) {
      Alert.alert("Erreur", "Veuillez sélectionner un groupe");
      return;
    }

    if (selectedDate <= new Date()) {
      Alert.alert("Erreur", "La date doit être dans le futur");
      return;
    }

    setProposing(true);
    try {
      let targetGroupId = selectedGroup;
      let targetGroupMembers: string[] = [];

      if (recipientType === 'new') {
        targetGroupMembers = [currentUser.uid, ...selectedFriends];
        const groupName = `${selectedActivity.title} - ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
        
        const groupRef = await addDoc(collection(db, "groups"), {
          name: groupName,
          emoji: "🎉",
          members: targetGroupMembers,
          createdBy: currentUser.uid,
          createdAt: new Date().toISOString(),
          memberCount: targetGroupMembers.length,
          isAutoGenerated: true,
        });
        
        targetGroupId = groupRef.id;
      } else {
        const selectedGroupData = groups.find(g => g.id === selectedGroup);
        if (selectedGroupData) {
          targetGroupMembers = selectedGroupData.members;
        }
      }

      const deadline = new Date(selectedDate.getTime() - 60 * 60 * 1000);

      const participants: any = {};
      targetGroupMembers.forEach((memberId: string) => {
        participants[memberId] = {
          vote: memberId === currentUser.uid ? "coming" : "pending",
          reaction: null,
          updatedAt: new Date().toISOString(),
        };
      });

      await addDoc(collection(db, "groupActivities"), {
        groupId: targetGroupId,
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        activityDescription: selectedActivity.description,
        activityImage: selectedActivity.image || "",
        activityLocation: selectedActivity.location,
        activityDate: selectedDate.toISOString(),
        activityCategory: selectedActivity.category,
        deadline: deadline.toISOString(),
        proposedBy: currentUser.uid,
        proposedAt: new Date().toISOString(),
        participants,
      });

      const proposerName = currentUser.displayName || "Un ami";
      const otherMembers = targetGroupMembers.filter(id => id !== currentUser.uid);
      
      for (const memberId of otherMembers) {
        try {
          await notifyUser(
            memberId,
            "activity_proposed",
            `${proposerName} propose ${selectedActivity.title}`,
            {
              fromUserId: currentUser.uid,
              groupId: targetGroupId,
              activityId: selectedActivity.id,
            }
          );
        } catch (err) {
          console.error("Notification error:", err);
        }
      }

      Alert.alert("Succès", `Activité "${selectedActivity.title}" proposée ! 🎉`, [
        {
          text: "Voir le groupe",
          onPress: () => {
            onClose();
            router.push(`/Groupe/${targetGroupId}`);
          },
        },
        { 
          text: "OK", 
          onPress: () => {
            onClose();
            resetState();
          }
        },
      ]);
    } catch (error) {
      console.error("Error proposing activity:", error);
      Alert.alert("Erreur", "Impossible de proposer l'activité. Vérifiez vos permissions Firestore.");
    } finally {
      setProposing(false);
    }
  };

  const resetState = () => {
    setStep(preSelectedActivity ? 'date' : 'activity');
    setSelectedActivity(preSelectedActivity);
    setSelectedDate(null);
    setSelectedFriends([]);
    setSelectedGroup(null);
    setRecipientType(null);
  };

  const renderActivityStep = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepTitle}>Sélectionnez une activité</Text>
      <View style={styles.activitiesList}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              selectedActivity?.id === activity.id && styles.activityCardSelected
            ]}
            onPress={() => setSelectedActivity(activity)}
          >
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <View style={styles.activityMetaRow}>
                <Text style={styles.activityCategory}>{activity.category}</Text>
                <Text style={styles.activityMetaDivider}>•</Text>
                <Text style={styles.activityLocationInline}>{activity.location}</Text>
              </View>
            </View>

            {selectedActivity?.id === activity.id && (
              <View style={styles.selectedBadge}>
                <Icon name="checkmark-circle" size={28} color={COLORS.secondary} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderDateStep = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.activityPreview}>
        <Text style={styles.stepTitle}>Quand voulez-vous faire cette activité ?</Text>
        <View style={styles.activityCardPreview}>
          <Text style={styles.activityTitle}>{selectedActivity?.title}</Text>
          <View style={styles.activityMetaRow}>
            <Text style={styles.activityCategory}>
              {selectedActivity?.category}
            </Text>
            <Text style={styles.activityMetaDivider}>•</Text>
            <Text style={styles.activityLocationInline}>
              {selectedActivity?.location}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.dateSection}>
        <CustomDateTimePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Date et heure"
          minimumDate={new Date()}
        />
      </View>
    </ScrollView>
  );

  const renderRecipientStep = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.activityPreview}>
        <Text style={styles.stepTitle}>Avec qui ?</Text>
        <View style={styles.activityCardPreview}>
          <Text style={styles.activityTitle}>{selectedActivity?.title}</Text>
          <View style={styles.activityMeta}>
            <Icon name="calendar" size={14} color="#A78BFA" />
            <Text style={styles.dateText}>
              {selectedDate?.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </View>

      {!recipientType && (
        <View style={styles.typeSelection}>
          <TouchableOpacity
            style={styles.typeCard}
            onPress={() => setRecipientType('new')}
          >
            <LinearGradient
              colors={["#7C3AED", "#5B21B6"]}
              style={styles.typeCardGradient}
            >
              <Icon name="person-add" size={32} color="#FFFFFF" />
              <Text style={styles.typeCardTitle}>Nouveau groupe</Text>
              <Text style={styles.typeCardSubtitle}>Créer avec des amis</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeCard}
            onPress={() => setRecipientType('existing')}
          >
            <LinearGradient
              colors={["#EC4899", "#BE185D"]}
              style={styles.typeCardGradient}
            >
              <Icon name="people" size={32} color="#FFFFFF" />
              <Text style={styles.typeCardTitle}>Groupe existant</Text>
              <Text style={styles.typeCardSubtitle}>Choisir un groupe</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {recipientType === 'new' && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sélectionner des amis</Text>
            <TouchableOpacity onPress={() => setRecipientType(null)}>
              <Text style={styles.changeText}>Changer</Text>
            </TouchableOpacity>
          </View>

          {friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Vous n'avez pas encore d'amis</Text>
            </View>
          ) : (
            <>
              <View style={styles.friendsList}>
                {friends.map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendCard,
                      selectedFriends.includes(friend.id) && styles.friendCardSelected
                    ]}
                    onPress={() => toggleFriend(friend.id)}
                  >
                    <View style={styles.friendAvatar}>
                      {friend.photoURL ? (
                        <Image source={{ uri: friend.photoURL }} style={styles.avatarImage} />
                      ) : (
                        <Icon name="person" size={24} color={COLORS.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.friendName}>{friend.displayName}</Text>
                    
                    {selectedFriends.includes(friend.id) && (
                      <View style={styles.checkmark}>
                        <Icon name="checkmark-circle" size={24} color={COLORS.secondary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.selectedCount}>
                {selectedFriends.length} ami{selectedFriends.length > 1 ? 's' : ''} sélectionné{selectedFriends.length > 1 ? 's' : ''}
              </Text>
            </>
          )}
        </>
      )}

      {recipientType === 'existing' && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sélectionner un groupe</Text>
            <TouchableOpacity onPress={() => setRecipientType(null)}>
              <Text style={styles.changeText}>Changer</Text>
            </TouchableOpacity>
          </View>

          {groups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Vous n'avez pas encore de groupes</Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupCard,
                    selectedGroup === group.id && styles.groupCardSelected
                  ]}
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <View style={styles.groupEmoji}>
                    <Text style={styles.groupEmojiText}>{group.emoji}</Text>
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>
                      {group.members.length} membre{group.members.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  {selectedGroup === group.id && (
                    <View style={styles.checkmark}>
                      <Icon name="checkmark-circle" size={24} color={COLORS.secondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  const canProceed = () => {
    if (step === 'activity') return !!selectedActivity;
    if (step === 'date') return !!selectedDate;
    if (step === 'recipient') {
      if (recipientType === 'new') return selectedFriends.length > 0;
      if (recipientType === 'existing') return !!selectedGroup;
      return false;
    }
    return false;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient colors={[COLORS.backgroundTop, COLORS.backgroundBottom]} style={styles.container}>
        <View style={styles.header}>
          {step !== (preSelectedActivity ? 'date' : 'activity') && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (step === 'recipient') {
                  setStep('date');
                  setRecipientType(null);
                } else if (step === 'date' && !preSelectedActivity) {
                  setStep('activity');
                }
              }}
            >
              <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          {step === (preSelectedActivity ? 'date' : 'activity') && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Proposer à mes amis</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.stepsContainer}>
          {!preSelectedActivity && (
            <>
              <View style={[styles.stepDot, step === 'activity' && styles.stepDotActive]} />
              <View style={[styles.stepLine, (step === 'date' || step === 'recipient') && styles.stepLineActive]} />
            </>
          )}
          <View style={[styles.stepDot, step === 'date' && styles.stepDotActive]} />
          <View style={[styles.stepLine, step === 'recipient' && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'recipient' && styles.stepDotActive]} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {step === 'activity' && !preSelectedActivity && renderActivityStep()}
            {step === 'date' && renderDateStep()}
            {step === 'recipient' && renderRecipientStep()}

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.nextButtonWrapper}
                onPress={step === 'recipient' ? handlePropose : handleNext}
                disabled={!canProceed() || proposing}
              >
                <LinearGradient
                  colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.nextButton,
                    !canProceed() && styles.nextButtonDisabled
                  ]}
                >
                  {proposing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>
                        {step === 'recipient' ? 'Proposer l\'activité' : 'Suivant'}
                      </Text>
                      <Icon name={step === 'recipient' ? "checkmark" : "arrow-forward"} size={20} color="#FFFFFF" />
                    </>
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
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.secondary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: COLORS.secondary,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  activityPreview: {
    marginBottom: 24,
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activityCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  activityCardPreview: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  activityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityCategory: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A78BFA",
  },
  activityMetaDivider: {
    fontSize: 13,
    color: "#A78BFA",
  },
  activityLocationInline: {
    fontSize: 13,
    fontWeight: "500",
    color: "#A78BFA",
  },
  dateText: {
    fontSize: 12,
    color: "#A78BFA",
    fontWeight: "600",
  },
  selectedBadge: {
    marginLeft: 12,
  },
  dateSection: {
    marginTop: 12,
  },
  typeSelection: {
    gap: 16,
    marginTop: 12,
  },
  typeCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  typeCardGradient: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  typeCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  typeCardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  friendCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  friendName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  checkmark: {
    marginLeft: 8,
  },
  selectedCount: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
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
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  groupCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  groupEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  groupEmojiText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  nextButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});