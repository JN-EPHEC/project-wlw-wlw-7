import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../Auth_context";
import { COLORS } from "../../components/Colors";

interface GameRules {
  [key: string]: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

// ✅ NOUVEAU : Interface pour les versions de jeu
interface GameVersion {
  id: "base" | "spicy" | "jury";
  name: string;
  emoji: string;
  description: string;
  isPremium: boolean;
}

// ✅ NOUVEAU : Versions disponibles pour Action ou Vérité
const ACTION_VERITE_VERSIONS: GameVersion[] = [
  {
    id: "base",
    name: "Classic",
    emoji: "🎮",
    description: "Version gratuite pour tous",
    isPremium: false,
  },
  {
    id: "spicy",
    name: "Spicy",
    emoji: "🌶️",
    description: "Questions osées et piquantes",
    isPremium: true,
  },
  {
    id: "jury",
    name: "Jury",
    emoji: "👨‍⚖️",
    description: "Version spéciale présentation",
    isPremium: true,
  },
];

const GAME_RULES: GameRules = {
  "action-verite": [
    {
      icon: "people",
      title: "2 joueurs minimum",
      description: "Invite tes amis à rejoindre la partie avec un code unique.",
    },
    {
      icon: "shuffle",
      title: "Tour par tour",
      description: "Chaque joueur choisit à son tour : Action ou Vérité ?",
    },
    {
      icon: "flash",
      title: "Action",
      description: "Réalise le défi lancé par le jeu. Ose relever le challenge !",
    },
    {
      icon: "chatbubble-ellipses",
      title: "Vérité",
      description: "Réponds honnêtement à la question posée. Pas de mensonge !",
    },
    {
      icon: "trophy",
      title: "Pas de perdant",
      description: "Le but c'est de s'amuser entre amis, pas de gagner !",
    },
  ],
  // ... autres jeux (pas touché)
  "undercover": [
    {
      icon: "people",
      title: "4 joueurs minimum",
      description: "Plus vous êtes nombreux, plus c'est amusant !",
    },
    {
      icon: "eye-off",
      title: "Un imposteur",
      description: "Un joueur est désigné comme Undercover avec un mot différent.",
    },
    {
      icon: "chatbubbles",
      title: "Tour de parole",
      description: "Chaque joueur donne un indice sur son mot.",
    },
    {
      icon: "search",
      title: "Identifier l'imposteur",
      description: "Débattez et votez pour éliminer celui qui vous semble suspect.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "Les innocents gagnent s'ils éliminent l'Undercover.",
    },
  ],
  "loup-garou": [
    {
      icon: "people",
      title: "6 joueurs minimum",
      description: "Les Loups-Garous se cachent parmi les Villageois.",
    },
    {
      icon: "moon",
      title: "Phase nuit",
      description: "Les Loups-Garous désignent une victime.",
    },
    {
      icon: "sunny",
      title: "Phase jour",
      description: "Les Villageois débattent et votent pour éliminer un suspect.",
    },
    {
      icon: "medical",
      title: "Rôles spéciaux",
      description: "Voyante, Sorcière, Chasseur... Chacun a un pouvoir.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "Loups-Garous gagnent s'ils éliminent tous les Villageois.",
    },
  ],
  "qui-suis-je": [
    {
      icon: "people",
      title: "2 joueurs minimum",
      description: "Un contre un ou en équipes.",
    },
    {
      icon: "help-circle",
      title: "Personnage secret",
      description: "Chaque joueur a un personnage secret sur le front.",
    },
    {
      icon: "chatbubbles",
      title: "Questions",
      description: "Pose des questions pour deviner ton personnage.",
    },
    {
      icon: "bulb",
      title: "Hypothèses",
      description: "Fais des hypothèses pour identifier ton personnage.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "Le premier qui devine son personnage gagne.",
    },
  ],
  "time-bomb": [
    {
      icon: "people",
      title: "4 joueurs minimum",
      description: "Formez des équipes ou jouez en coopératif.",
    },
    {
      icon: "alarm",
      title: "Bombe à désamorcer",
      description: "Une bombe virtuelle doit être désamorcée à temps.",
    },
    {
      icon: "flash",
      title: "Défis rapides",
      description: "Résolvez des énigmes pour couper les fils de la bombe.",
    },
    {
      icon: "time",
      title: "Compte à rebours",
      description: "Le temps est limité pour réussir.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "Désamorcez la bombe avant qu'elle n'explose.",
    },
  ],
  "blind-test": [
    {
      icon: "people",
      title: "2 joueurs minimum",
      description: "Affronte-toi à tes amis ou joue en équipe.",
    },
    {
      icon: "musical-notes",
      title: "Extraits musicaux",
      description: "Écoute des extraits de chansons.",
    },
    {
      icon: "speedometer",
      title: "Rapidité",
      description: "Sois le plus rapide à reconnaître la chanson.",
    },
    {
      icon: "bulb",
      title: "Réponses",
      description: "Donne le titre ou l'artiste.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "Celui avec le plus de bonnes réponses gagne.",
    },
  ],
  "pictionary": [
    {
      icon: "people",
      title: "4 joueurs minimum",
      description: "Forme deux équipes de dessinateurs et de devineurs.",
    },
    {
      icon: "brush",
      title: "Mot à dessiner",
      description: "Un joueur tire un mot et doit le faire deviner en dessinant.",
    },
    {
      icon: "time",
      title: "Temps limité",
      description: "Un sablier impose une limite de temps.",
    },
    {
      icon: "bulb",
      title: "Faire deviner",
      description: "L'équipe doit deviner le mot avant la fin du temps.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "L'équipe avec le plus de points gagne.",
    },
  ],
  "mots-interdits": [
    {
      icon: "people",
      title: "4 joueurs minimum",
      description: "Joue en équipe contre équipe.",
    },
    {
      icon: "chatbubbles",
      title: "Mots interdits",
      description: "Fais deviner un mot sans utiliser les mots interdits.",
    },
    {
      icon: "warning",
      title: "Attention",
      description: "Si tu dis un mot interdit, l'équipe adverse gagne le point.",
    },
    {
      icon: "time",
      title: "Temps limité",
      description: "Un tour dure 60 secondes.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "L'équipe avec le plus de mots devinés gagne.",
    },
  ],
  "mimic": [
    {
      icon: "people",
      title: "4 joueurs minimum",
      description: "Joue en équipe contre équipe.",
    },
    {
      icon: "body",
      title: "Mime",
      description: "Un joueur mime un mot ou une phrase.",
    },
    {
      icon: "hand-left",
      title: "Sans parler",
      description: "Aucun mot ni son n'est autorisé.",
    },
    {
      icon: "time",
      title: "Temps limité",
      description: "L'équipe doit deviner avant la fin du temps.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "L'équipe avec le plus de bonnes réponses gagne.",
    },
  ],
  "quiz-culture": [
    {
      icon: "people",
      title: "2 joueurs minimum",
      description: "Affronte tes amis ou joue en solo.",
    },
    {
      icon: "school",
      title: "Questions variées",
      description: "Culture générale, cinéma, musique, sports, sciences...",
    },
    {
      icon: "speedometer",
      title: "Rapidité",
      description: "Sois rapide pour répondre avant tes adversaires.",
    },
    {
      icon: "bulb",
      title: "Choix multiples",
      description: "Choisis parmi 4 réponses possibles.",
    },
    {
      icon: "trophy",
      title: "Victoire",
      description: "Celui avec le meilleur score gagne.",
    },
  ],
};

export default function DescriptionJeu() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const params = useLocalSearchParams();
  
  const gameId = params.gameId as string;
  const gameName = params.gameName as string;
  const gameDescription = params.gameDescription as string;
  const gameIcon = params.gameIcon as string;
  const gameColors = JSON.parse(params.gameColors as string) as string[];
  const gameMinPlayers = parseInt(params.gameMinPlayers as string);
  const gameCategory = params.gameCategory as string;
  const gameIsPremium = params.gameIsPremium === "true";

  const isPremium = userProfile?.isPremium || false;
  const isLocked = gameIsPremium && !isPremium;
  
  const rules = GAME_RULES[gameId] || GAME_RULES["action-verite"];

  // ✅ NOUVEAU : State pour la version sélectionnée (uniquement pour Action ou Vérité)
  const [selectedVersion, setSelectedVersion] = useState<"base" | "spicy" | "jury">("base");

  // ✅ NOUVEAU : Vérifier si ce jeu a plusieurs versions
  const hasVersions = gameId === "action-verite";

  // ✅ NOUVEAU : Gérer la sélection de version
  const handleSelectVersion = (version: GameVersion) => {
    if (version.isPremium && !isPremium) {
      Alert.alert(
        "Version Premium requise 👑",
        `La version ${version.name} ${version.emoji} est réservée aux membres premium.`,
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Voir Premium", 
            onPress: () => router.push("/Profile/Abo_choix")
          }
        ]
      );
      return;
    }
    setSelectedVersion(version.id);
  };

  const handlePlayPress = () => {
    if (isLocked) {
      // Redirection vers la page d'abonnement
      router.push("/Profile/Abo_choix");
    } else {
      // ✅ MODIFIÉ : Passer le gameType sélectionné pour Action ou Vérité
      router.push({
        pathname: "/Game/Invitation" as any,
        params: { 
          gameType: hasVersions ? selectedVersion : "base"
        }
      });
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gameName}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image/Banner du jeu */}
        <LinearGradient
          colors={gameColors as [string, string, ...string[]]}
          style={styles.banner}
        >
          <Icon name={gameIcon} size={64} color={COLORS.textPrimary} />
          <Text style={styles.bannerTitle}>{gameName}</Text>
          <Text style={styles.bannerSubtitle}>{gameCategory}</Text>
        </LinearGradient>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>C'est quoi ?</Text>
          <Text style={styles.description}>
            {gameDescription}
          </Text>
        </View>

        {/* ✅ NOUVEAU : Sélection de version (uniquement pour Action ou Vérité) */}
        {hasVersions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisis ta version</Text>
            
            {ACTION_VERITE_VERSIONS.map((version) => {
              const isSelected = selectedVersion === version.id;
              const isVersionLocked = version.isPremium && !isPremium;
              
              return (
                <TouchableOpacity
                  key={version.id}
                  style={[
                    styles.versionCard,
                    isSelected && styles.versionCardSelected,
                    isVersionLocked && styles.versionCardLocked,
                  ]}
                  onPress={() => handleSelectVersion(version)}
                  activeOpacity={0.7}
                >
                  <View style={styles.versionHeader}>
                    <View style={styles.versionIconContainer}>
                      <Text style={styles.versionEmoji}>{version.emoji}</Text>
                    </View>
                    <View style={styles.versionInfo}>
                      <Text style={styles.versionName}>{version.name}</Text>
                      <Text style={styles.versionDescription}>
                        {version.description}
                      </Text>
                    </View>
                    
                    {isVersionLocked ? (
                      <View style={styles.lockIconContainer}>
                        <Icon name="lock-closed" size={20} color={COLORS.secondary} />
                      </View>
                    ) : (
                      <View style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected
                      ]}>
                        {isSelected && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    )}
                  </View>
                  
                  {version.isPremium && (
                    <View style={styles.premiumTag}>
                      <Icon name="diamond" size={12} color={COLORS.secondary} />
                      <Text style={styles.premiumTagText}>PREMIUM</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Règles du jeu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment jouer ?</Text>
          
          {rules.map((rule, index) => (
            <View key={index} style={styles.ruleCard}>
              <View style={styles.ruleIconContainer}>
                <Icon name={rule.icon} size={24} color={COLORS.secondary} />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDescription}>{rule.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info supplémentaire */}
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            {gameMinPlayers}+ joueurs nécessaires. Tous les joueurs doivent être connectés pour jouer en temps réel.
          </Text>
        </View>
      </ScrollView>

      {/* Bouton Jouer / Débloquer fixe en bas */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPress}
        >
          <LinearGradient
            colors={isLocked ? ["#FFD700", "#FFA500"] : gameColors as [string, string, ...string[]]}
            style={styles.playButtonGradient}
          >
            <Icon 
              name={isLocked ? "lock-closed" : "play"} 
              size={24} 
              color={COLORS.textPrimary} 
            />
            <Text style={styles.playButtonText}>
              {isLocked ? "Débloquer" : "Jouer maintenant"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  banner: {
    height: 180,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  // ✅ NOUVEAUX : Styles pour les cartes de version
  versionCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  versionCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
  },
  versionCardLocked: {
    opacity: 0.7,
  },
  versionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  versionEmoji: {
    fontSize: 28,
  },
  versionInfo: {
    flex: 1,
  },
  versionName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  versionDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  lockIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: COLORS.secondary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
  },
  premiumTag: {
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
  premiumTagText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: COLORS.secondary,
  },
  ruleCard: {
    flexDirection: "row",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ruleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.info,
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: COLORS.backgroundBottom,
  },
  playButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  playButtonText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});