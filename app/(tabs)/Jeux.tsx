import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../Auth_context";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";
import { joinGame } from "../../service/TruthOrDareService";

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: string[];
  minPlayers: number;
  isPremium: boolean;
  category: string;
}

const GAMES: Game[] = [
  {
    id: "action-verite",
    name: "Action ou Vérité",
    description: "Défis et vérités à partager en groupe !",
    icon: "game-controller",
    colors: ["#9D4EDD", "#7B2CBF"],
    minPlayers: 2,
    isPremium: false,
    category: "Party",
  },
  {
    id: "undercover",
    name: "Undercover",
    description: "Devine qui ment dans ton groupe !",
    icon: "eye-off",
    colors: ["#EF4444", "#DC2626"],
    minPlayers: 4,
    isPremium: true,
    category: "Enquête",
  },
  {
    id: "loup-garou",
    name: "Loup-Garou",
    description: "Le classique jeu de rôle entre amis !",
    icon: "moon",
    colors: ["#6366F1", "#8B5CF6"],
    minPlayers: 6,
    isPremium: true,
    category: "Mystère",
  },
  {
    id: "qui-suis-je",
    name: "Qui suis-je ?",
    description: "Devine le personnage avec des questions !",
    icon: "help-circle",
    colors: ["#F59E0B", "#D97706"],
    minPlayers: 2,
    isPremium: false,
    category: "Devinette",
  },
  {
    id: "time-bomb",
    name: "Time Bomb",
    description: "Désamorce la bombe avant qu'il ne soit trop tard !",
    icon: "alarm",
    colors: ["#EF4444", "#B91C1C"],
    minPlayers: 4,
    isPremium: true,
    category: "Action",
  },
  {
    id: "blind-test",
    name: "Blind Test",
    description: "Qui reconnaîtra la chanson en premier ?",
    icon: "musical-notes",
    colors: ["#10B981", "#059669"],
    minPlayers: 2,
    isPremium: false,
    category: "Musical",
  },
  {
    id: "pictionary",
    name: "Pictionary",
    description: "Dessine et fais deviner des mots !",
    icon: "brush",
    colors: ["#06B6D4", "#0891B2"],
    minPlayers: 4,
    isPremium: true,
    category: "Créatif",
  },
  {
    id: "mots-interdits",
    name: "Mots Interdits",
    description: "Fais deviner sans utiliser les mots interdits !",
    icon: "chatbubbles",
    colors: ["#8B5CF6", "#7C3AED"],
    minPlayers: 4,
    isPremium: false,
    category: "Vocabulaire",
  },
  {
    id: "mimic",
    name: "Mimic",
    description: "Mime et fais deviner à ton équipe !",
    icon: "body",
    colors: ["#F97316", "#EA580C"],
    minPlayers: 4,
    isPremium: true,
    category: "Mime",
  },
  {
    id: "quiz-culture",
    name: "Quiz Culture",
    description: "Teste ta culture générale entre amis !",
    icon: "school",
    colors: ["#3B82F6", "#2563EB"],
    minPlayers: 2,
    isPremium: false,
    category: "Culture",
  },
];

export default function JeuxScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filteredGames, setFilteredGames] = useState<Game[]>(GAMES);

  const isPremium = userProfile?.isPremium || false;

  useEffect(() => {
    loadFavoriteGames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeFilter, showFavorites, favoriteGames]);

  const loadFavoriteGames = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "userFavoriteGames", currentUser.uid));
      if (userDoc.exists()) {
        setFavoriteGames(userDoc.data().favorites || []);
      }
    } catch (error) {
      console.error("Error loading favorite games:", error);
    }
  };

  const toggleFavorite = async (gameId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userFavRef = doc(db, "userFavoriteGames", currentUser.uid);
      const isFavorite = favoriteGames.includes(gameId);

      if (isFavorite) {
        await updateDoc(userFavRef, {
          favorites: arrayRemove(gameId)
        });
        setFavoriteGames(prev => prev.filter(id => id !== gameId));
      } else {
        const userFavDoc = await getDoc(userFavRef);
        
        if (userFavDoc.exists()) {
          await updateDoc(userFavRef, {
            favorites: arrayUnion(gameId)
          });
        } else {
          await setDoc(userFavRef, {
            favorites: [gameId]
          });
        }
        
        setFavoriteGames(prev => [...prev, gameId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Erreur", "Impossible de gérer les favoris");
    }
  };

  const applyFilters = () => {
    let filtered = [...GAMES];

    // Filtre : Favoris uniquement
    if (showFavorites) {
      filtered = filtered.filter(game => favoriteGames.includes(game.id));
    }

    // Filtre : Recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre : Type de jeux
    if (!showFavorites) {
      if (activeFilter === "free") {
        filtered = filtered.filter(game => !game.isPremium);
      } else if (activeFilter === "premium") {
        filtered = filtered.filter(game => game.isPremium);
      }
    }

    setFilteredGames(filtered);
  };

  const handleJoinWithCode = async () => {
    if (!user) {
      Alert.alert("Erreur", "Tu dois être connecté pour rejoindre une partie");
      return;
    }

    if (!gameCode.trim()) {
      Alert.alert("Erreur", "Entre le code de la partie");
      return;
    }

    if (!userProfile?.displayName) {
      Alert.alert("Erreur", "Ton profil doit avoir un nom d'utilisateur");
      return;
    }

    setLoading(true);
    try {
      const joinedGameId = await joinGame(
        gameCode.trim().toUpperCase(),
        user.uid,
        userProfile.displayName
      );

      if (joinedGameId) {
        setShowJoinModal(false);
        setGameCode("");
        router.push(`/Game/Invitation?gameId=${joinedGameId}&mode=waiting`);
      } else {
        Alert.alert("Erreur", "Partie introuvable ou déjà commencée");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de rejoindre la partie");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGamePress = (game: Game) => {
  if (game.isPremium && !isPremium) {
    Alert.alert(
      "Premium requis",
      `${game.name} est réservé aux membres Premium. Passe à Premium pour débloquer tous les jeux !`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Découvrir Premium", onPress: () => router.push("./Profile/Abo_choix") }
      ]
    );
  } else {
    // Navigation vers la description du jeu avec TOUS les paramètres
    router.push({
      pathname: "/Game/Description_jeu",
      params: { 
        gameId: game.id,
        gameName: game.name,
        gameDescription: game.description,
        gameIcon: game.icon,
        gameColors: JSON.stringify(game.colors),
        gameMinPlayers: game.minPlayers.toString(),
        gameCategory: game.category,
        gameIsPremium: game.isPremium.toString()
      }
    });
  }
};
  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER STICKY */}
      <View style={styles.stickyHeader}>
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
            <Text style={styles.appTitle}>Jeux</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.iconCircle}
                onPress={() => setShowFavorites(true)}
              >
                <Icon name="heart-outline" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconCircle}
                onPress={() => setShowJoinModal(true)}
              >
                <Icon name="enter" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showFavorites && (
          <View style={styles.favoritesCount}>
            <Text style={styles.favoritesCountText}>
              {favoriteGames.length} {favoriteGames.length > 1 ? "jeux" : "jeu"}
            </Text>
          </View>
        )}

        {/* BARRE DE RECHERCHE */}
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            placeholder={showFavorites ? "Rechercher dans mes favoris" : "Rechercher un jeu"}
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTRES */}
        {!showFavorites && (
          <View style={styles.filters}>
            <TouchableOpacity 
              style={[styles.chip, activeFilter === "all" && styles.chipActive]}
              onPress={() => setActiveFilter("all")}
            >
              <Text style={[styles.chipText, activeFilter === "all" && styles.chipTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chip, activeFilter === "free" && styles.chipActive]}
              onPress={() => setActiveFilter("free")}
            >
              <Text style={[styles.chipText, activeFilter === "free" && styles.chipTextActive]}>
                Gratuit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chip, activeFilter === "premium" && styles.chipActive]}
              onPress={() => setActiveFilter("premium")}
            >
              <Icon name="diamond" size={12} color={activeFilter === "premium" ? COLORS.textPrimary : COLORS.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.chipText, activeFilter === "premium" && styles.chipTextActive]}>
                Premium
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTENU SCROLLABLE */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!showFavorites && (
          <>
            <Text style={styles.pageTitle}>Jeux entre amis</Text>
            <Text style={styles.pageSubtitle}>
              Amuse-toi avec ton groupe grâce à nos mini-jeux exclusifs !
            </Text>
          </>
        )}

        {/* LISTE DES JEUX */}
        {filteredGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon 
              name={showFavorites ? "heart-dislike-outline" : "sad-outline"} 
              size={64} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.emptyText}>
              {showFavorites 
                ? "Aucun jeu en favoris"
                : "Aucun jeu trouvé"}
            </Text>
            <Text style={styles.emptySubtext}>
              {showFavorites
                ? "Ajoute des jeux à tes favoris en cliquant sur ❤️"
                : "Essaie de modifier tes filtres"}
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filteredGames.map((game) => {
              const isFavorite = favoriteGames.includes(game.id);
              
              return (
                <TouchableOpacity
                  key={game.id}
                  style={styles.card}
                  onPress={() => handleGamePress(game)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={game.colors as [string, string, ...string[]]}
                    style={styles.cardImage}
                  >
                    <Icon name={game.icon} size={48} color={COLORS.textPrimary} />
                    <Text style={styles.cardImageTitle}>{game.name}</Text>
                  </LinearGradient>

                  <TouchableOpacity 
                    style={styles.cardHeart}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(game.id);
                    }}
                  >
                    <Icon 
                      name={isFavorite ? "heart" : "heart-outline"} 
                      size={20} 
                      color={isFavorite ? COLORS.error : COLORS.textPrimary} 
                    />
                  </TouchableOpacity>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardDescription}>
                      {game.description}
                    </Text>

                    <View style={styles.cardMeta}>
                      <View style={styles.cardMetaItem}>
                        <Icon name="people" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.cardMetaText}>{game.minPlayers}+ joueurs</Text>
                      </View>
                      <View style={styles.cardMetaItem}>
                        <Icon name="pricetag" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.cardMetaText}>{game.category}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      {game.isPremium ? (
                        <View style={[styles.badge, styles.badgePremium]}>
                          <Icon name="diamond" size={12} color="#FFD700" />
                          <Text style={styles.badgeTextPremium}>Premium</Text>
                        </View>
                      ) : (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Gratuit</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal Rejoindre avec code */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rejoindre une partie</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Entre le code de la partie pour rejoindre tes amis
            </Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="CODE"
                placeholderTextColor={COLORS.textSecondary}
                value={gameCode}
                onChangeText={(text) => setGameCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.joinButton, loading && styles.joinButtonDisabled]}
              onPress={handleJoinWithCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <>
                  <Icon name="enter" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.joinButtonText}>Rejoindre</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 16,
    backgroundColor: COLORS.backgroundTop,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
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
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  favoritesCount: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
  },
  favoritesCountText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  filters: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1B3D",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#2A1B3D",
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    margin: 12,
    borderRadius: 18,
  },
  cardImageTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  cardHeart: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  cardMeta: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  cardFooter: {
    alignItems: "center",
  },
  badge: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textSecondary,
  },
  badgePremium: {
    borderColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeTextPremium: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#FFD700",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  codeInputContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  codeInput: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 200,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.titleGradientStart,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});