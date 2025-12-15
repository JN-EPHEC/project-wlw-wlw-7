import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
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
  createdBy: string;
}

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [pinnedGroups, setPinnedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroups();
    loadPinnedGroups();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, groups, pinnedGroups]);

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
        createdBy: doc.data().createdBy || "",
      }));

      setGroups(groupsList);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPinnedGroups = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "userPinnedGroups", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setPinnedGroups(userDoc.data().pinnedGroups || []);
      } else {
        await setDoc(userDocRef, {
          pinnedGroups: [],
        });
        setPinnedGroups([]);
      }
    } catch (error) {
      console.error("Error loading pinned groups:", error);
      setPinnedGroups([]);
    }
  };

  const togglePinGroup = async (groupId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "userPinnedGroups", currentUser.uid);
      const isPinned = pinnedGroups.includes(groupId);

      let updatedPinned: string[];
      if (isPinned) {
        updatedPinned = pinnedGroups.filter(id => id !== groupId);
      } else {
        updatedPinned = [...pinnedGroups, groupId];
      }

      await setDoc(userDocRef, {
        pinnedGroups: updatedPinned,
      }, { merge: true });

      setPinnedGroups(updatedPinned);
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...groups];

    if (searchQuery.trim()) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aIsPinned = pinnedGroups.includes(a.id);
      const bIsPinned = pinnedGroups.includes(b.id);
      
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });

    setFilteredGroups(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
    loadPinnedGroups();
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>Groupes</Text>
          <TouchableOpacity style={styles.createIconButton} onPress={createGroup}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.createIconGradient}
            >
              <Icon name="add" size={24} color={COLORS.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

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

        {filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon 
                name={searchQuery ? "search-outline" : "people-outline"} 
                size={64} 
                color={COLORS.textSecondary} 
              />
            </View>
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
                  <Icon name="add-circle-outline" size={22} color={COLORS.textPrimary} />
                  <Text style={styles.createButtonText}>Créer un groupe</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.groupsList}>
            {filteredGroups.map((group) => {
              const currentUser = auth.currentUser;
              const isCreator = group.createdBy === currentUser?.uid;
              const isPinned = pinnedGroups.includes(group.id);

              return (
                <View key={group.id} style={styles.groupCardWrapper}>
                  <TouchableOpacity
                    style={styles.groupCard}
                    onPress={() => openGroup(group.id)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={["rgba(99, 102, 241, 0.1)", "rgba(139, 92, 246, 0.1)"]}
                      style={styles.groupCardGradient}
                    >
                      <View style={styles.groupAvatar}>
                        <LinearGradient
                          colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                          style={styles.groupAvatarGradient}
                        >
                          <Text style={styles.groupEmoji}>{group.emoji}</Text>
                        </LinearGradient>
                      </View>

                      <View style={styles.groupInfo}>
                        <View style={styles.groupHeader}>
                          <Text style={styles.groupName} numberOfLines={1}>
                            {group.name}
                          </Text>
                          {isPinned && (
                            <View style={styles.pinnedBadge}>
                              <Icon name="pin" size={12} color={COLORS.secondary} />
                            </View>
                          )}
                          {isCreator && (
                            <View style={styles.crownBadge}>
                              <Icon name="crown" size={12} color="#FFD700" />
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.groupMeta}>
                          <Icon name="people" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.groupMembers}>
                            {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                          </Text>
                        </View>

                        <Text style={styles.groupActivity} numberOfLines={1}>
                          {group.lastActivity}
                        </Text>
                      </View>

                      <View style={styles.groupActions}>
                        <TouchableOpacity
                          style={[styles.pinButton, isPinned && styles.pinButtonActive]}
                          onPress={() => togglePinGroup(group.id)}
                          activeOpacity={0.7}
                        >
                          <Icon 
                            name={isPinned ? "pin" : "pin-outline"} 
                            size={20} 
                            color={isPinned ? COLORS.textPrimary : COLORS.textSecondary} 
                          />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            })}
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
    fontFamily: "Poppins-Medium",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
  },
  createIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  createIconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
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
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    alignItems: "baseline"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.neutralGray800,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
    fontFamily: "Poppins-Bold",
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
    fontFamily: "Poppins-Regular",
  },
  createButtonWrapper: {
    marginTop: 32,
    borderRadius: 999,
    overflow: "hidden",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
  },
  groupsList: {
    gap: 12,
  },
  groupCardWrapper: {
    marginBottom: 0,
  },
  groupCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  groupCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  groupAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
  },
  groupAvatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  groupEmoji: {
    fontSize: 32,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
    flex: 1,
  },
  pinnedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  crownBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  groupMembers: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  groupActivity: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    fontFamily: "Poppins-Regular",
  },
  groupActions: {
    justifyContent: "center",
    alignItems: "center",
  },
  pinButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
});