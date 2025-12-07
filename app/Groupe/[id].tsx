import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { arrayRemove, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

interface GroupData {
  name: string;
  emoji: string;
  members: string[];
  memberCount: number;
  createdBy: string;
  createdAt: string;
  lastActivity: string;
}

interface Member {
  id: string;
  username: string;
  email: string;
}

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;

  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
    }
  }, [groupId]);

  const loadGroupDetails = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupId) return;

    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      
      if (!groupDoc.exists()) {
        Alert.alert("Erreur", "Groupe introuvable");
        router.replace("/(tabs)/Groupe");
        return;
      }

      const groupData = groupDoc.data() as GroupData;
      setGroup(groupData);
      setIsCreator(groupData.createdBy === currentUser.uid);

      const membersData: Member[] = [];
      for (const memberId of groupData.members) {
        const memberDoc = await getDoc(doc(db, "users", memberId));
        if (memberDoc.exists()) {
          membersData.push({
            id: memberId,
            username: memberDoc.data().username || "Utilisateur",
            email: memberDoc.data().email || "",
          });
        }
      }
      setMembers(membersData);
    } catch (error) {
      console.error("Error loading group:", error);
      Alert.alert("Erreur", "Impossible de charger le groupe");
    } finally {
      setLoading(false);
    }
  };

  const openDiscussion = () => {
    console.log("🚀 Opening discussion for group:", groupId);
    router.push({
      pathname: "/Groupe/Discu_groupe",
      params: { id: groupId }
    });
  };

  const openEditGroup = () => {
    console.log("✏️ Opening edit for group:", groupId);
    router.push({
      pathname: "/Groupe/Modif_groupe",
      params: { id: groupId }
    });
  };

  const leaveGroup = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupId) return;

    // Confirmation simple
    const confirmed = window.confirm(`Voulez-vous vraiment quitter "${group?.name}" ?`);
    if (!confirmed) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      const newMemberCount = (group?.memberCount || 1) - 1;
      
      if (newMemberCount === 0) {
        await deleteGroupCompletely();
        window.alert("Vous étiez le dernier membre, le groupe a été supprimé");
        router.replace("/(tabs)/Groupe");
        return;
      }

      await updateDoc(groupRef, {
        members: arrayRemove(currentUser.uid),
        memberCount: newMemberCount,
      });

      window.alert("Vous avez quitté le groupe");
      router.replace("/(tabs)/Groupe");
    } catch (error) {
      console.error("Error leaving group:", error);
      window.alert("Impossible de quitter le groupe");
    }
  };

  const deleteGroupCompletely = async () => {
    if (!groupId) return;

    try {
      const pollsQuery = query(
        collection(db, "polls"),
        where("groupId", "==", groupId)
      );
      const pollsSnapshot = await getDocs(pollsQuery);
      
      const deletePromises = pollsSnapshot.docs.map(pollDoc => 
        deleteDoc(doc(db, "polls", pollDoc.id))
      );
      await Promise.all(deletePromises);

      try {
        const messagesQuery = query(
          collection(db, "messages"),
          where("groupId", "==", groupId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        const deleteMessagesPromises = messagesSnapshot.docs.map(msgDoc => 
          deleteDoc(doc(db, "messages", msgDoc.id))
        );
        await Promise.all(deleteMessagesPromises);
      } catch (error) {
        console.log("No messages to delete");
      }

      // Supprimer les activités du groupe
      try {
        const activitiesQuery = query(
          collection(db, "groupActivities"),
          where("groupId", "==", groupId)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        const deleteActivitiesPromises = activitiesSnapshot.docs.map(activityDoc => 
          deleteDoc(doc(db, "groupActivities", activityDoc.id))
        );
        await Promise.all(deleteActivitiesPromises);
      } catch (error) {
        console.log("No group activities to delete");
      }

      await deleteDoc(doc(db, "groups", groupId));
      
      console.log("✅ Group and all related data deleted");
    } catch (error) {
      console.error("Error deleting group completely:", error);
      throw error;
    }
  };

  const deleteGroup = async () => {
    if (!groupId) return;

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${group?.name}" ? Cette action est irréversible et supprimera tous les sondages et messages associés.`
    );
    if (!confirmed) return;

    try {
      await deleteGroupCompletely();
      window.alert("Groupe et toutes les données associées supprimés");
      router.replace("/(tabs)/Groupe");
    } catch (error) {
      console.error("Error deleting group:", error);
      window.alert("Impossible de supprimer le groupe complètement");
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
        </View>
      </LinearGradient>
    );
  }

  if (!group) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Groupe introuvable</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* GROUP INFO CARD */}
        <View style={styles.groupCard}>
          <View style={styles.groupAvatar}>
            <Text style={styles.groupEmoji}>{group.emoji}</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupMembers}>
            {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
          </Text>
          {isCreator && (
            <View style={styles.creatorBadge}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.creatorBadgeText}>Créateur</Text>
            </View>
          )}
        </View>

        {/* MEMBERS LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
          <View style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.username}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                {member.id === group.createdBy && (
                  <Icon name="star" size={16} color="#FFD700" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {/* Bouton Discussion */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openDiscussion}
            activeOpacity={0.7}
          >
            <Icon name="chatbubbles" size={20} color={COLORS.secondary} />
            <Text style={styles.actionButtonText}>Discussion du groupe</Text>
            <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Bouton Modifier (si créateur) */}
          {isCreator && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openEditGroup}
              activeOpacity={0.7}
            >
              <Icon name="settings" size={20} color={COLORS.secondary} />
              <Text style={styles.actionButtonText}>Modifier le groupe</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Bouton Quitter le groupe */}
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => {
              console.log("🔴 BOUTON QUITTER CLIQUÉ");
              leaveGroup();
            }}
          >
            <Icon name="exit" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              Quitter le groupe
            </Text>
            <Icon name="chevron-forward" size={20} color={COLORS.error} />
          </TouchableOpacity>

          {/* Bouton Supprimer (si créateur) */}
          {isCreator && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                console.log("🔴 BOUTON SUPPRIMER CLIQUÉ");
                deleteGroup();
              }}
            >
              <Icon name="trash" size={20} color={COLORS.error} />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Supprimer le groupe
              </Text>
              <Icon name="chevron-forward" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  errorText: {
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
  groupCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  groupEmoji: {
    fontSize: 48,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  groupMembers: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  creatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  creatorBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
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
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  memberEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  dangerButton: {
    borderColor: COLORS.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  dangerText: {
    color: COLORS.error,
  },
});