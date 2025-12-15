import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../../Auth_context";
import { COLORS } from "../../../components/Colors";
import { db } from "../../../firebase_Config";
import {
  Game,
  subscribeToGame,
} from "../../../service/TruthOrDareService";

// Listes de défis et vérités
const TRUTHS = [
  "Quel est ton plus grand secret ?",
  "Quelle est la chose la plus embarrassante que tu aies faite ?",
  "As-tu déjà menti à ton meilleur ami ? À propos de quoi ?",
  "Quel est ton crush actuel ou le dernier en date ?",
  "Quelle est ta plus grande peur ?",
  "Quel est le truc le plus fou que tu aies fait sans te faire prendre ?",
  "As-tu déjà stalké quelqu'un sur les réseaux ? Qui ?",
  "Quel est ton plus grand regret ?",
  "Quelle est la chose la plus bizarre que tu fais quand tu es seul(e) ?",
  "As-tu déjà eu des sentiments pour quelqu'un ici ?",
  "Quel est le mensonge le plus gros que tu aies dit à tes parents ?",
  "C'est quoi ton guilty pleasure musical ?",
  "Quelle est la dernière personne que tu as recherchée sur Instagram ?",
  "As-tu déjà triché à un examen ?",
  "Quel est ton plus gros défaut selon toi ?",
];

const DARES = [
  "Fais 10 pompes maintenant !",
  "Imite quelqu'un dans la pièce jusqu'à ce qu'on devine qui c'est",
  "Envoie un message bizarre à la 5ème personne de tes contacts",
  "Fais une déclaration d'amour à un objet de la pièce",
  "Danse pendant 30 secondes sans musique",
  "Parle avec un accent pendant les 3 prochains tours",
  "Fais un compliment à chaque personne présente",
  "Montre la dernière photo de ta galerie",
  "Fais le tour de la pièce en marchant comme un crabe",
  "Appelle quelqu'un et chante-lui joyeux anniversaire",
  "Garde les yeux fermés jusqu'au prochain tour",
  "Laisse quelqu'un écrire quelque chose sur ton front",
  "Fais 20 squats",
  "Raconte une blague (elle doit faire rire au moins une personne)",
  "Échange un vêtement avec quelqu'un pendant 2 tours",
];

export default function Playing() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);

  // Écouter les changements de la partie
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      setGame(updatedGame);
      setLoading(false);

      // Si la partie est terminée
      if (updatedGame?.status === "finished") {
        Alert.alert("Partie terminée", "La partie est terminée !", [
          { text: "OK", onPress: () => router.replace("/(tabs)/Jeux") },
        ]);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  // Obtenir le joueur actuel
  const currentPlayer = game?.players[game.currentPlayerIndex];
  const isMyTurn = currentPlayer?.oderId === user?.uid;
  const isHost = game?.hostId === user?.uid;

  // Choisir Action ou Vérité
  const handleChoice = async (type: "truth" | "dare") => {
    if (!gameId || !game || !currentPlayer) return;

    setChoosing(true);

    const challenges = type === "truth" ? TRUTHS : DARES;
    const randomChallenge =
      challenges[Math.floor(Math.random() * challenges.length)];

    try {
      await updateDoc(doc(db, "truthOrDareGames", gameId), {
        currentChallenge: {
          type,
          text: randomChallenge,
          assignedTo: currentPlayer.oderId,
        },
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de choisir");
      console.error(error);
    } finally {
      setChoosing(false);
    }
  };

  // Passer au joueur suivant
  const handleNext = async () => {
    if (!gameId || !game) return;

    const nextIndex = (game.currentPlayerIndex + 1) % game.players.length;

    try {
      await updateDoc(doc(db, "truthOrDareGames", gameId), {
        currentPlayerIndex: nextIndex,
        currentChallenge: null,
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de passer au suivant");
      console.error(error);
    }
  };

  // Terminer la partie
  const handleEndGame = () => {
    Alert.alert(
      "Terminer la partie",
      "Es-tu sûr de vouloir terminer la partie ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Terminer",
          style: "destructive",
          onPress: async () => {
            if (!gameId) return;
            await updateDoc(doc(db, "truthOrDareGames", gameId), {
              status: "finished",
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Chargement de la partie...</Text>
      </LinearGradient>
    );
  }

  if (!game) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Partie introuvable</Text>
        <TouchableOpacity
          style={styles.backToMenuButton}
          onPress={() => router.replace("/(tabs)/Jeux")}
        >
          <Text style={styles.backToMenuText}>Retour au menu</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Action ou Vérité</Text>
        {isHost && (
          <TouchableOpacity style={styles.endButton} onPress={handleEndGame}>
            <Icon name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Zone de jeu principale */}
      <View style={styles.gameArea}>
        {/* Indicateur du joueur actuel */}
        <View style={styles.currentPlayerContainer}>
          <Text style={styles.turnLabel}>C'est au tour de</Text>
          <View style={styles.currentPlayerBadge}>
            <Text style={styles.currentPlayerName}>{currentPlayer?.name}</Text>
          </View>
          {isMyTurn && (
            <Text style={styles.yourTurnText}>C'est à toi !</Text>
          )}
        </View>

        {/* Affichage du défi/vérité OU boutons de choix */}
        {game.currentChallenge ? (
          // Un défi a été choisi
          <View style={styles.challengeContainer}>
            <View
              style={[
                styles.challengeTypeTag,
                game.currentChallenge.type === "truth"
                  ? styles.truthTag
                  : styles.dareTag,
              ]}
            >
              <Icon
                name={
                  game.currentChallenge.type === "truth"
                    ? "chatbubble-ellipses"
                    : "flash"
                }
                size={20}
                color={COLORS.textPrimary}
              />
              <Text style={styles.challengeTypeText}>
                {game.currentChallenge.type === "truth" ? "Vérité" : "Action"}
              </Text>
            </View>

            <Text style={styles.challengeText}>
              {game.currentChallenge.text}
            </Text>

            {/* Bouton suivant (visible par tous) */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Suivant</Text>
              <Icon name="arrow-forward" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          // Pas encore de défi - afficher les boutons de choix
          <View style={styles.choiceContainer}>
            {isMyTurn ? (
              <>
                <Text style={styles.chooseText}>Choisis ton destin !</Text>

                <View style={styles.choiceButtons}>
                  <TouchableOpacity
                    style={[styles.choiceButton, styles.truthButton]}
                    onPress={() => handleChoice("truth")}
                    disabled={choosing}
                  >
                    {choosing ? (
                      <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                      <>
                        <Icon
                          name="chatbubble-ellipses"
                          size={32}
                          color={COLORS.textPrimary}
                        />
                        <Text style={styles.choiceButtonText}>Vérité</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.choiceButton, styles.dareButton]}
                    onPress={() => handleChoice("dare")}
                    disabled={choosing}
                  >
                    {choosing ? (
                      <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                      <>
                        <Icon
                          name="flash"
                          size={32}
                          color={COLORS.textPrimary}
                        />
                        <Text style={styles.choiceButtonText}>Action</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.waitingTurn}>
                <ActivityIndicator color={COLORS.secondary} size="large" />
                <Text style={styles.waitingTurnText}>
                  {currentPlayer?.name} est en train de choisir...
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Liste des joueurs en bas */}
      <View style={styles.playersBar}>
        {game.players.map((player, index) => (
          <View
            key={player.oderId}
            style={[
              styles.playerDot,
              index === game.currentPlayerIndex && styles.playerDotActive,
            ]}
          >
            <Text style={styles.playerDotText}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  backToMenuButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  backToMenuText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  endButton: {
    position: "absolute",
    right: 20,
    top: 60,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  currentPlayerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  turnLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  currentPlayerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currentPlayerName: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.secondary,
  },
  yourTurnText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.success,
    marginTop: 8,
  },
  challengeContainer: {
    alignItems: "center",
  },
  challengeTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
  },
  truthTag: {
    backgroundColor: "#3B82F6",
  },
  dareTag: {
    backgroundColor: "#EF4444",
  },
  challengeTypeText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  challengeText: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.titleGradientStart,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  choiceContainer: {
    alignItems: "center",
  },
  chooseText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  choiceButtons: {
    flexDirection: "row",
    gap: 16,
  },
  choiceButton: {
    width: 140,
    height: 140,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  truthButton: {
    backgroundColor: "#3B82F6",
  },
  dareButton: {
    backgroundColor: "#EF4444",
  },
  choiceButtonText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  waitingTurn: {
    alignItems: "center",
    gap: 16,
  },
  waitingTurnText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  playersBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  playerDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutralGray800,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  playerDotActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  playerDotText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
});