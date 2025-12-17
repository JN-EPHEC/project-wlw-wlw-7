import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

type Activity = {
  id: string;
  type: 'game' | 'activity' | 'challenge';
  title: string;
  description: string;
  date: Date;
  timestamp: string;
  participants: string[]; // IDs des participants
  participantsCount: number;
  winnerId?: string;
  duration?: number; // en minutes
  gameType?: string; // 'truthOrDare', 'quiz', etc.
  groupId?: string;
  groupName?: string;
};

type UserInfo = {
  id: string;
  username: string;
  displayName: string;
};

export default function ActivityHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'games' | 'activities'>('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<Record<string, UserInfo>>({});

  useEffect(() => {
    loadActivityHistory();
  }, []);

  const loadActivityHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);

      // 1. Charger l'historique des parties (truthOrDareGames)
      const gamesQuery = query(
        collection(db, "truthOrDareGames"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "desc"),
        orderBy("endedAt", "desc")
      );

      const gamesSnapshot = await getDocs(gamesQuery);
      
      const gamesData: Activity[] = [];
      const userIds = new Set<string>();

      gamesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.endedAt) { // Seulement les parties terminées
          gamesData.push({
            id: docSnap.id,
            type: 'game',
            title: getGameTitle(data.gameType),
            description: `Partie avec ${data.participants.length} participant(s)`,
            date: data.endedAt.toDate(),
            timestamp: formatDate(data.endedAt.toDate()),
            participants: data.participants || [],
            participantsCount: data.participants?.length || 0,
            winnerId: data.winnerId,
            duration: calculateDuration(data.createdAt?.toDate(), data.endedAt?.toDate()),
            gameType: data.gameType,
            groupId: data.groupId,
            groupName: data.groupName,
          });

          // Collecter tous les IDs d'utilisateurs
          data.participants?.forEach((id: string) => userIds.add(id));
          if (data.winnerId) userIds.add(data.winnerId);
        }
      });

      // 2. Charger les activités (groupActivities)
      const activitiesQuery = query(
        collection(db, "groupActivities"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      const activitiesData: Activity[] = [];

      activitiesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        activitiesData.push({
          id: docSnap.id,
          type: 'activity',
          title: data.title || "Activité de groupe",
          description: data.description || "",
          date: data.createdAt.toDate(),
          timestamp: formatDate(data.createdAt.toDate()),
          participants: data.participants || [],
          participantsCount: data.participants?.length || 0,
          duration: data.duration,
          groupId: data.groupId,
          groupName: data.groupName,
        });

        // Collecter tous les IDs d'utilisateurs
        data.participants?.forEach((id: string) => userIds.add(id));
      });

      // 3. Charger les challenges (userChallenges)
      const challengesQuery = query(
        collection(db, "userChallenges"),
        where("userId", "==", user.uid),
        where("completed", "==", true),
        orderBy("completedAt", "desc")
      );

      const challengesSnapshot = await getDocs(challengesQuery);
      
      const challengesData: Activity[] = [];

      challengesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        challengesData.push({
          id: docSnap.id,
          type: 'challenge',
          title: data.challengeName || "Challenge",
          description: data.description || "",
          date: data.completedAt.toDate(),
          timestamp: formatDate(data.completedAt.toDate()),
          participants: [user.uid],
          participantsCount: 1,
          winnerId: user.uid,
        });
      });

      // 4. Combiner et trier toutes les activités
      const allActivities = [...gamesData, ...activitiesData, ...challengesData]
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      // 5. Charger les infos des utilisateurs
      const usersInfo: Record<string, UserInfo> = {};
      const userIdsArray = Array.from(userIds);

      for (const userId of userIdsArray) {
        if (userId !== user.uid) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            usersInfo[userId] = {
              id: userId,
              username: userData.username || "",
              displayName: userData.displayName || userData.username || "Utilisateur",
            };
          }
        }
      }

      // Ajouter l'utilisateur courant
      usersInfo[user.uid] = {
        id: user.uid,
        username: user.displayName || "Vous",
        displayName: user.displayName || "Vous",
      };

      setActivities(allActivities);
      setUserInfo(usersInfo);
    } catch (error) {
      console.error("Error loading activity history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGameTitle = (gameType?: string): string => {
    switch (gameType) {
      case 'truthOrDare':
        return 'Action ou Vérité';
      case 'quiz':
        return 'Quiz';
      case 'pictionary':
        return 'Pictionary';
      case 'charades':
        return 'Charades';
      default:
        return 'Jeu';
    }
  };

  const calculateDuration = (start?: Date, end?: Date): number | undefined => {
    if (!start || !end) return undefined;
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60)); // Convertir en minutes
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getParticipantsNames = (participants: string[]): string => {
    const currentUserId = auth.currentUser?.uid;
    const otherParticipants = participants
      .filter(id => id !== currentUserId)
      .slice(0, 2); // Prendre maximum 2 autres participants
    
    const names = otherParticipants.map(id => {
      const user = userInfo[id];
      return user?.displayName || "Utilisateur";
    });

    if (names.length === 0) {
      return "Vous seul(e)";
    } else if (names.length === 1) {
      return `${names[0]}`;
    } else if (names.length === 2 && participants.length === 3) {
      return `${names[0]} et ${names[1]}`;
    } else {
      return `${names[0]}, ${names[1]} et ${participants.length - 3} autre(s)`;
    }
  };

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'game':
        return { icon: 'game-controller', color: '#6366F1' };
      case 'activity':
        return { icon: 'people', color: '#10B981' };
      case 'challenge':
        return { icon: 'trophy', color: '#F59E0B' };
      default:
        return { icon: 'time', color: COLORS.textSecondary };
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'games') return activity.type === 'game';
    if (selectedFilter === 'activities') return activity.type === 'activity' || activity.type === 'challenge';
    return true;
  });

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const currentUserId = auth.currentUser?.uid;
    const isWinner = item.winnerId === currentUserId;
    const iconInfo = getActivityIcon(item);
    
    return (
      <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
        <View style={styles.activityHeader}>
          <View style={[styles.activityIcon, { backgroundColor: `${iconInfo.color}20` }]}>
            <Icon name={iconInfo.icon} size={24} color={iconInfo.color} />
          </View>
          
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activityDescription}>
              {item.groupName 
                ? `${item.description} • Groupe ${item.groupName}`
                : item.description
              }
            </Text>
            <View style={styles.activityMeta}>
              <View style={styles.metaItem}>
                <Icon name="people" size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>
                  {getParticipantsNames(item.participants)}
                </Text>
              </View>
              
              {item.duration && (
                <View style={styles.metaItem}>
                  <Icon name="time" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>{item.duration} min</Text>
                </View>
              )}
            </View>
          </View>
          
          {item.type === 'game' && (
            <View style={[
              styles.resultBadge,
              isWinner ? styles.winnerBadge : styles.loserBadge
            ]}>
              <Icon 
                name={isWinner ? "trophy" : "close"} 
                size={16} 
                color={isWinner ? "#FFD700" : COLORS.textSecondary} 
              />
            </View>
          )}
        </View>
        
        <View style={styles.activityFooter}>
          <View style={styles.dateBadge}>
            <Icon name="calendar" size={12} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>{item.timestamp}</Text>
          </View>
          
          <View style={[styles.typeBadge, { backgroundColor: `${iconInfo.color}20` }]}>
            <Text style={[styles.typeText, { color: iconInfo.color }]}>
              {item.type === 'game' ? 'Jeu' : 
               item.type === 'activity' ? 'Activité' : 'Challenge'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name="time-outline" size={64} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Aucune activité récente</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'games' 
          ? "Vous n'avez pas encore joué à des jeux. Lancez une partie !"
          : selectedFilter === 'activities'
          ? "Vous n'avez pas encore participé à des activités de groupe."
          : "Votre historique d'activités apparaîtra ici."
        }
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push("/(tabs)/Home")}
      >
        <Text style={styles.exploreButtonText}>Découvrir les jeux</Text>
      </TouchableOpacity>
    </View>
  );

  const getStats = () => {
    const total = activities.length;
    const wins = activities.filter(a => a.winnerId === auth.currentUser?.uid).length;
    const totalParticipants = activities.reduce((sum, activity) => 
      sum + activity.participantsCount, 0
    );
    
    return { total, wins, totalParticipants };
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de l'historique...</Text>
      </LinearGradient>
    );
  }

  const stats = getStats();

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadActivityHistory}
          disabled={loading}
        >
          <Icon name="refresh" size={20} color={loading ? COLORS.textSecondary : COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* FILTRES */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === 'all' && styles.filterTextActive
          ]}>
            Tous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'games' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('games')}
        >
          <View style={styles.filterIcon}>
            <Icon 
              name="game-controller" 
              size={16} 
              color={selectedFilter === 'games' ? '#6366F1' : COLORS.textSecondary} 
            />
          </View>
          <Text style={[
            styles.filterText,
            selectedFilter === 'games' && styles.filterTextActive
          ]}>
            Jeux
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'activities' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('activities')}
        >
          <View style={styles.filterIcon}>
            <Icon 
              name="trophy" 
              size={16} 
              color={selectedFilter === 'activities' ? '#10B981' : COLORS.textSecondary} 
            />
          </View>
          <Text style={[
            styles.filterText,
            selectedFilter === 'activities' && styles.filterTextActive
          ]}>
            Activités
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* STATISTIQUES */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.wins}</Text>
          <Text style={styles.statLabel}>Victoires</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalParticipants}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
      </View>

      {/* LISTE DES ACTIVITÉS */}
      <FlatList
        data={filteredActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.activitiesList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadActivityHistory}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Activités récentes</Text>
            <Text style={styles.listSubtitle}>
              {filteredActivities.length} activité{filteredActivities.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.backgroundTop,
    borderColor: COLORS.primary,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  activitiesList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  activityCard: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  winnerBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderColor: "#FFD700",
  },
  loserBadge: {
    backgroundColor: COLORS.backgroundTop,
    borderColor: COLORS.border,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundTop,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});