// Invitation.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../Auth_context";
import { COLORS } from "../../components/Colors";
import {
  createGame,
  Game,
  GameType,
  joinGame,
  leaveGame,
  Player,
  startGame,
  subscribeToGame,
} from "../../service/TruthOrDareService";

type LobbyMode = "choice" | "selectType" | "create" | "join" | "waiting";

export default function Invitation() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [mode, setMode] = useState<LobbyMode>("choice");
  const [selectedGameType, setSelectedGameType] = useState<GameType>("base");
  const [gameCode, setGameCode] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Récupérer le statut premium depuis le profil utilisateur
const isPremium = userProfile?.isPremium || false;


  // Écouter les changements de la partie en temps réel
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      setGame(updatedGame);

      // Si la partie commence, naviguer vers l'écran de jeu
      if (updatedGame?.status === "playing") {
        router.replace(`/Game/TruthOrDare/TruthOrDareGame?gameId=${gameId}`);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  // ✅ Gérer la sélection d'un type de jeu
  const handleSelectGameType = (type: GameType) => {
    // Si ce n'est pas premium et qu'on sélectionne spicy ou jury
    if (!isPremium && (type === "spicy" || type === "jury")) {
      Alert.alert(
        "Version Premium requise 👑",
        `La version ${type === "spicy" ? "Spicy 🌶️" : "Jury 👨‍⚖️"} est réservée aux membres premium.`,
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Voir Premium",
            onPress: () => {
              // ✅ TODO: Naviguer vers la page d'abonnement
              router.push("../Profile/Abo_choix"); // Remplace par ta vraie route
            },
          },
        ]
      );
      return;
    }

    setSelectedGameType(type);
    setMode("create");
  };

  // Créer une nouvelle partie avec le type sélectionné
  const handleCreateGame = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    setLoading(true);
    try {
      const newGameId = await createGame(user.uid, selectedGameType); // ✅ Passer le gameType
      setGameId(newGameId);
      setMode("waiting");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la partie");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre une partie existante
  const handleJoinGame = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }
    if (!gameCode.trim()) {
      Alert.alert("Erreur", "Entre le code de la partie");
      return;
    }

    setLoading(true);
    try {
      const joinedGameId = await joinGame(
        gameCode.trim().toUpperCase(),
        user.uid
      );

      if (joinedGameId) {
        setGameId(joinedGameId);
        setMode("waiting");
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

  // Quitter la partie
  const handleLeaveGame = async () => {
    if (gameId && user) {
      await leaveGame(gameId, user.uid);
    }
    setGameId(null);
    setGame(null);
    setMode("choice");
  };

  // Lancer la partie (host uniquement)
  const handleStartGame = async () => {
    if (!gameId || !game) return;

    if (game.players.length < 2) {
      Alert.alert("Erreur", "Il faut au moins 2 joueurs pour commencer");
      return;
    }

    setLoading(true);
    try {
      await startGame(gameId);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de lancer la partie");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est l'hôte
  const isHost = game?.hostId === user?.uid;

  // Rendu d'un joueur dans la liste
  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerAvatar}>
        <Text style={styles.playerAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.playerName}>{item.name}</Text>
      {item.isHost && (
        <View style={styles.hostBadge}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={styles.hostBadgeText}>Hôte</Text>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (mode === "waiting") {
              handleLeaveGame();
            } else if (mode === "create") {
              setMode("selectType");
            } else if (mode === "selectType") {
              setMode("choice");
            } else if (mode !== "choice") {
              setMode("choice");
            } else {
              router.back();
            }
          }}
        >
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Action ou Vérité</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenu selon le mode */}
      <View style={styles.content}>
        {/* MODE: Choix initial */}
        {mode === "choice" && (
          <>
            <Text style={styles.title}>Comment veux-tu jouer ?</Text>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode("selectType")}
            >
              <View style={styles.optionIcon}>
                <Icon name="add-circle" size={32} color={COLORS.secondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Créer une partie</Text>
                <Text style={styles.optionDescription}>
                  Génère un code et invite tes amis
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode("join")}
            >
              <View style={styles.optionIcon}>
                <Icon name="enter" size={32} color={COLORS.secondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Rejoindre une partie</Text>
                <Text style={styles.optionDescription}>
                  Entre le code de ton ami
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </>
        )}

        {/* ✅ MODE: Sélection du type de jeu */}
        {mode === "selectType" && (
          <>
            <Text style={styles.title}>Choisis ta version</Text>
            <Text style={styles.subtitle}>
              Sélectionne le type de jeu que tu veux créer
            </Text>

            {/* Version Base - Gratuite */}
            <TouchableOpacity
              style={[
                styles.gameTypeCard,
                selectedGameType === "base" && styles.gameTypeCardSelected,
              ]}
              onPress={() => handleSelectGameType("base")}
            >
              <View style={styles.gameTypeHeader}>
                <View style={styles.gameTypeIcon}>
                  <Icon name="game-controller" size={28} color={COLORS.secondary} />
                </View>
                <View style={styles.gameTypeInfo}>
                  <Text style={styles.gameTypeTitle}>Classic</Text>
                  <Text style={styles.gameTypeDescription}>
                    Version gratuite pour tous
                  </Text>
                </View>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>GRATUIT</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Version Spicy - Premium */}
            <TouchableOpacity
              style={[
                styles.gameTypeCard,
                selectedGameType === "spicy" && styles.gameTypeCardSelected,
                !isPremium && styles.gameTypeCardLocked,
              ]}
              onPress={() => handleSelectGameType("spicy")}
            >
              <View style={styles.gameTypeHeader}>
                <View style={[styles.gameTypeIcon, styles.spicyIcon]}>
                  <Text style={styles.gameTypeEmoji}>🌶️</Text>
                </View>
                <View style={styles.gameTypeInfo}>
                  <Text style={styles.gameTypeTitle}>Spicy</Text>
                  <Text style={styles.gameTypeDescription}>
                    Questions osées et piquantes
                  </Text>
                </View>
                {!isPremium && (
                  <View style={styles.lockIcon}>
                    <Icon name="lock-closed" size={20} color={COLORS.secondary} />
                  </View>
                )}
              </View>
              {!isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="diamond" size={14} color={COLORS.secondary} />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Version Jury - Premium */}
            <TouchableOpacity
              style={[
                styles.gameTypeCard,
                selectedGameType === "jury" && styles.gameTypeCardSelected,
                !isPremium && styles.gameTypeCardLocked,
              ]}
              onPress={() => handleSelectGameType("jury")}
            >
              <View style={styles.gameTypeHeader}>
                <View style={[styles.gameTypeIcon, styles.juryIcon]}>
                  <Text style={styles.gameTypeEmoji}>👨‍⚖️</Text>
                </View>
                <View style={styles.gameTypeInfo}>
                  <Text style={styles.gameTypeTitle}>Jury</Text>
                  <Text style={styles.gameTypeDescription}>
                    Version spéciale présentation
                  </Text>
                </View>
                {!isPremium && (
                  <View style={styles.lockIcon}>
                    <Icon name="lock-closed" size={20} color={COLORS.secondary} />
                  </View>
                )}
              </View>
              {!isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="diamond" size={14} color={COLORS.secondary} />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* MODE: Créer une partie */}
        {mode === "create" && (
          <>
            <Text style={styles.title}>Créer une partie</Text>
            <Text style={styles.subtitle}>
              Version sélectionnée:{" "}
              {selectedGameType === "spicy"
                ? "🌶️ Spicy"
                : selectedGameType === "jury"
                ? "👨‍⚖️ Jury"
                : "Classic"}
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateGame}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <>
                  <Icon name="rocket" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.primaryButtonText}>Créer la partie</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* MODE: Rejoindre une partie */}
        {mode === "join" && (
          <>
            <Text style={styles.title}>Rejoindre une partie</Text>
            <Text style={styles.subtitle}>
              Entre le code donné par ton ami
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
              style={styles.primaryButton}
              onPress={handleJoinGame}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <>
                  <Icon name="enter" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.primaryButtonText}>Rejoindre</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* MODE: Salle d'attente */}
        {mode === "waiting" && game && (
          <>
            <Text style={styles.title}>Salle d'attente</Text>

            {/* Code de la partie */}
            <View style={styles.gameCodeContainer}>
              <Text style={styles.gameCodeLabel}>Code de la partie</Text>
              <Text style={styles.gameCode}>{game.gameCode}</Text>
              <Text style={styles.gameCodeHint}>
                Version:{" "}
                {game.gameType === "spicy"
                  ? "🌶️ Spicy"
                  : game.gameType === "jury"
                  ? "👨‍⚖️ Jury"
                  : "Classic"}
              </Text>
            </View>

            {/* Liste des joueurs */}
            <Text style={styles.playersTitle}>
              Joueurs ({game.players.length})
            </Text>

            <FlatList
              data={game.players}
              renderItem={renderPlayer}
              keyExtractor={(item) => item.oderId}
              style={styles.playersList}
              contentContainerStyle={styles.playersListContent}
            />

            {/* Bouton lancer (host uniquement) */}
            {isHost ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  game.players.length < 2 && styles.primaryButtonDisabled,
                ]}
                onPress={handleStartGame}
                disabled={loading || game.players.length < 2}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Icon name="play" size={24} color={COLORS.textPrimary} />
                    <Text style={styles.primaryButtonText}>
                      Lancer la partie
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingContainer}>
                <ActivityIndicator color={COLORS.secondary} />
                <Text style={styles.waitingText}>
                  En attente du lancement par l'hôte...
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </LinearGradient>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  // ✅ Styles pour les cartes de type de jeu
  gameTypeCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  gameTypeCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
  },
  gameTypeCardLocked: {
    opacity: 0.7,
  },
  gameTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  spicyIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  juryIcon: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  gameTypeEmoji: {
    fontSize: 28,
  },
  gameTypeInfo: {
    flex: 1,
  },
  gameTypeTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  gameTypeDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  freeBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  freeBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "#34C759",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 0, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
    alignSelf: "flex-start",
    gap: 6,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: COLORS.secondary,
  },
  lockIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  codeInputContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  codeInput: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 200,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.titleGradientStart,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  gameCodeContainer: {
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gameCodeLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  gameCode: {
    fontSize: 36,
    fontFamily: "Poppins-Bold",
    color: COLORS.secondary,
    letterSpacing: 6,
  },
  gameCodeHint: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  playersTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  playersList: {
    flex: 1,
    marginBottom: 16,
  },
  playersListContent: {
    gap: 8,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerAvatarText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.secondary,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
  },
  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  hostBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#FFD700",
  },
  waitingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
  },
  waitingText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
});