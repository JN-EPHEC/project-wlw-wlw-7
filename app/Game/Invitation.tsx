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
  joinGame,
  leaveGame,
  Player,
  startGame,
  subscribeToGame,
} from "../../service/TruthOrDareService";

type LobbyMode = "choice" | "create" | "join" | "waiting";

export default function Lobby() {
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<LobbyMode>("choice");
  const [gameCode, setGameCode] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Créer une nouvelle partie - ✅ MODIFIÉ (plus besoin de playerName)
  const handleCreateGame = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    setLoading(true);
    try {
      const newGameId = await createGame(user.uid); // ✅ Plus de playerName
      setGameId(newGameId);
      setMode("waiting");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la partie");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre une partie existante - ✅ MODIFIÉ (plus besoin de playerName)
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
        user.uid // ✅ Plus de playerName
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
        {/* MODE: Choix initial - ✅ SIMPLIFIÉ (plus d'input pseudo) */}
        {mode === "choice" && (
          <>
            <Text style={styles.title}>Comment veux-tu jouer ?</Text>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode("create")}
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
              <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
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
              <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </>
        )}

        {/* MODE: Créer une partie */}
        {mode === "create" && (
          <>
            <Text style={styles.title}>Créer une partie</Text>
            <Text style={styles.subtitle}>
              Un code sera généré pour inviter tes amis
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
                Partage ce code avec tes amis !
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