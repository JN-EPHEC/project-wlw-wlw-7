import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadGroups();
    loadFavoriteGroups();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, groups, showFavorites, favoriteGroups]);

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

  const loadFavoriteGroups = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "userFavoriteGroups", currentUser.uid));
      if (userDoc.exists()) {
        setFavoriteGroups(userDoc.data().favoriteGroups || []);
      }
    } catch (error) {
      console.error("Error loading favorite groups:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...groups];

    // Filtre : Favoris uniquement
    if (showFavorites) {
      filtered = filtered.filter(group => favoriteGroups.includes(group.id));
    }

    // Filtre : Recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGroups(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
    loadFavoriteGroups();
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
        {/* HEADER */}
        {showFavorites ? (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowFavorites(false)}
            >
              <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.favoritesHeader}>
              <Icon name="heart" size={28} color={COLORS.error} />
              <Text style={styles.favoritesTitle}>Mes Favoris</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        ) : (
          <View style={styles.header}>
            <Text style={styles.appTitle}>Groupes</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowFavorites(true)}
              >
                <Icon name="heart-outline" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.createIconButton} onPress={createGroup}>
                <LinearGradient
                  colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                  style={styles.createIconGradient}
                >
                  <Icon name="add" size={24} color={COLORS.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={showFavorites ? "Rechercher dans mes favoris" : "Chercher un groupe"}
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
            <View style={styles.emptyIconContainer}>
              <Icon 
                name={showFavorites ? "heart-dislike-outline" : "people-outline"} 
                size={64} 
                color={COLORS.textSecondary} 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {showFavorites 
                ? "Aucun groupe favori"
                : searchQuery 
                  ? "Aucun groupe trouvé" 
                  : "Aucun groupe"}
            </Text>
            <Text style={styles.emptyText}>
              {showFavorites
                ? "Ajoutez des groupes à vos favoris"
                : searchQuery
                  ? "Essayez une autre recherche"
                  : "Créez votre premier groupe pour commencer !"}
            </Text>
            {!searchQuery && !showFavorites && (
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
              const isFavorite = favoriteGroups.includes(group.id);

              return (
                <TouchableOpacity
                  key={group.id}
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
                        {isCreator && (
                          <View style={styles.creatorBadge}>
                            <Icon name="crown" size={12} color="#FFD700" />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.groupMetaContainer}>
                        <View style={styles.groupMeta}>
                          <Icon name="people" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.groupMembers}>
                            {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.groupActivity} numberOfLines={1}>
                        {group.lastActivity}
                      </Text>
                    </View>

                    <View style={styles.groupArrow}>
                      <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
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
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  favoritesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  favoritesTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.neutralGray800,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
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
    gap: 16,
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
    gap: 8,
    marginBottom: 6,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
    flex: 1,
  },
  creatorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  groupMetaContainer: {
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  groupArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutralGray800,
    justifyContent: "center",
    alignItems: "center",
  },
});