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
  subscribeToGame
} from "../../../service/TruthOrDareService";

// ==================== VERSION BASE ====================
const TRUTHS_BASE = [
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
  "Quelle est la chose la plus embarrassante que tu aies faite en public ?",
  "Quel est ton plus grand secret que personne ne connaît ?",
  "Quelle est la chose la plus étrange que tu aies faite quand tu étais seul(e) ?",
  "Quel est le message le plus gênant que tu aies envoyé par erreur ?",
  "Quelle est la chose que tu voudrais changer dans ton apparence ?",
  "As-tu déjà fait semblant d'aimer un cadeau alors que tu le détestais ?",
  "Quel est ton fantasme le plus fou ?",
  "As-tu déjà eu le béguin pour quelqu'un dans ce groupe ?",
  "Quelle est la pire chose que tu aies dite sur quelqu'un dans son dos ?",
  "As-tu déjà volé quelque chose ? Quoi ?",
  "As-tu déjà menti sur ton âge ? Pourquoi ?",
  "Quelle est la rumeur la plus folle que tu aies entendue sur toi ?",
  "As-tu déjà été amoureux(se) de deux personnes en même temps ?",
  "Quelle est la chose la plus bizarre que tu aies recherchée sur Google ?",
  "As-tu déjà fait quelque chose juste pour impressionner quelqu'un ?",
];

const DARES_BASE = [
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
  "Envoie un message à ton ex en disant 'Je pense encore à toi'.",
  "Fais 20 pompes sans t'arrêter.",
  "Appelle un(e) ami(e) et chante-lui 'Joyeux anniversaire'.",
  "Poste une story Instagram embarrassante de ton choix.",
  "Laisse quelqu'un du groupe écrire ce qu'il veut sur ton statut.",
  "Imite quelqu'un du groupe et laisse les autres deviner qui c'est.",
  "Parle avec un accent différent pendant les 3 prochains tours.",
  "Laisse le groupe fouiller dans ton téléphone pendant 1 minute.",
  "Envoie un vocal de 30 secondes à ton crush en improvisant.",
  "Fais 10 squats en tenant quelqu'un sur ton dos.",
  "Raconte la blague la plus nulle que tu connaisses avec le plus grand sérieux.",
  "Mets une cuillère sur ton nez et garde-la en équilibre pendant 1 minute.",
  "Appelle tes parents et dis-leur que tu as quelque chose d'important à leur dire, puis raccroche.",
  "Change ta photo de profil par une photo embarrassante pendant 24h.",
  "Fais le poirier contre un mur pendant 30 secondes.",
];

// ==================== VERSION SPICY 🌶️ ====================
const TRUTHS_SPICY = [
  "Quelle est ta position préférée ?",
  "Combien de personnes as-tu embrassées dans ta vie ?",
  "Quel est ton fantasme sexuel le plus fou ?",
  "As-tu déjà fait l'amour dans un lieu public ? Où ?",
  "Quelle est la chose la plus osée que tu aies faite lors d'un rendez-vous ?",
  "As-tu déjà envoyé des photos intimes ? À qui ?",
  "Quel est le prénom de la personne avec qui tu aimerais passer une nuit ?",
  "As-tu déjà fait un plan à trois ? Aimerais-tu essayer ?",
  "Quelle est la partie du corps qui t'excite le plus chez quelqu'un ?",
  "As-tu déjà regardé du contenu pour adultes avec quelqu'un ?",
  "Quelle est ta zone érogène préférée ?",
  "As-tu déjà eu une aventure d'un soir ? Comment c'était ?",
  "Quel est l'endroit le plus fou où tu as fait l'amour ?",
  "As-tu déjà utilisé des jouets intimes ? Seul(e) ou accompagné(e) ?",
  "Quelle est la chose la plus coquine que tu aies faite en étant ivre ?",
  "As-tu déjà eu une relation avec deux personnes en même temps sans qu'elles le sachent ?",
  "Quel est ton film pour adultes préféré ou ta catégorie préférée ?",
  "As-tu déjà fait un strip-tease devant quelqu'un ?",
  "Quelle est la chose la plus perverse que tu aies pensée aujourd'hui ?",
  "As-tu déjà fantasmé sur quelqu'un dans ce groupe ? Qui ?",
  "Combien de temps as-tu tenu sans relation intime ?",
  "As-tu déjà fait l'amour en étant complètement sobre ?",
  "Quelle est la chose la plus étrange qui t'ait excité(e) ?",
  "As-tu déjà trompé quelqu'un ? Raconte.",
  "Quel est ton record de rapports en 24 heures ?",
  "As-tu déjà pratiqué le sexting ? Avec qui ?",
  "Quelle est la personne la plus âgée/jeune avec qui tu aies eu une relation ?",
  "As-tu déjà été attiré(e) par quelqu'un du même sexe ?",
  "Quelle est ta technique de séduction préférée ?",
  "As-tu déjà simulé un orgasme ? Pourquoi ?",
];

const DARES_SPICY = [
  "Embrasse la personne de ton choix dans ce groupe sur la joue (ou sur la bouche si elle accepte).",
  "Fais un lap dance de 30 secondes à quelqu'un du groupe.",
  "Enlève un vêtement de ton choix pour les 3 prochains tours.",
  "Laisse quelqu'un te donner un suçon où il/elle veut (zone visible).",
  "Fais un massage sensuel des épaules à la personne à ta gauche pendant 2 minutes.",
  "Lèche de la chantilly ou du chocolat sur le doigt de quelqu'un.",
  "Décris en détail ton fantasme sexuel préféré devant tout le monde.",
  "Fais des mouvements sensuels pendant 30 secondes.",
  "Envoie un message sexy à ton crush ou ex.",
  "Laisse quelqu'un te prendre en photo dans une pose sexy (gardez-la pour vous).",
  "Fais un bisou dans le cou à la personne de ton choix.",
  "Raconte ta meilleure anecdote coquine en détail.",
  "Échange de place et assieds-toi sur les genoux de quelqu'un pour un tour.",
  "Fais une danse provocante pendant 1 minute.",
  "Laisse quelqu'un retirer un vêtement de ton choix.",
  "Décris ce que tu ferais lors d'un date parfait qui se termine très bien.",
  "Fais semblant d'avoir un orgasme de manière convaincante.",
  "Embrasse le ventre de quelqu'un dans le groupe.",
  "Raconte le moment le plus hot de ta vie.",
  "Mime une scène de séduction avec la personne à ta droite.",
  "Envoie 'On se voit ce soir ? 😏' à un contact aléatoire.",
  "Fais 10 pompes sensuelles.",
  "Décris la lingerie que tu portes actuellement en détail.",
  "Laisse quelqu'un tracer une ligne avec le doigt sur ton corps (zone de ton choix).",
  "Fais un compliment très coquin à chaque personne du groupe.",
  "Mordille l'oreille de quelqu'un dans le groupe.",
  "Raconte le rêve érotique le plus fou que tu aies fait.",
  "Fais un body shot (bois une shot sur le corps de quelqu'un).",
  "Simule une scène de premier baiser avec quelqu'un.",
  "Laisse quelqu'un choisir un endroit où t'embrasser (pas la bouche).",
];

// ==================== VERSION JURY 👨‍⚖️ ====================
// À remplir par vous-même pour la présentation
const TRUTHS_JURY: string[] = [];

const DARES_JURY: string[] = [];

export default function TruthOrDareGame() {
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

  // ✅ Fonction pour récupérer les bonnes listes selon le gameType
  const getChallenges = (type: "truth" | "dare"): string[] => {
    if (!game) return [];

    const gameType = game.gameType || "base";

    if (type === "truth") {
      switch (gameType) {
        case "spicy":
          return TRUTHS_SPICY;
        case "jury":
          return TRUTHS_JURY.length > 0 ? TRUTHS_JURY : TRUTHS_BASE;
        default:
          return TRUTHS_BASE;
      }
    } else {
      switch (gameType) {
        case "spicy":
          return DARES_SPICY;
        case "jury":
          return DARES_JURY.length > 0 ? DARES_JURY : DARES_BASE;
        default:
          return DARES_BASE;
      }
    }
  };

  // Choisir Action ou Vérité
  const handleChoice = async (type: "truth" | "dare") => {
    if (!gameId || !game || !currentPlayer) return;

    setChoosing(true);

    const challenges = getChallenges(type);

    // Sécurité : si aucune question (version jury vide)
    if (challenges.length === 0) {
      Alert.alert(
        "Aucune question",
        "Les questions pour cette version ne sont pas encore configurées."
      );
      setChoosing(false);
      return;
    }

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

  // ✅ Afficher le type de jeu dans le header
  const gameTypeLabel =
    game.gameType === "spicy"
      ? "🌶️ Spicy"
      : game.gameType === "jury"
      ? "👨‍⚖️ Jury"
      : "Classic";

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Action ou Vérité</Text>
          <Text style={styles.gameTypeLabel}>{gameTypeLabel}</Text>
        </View>
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
          {isMyTurn && <Text style={styles.yourTurnText}>C'est à toi !</Text>}
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
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Suivant</Text>
              <Icon
                name="arrow-forward"
                size={20}
                color={COLORS.textPrimary}
              />
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
    textAlign: "center",
  },
  gameTypeLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 4,
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