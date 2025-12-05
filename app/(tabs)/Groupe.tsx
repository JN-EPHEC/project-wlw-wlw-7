import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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

interface Group {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
  lastActivity: string;
  members: string[];
}

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    // Filtrer les groupes en fonction de la recherche
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  const loadGroups = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("members", "array-contains", currentUser.uid));
      
      const snapshot = await getDocs(q);
      const groupsList: Group[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        emoji: doc.data().emoji,
        memberCount: doc.data().memberCount || doc.data().members?.length || 0,
        lastActivity: doc.data().lastActivity || "Aucune activité",
        members: doc.data().members || [],
      }));

      setGroups(groupsList);
      setFilteredGroups(groupsList);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const openGroup = (groupId: string) => {
    (router as any).push(`/Groupe/${groupId}`);
  };

  const createGroup = () => {
    (router as any).push("/Groupe/Crea_groupe");
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Groupe</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="heart" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={createGroup}>
              <Icon name="add" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un groupe"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* GROUPS LIST */}
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "Aucun groupe trouvé" : "Aucun groupe"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Essayez une autre recherche"
                : "Créez votre premier groupe pour commencer !"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.createButtonWrapper} onPress={createGroup}>
                <LinearGradient
                  colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createButton}
                >
                  <Icon name="add" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.createButtonText}>Créer un groupe</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.groupsList}>
            {filteredGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => openGroup(group.id)}
              >
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupEmoji}>{group.emoji}</Text>
                </View>

                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupName}>{group.name}</Text>
                  </View>
                  <Text style={styles.groupMembers}>
                    {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.groupActivity}>
                    Dernier sondage : "{group.lastActivity}"
                  </Text>
                </View>

                <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.titleGradientStart,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  createButtonWrapper: {
    marginTop: 24,
    borderRadius: 999,
    overflow: "hidden",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  groupEmoji: {
    fontSize: 28,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  groupMembers: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  groupActivity: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});