import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

export default function DescriptionJeu() {
  const router = useRouter();

  const rules = [
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
  ];

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
        <Text style={styles.headerTitle}>Action ou Vérité</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image/Banner du jeu */}
        <LinearGradient
          colors={["#9D4EDD", "#7B2CBF"]}
          style={styles.banner}
        >
          <Icon name="game-controller" size={64} color={COLORS.textPrimary} />
          <Text style={styles.bannerTitle}>Action ou Vérité</Text>
          <Text style={styles.bannerSubtitle}>Le classique revisité</Text>
        </LinearGradient>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>C'est quoi ?</Text>
          <Text style={styles.description}>
            Le jeu parfait pour pimenter vos soirées entre amis ! Chacun son 
            tour, choisis entre réaliser une Action folle ou révéler une Vérité 
            sur toi. Fous rires garantis !
          </Text>
        </View>

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
            Tous les joueurs doivent être connectés pour jouer en temps réel.
          </Text>
        </View>
      </ScrollView>

      {/* Bouton Jouer fixe en bas */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push("/Game/Invitation")}
        >
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playButtonGradient}
          >
            <Icon name="play" size={24} color={COLORS.textPrimary} />
            <Text style={styles.playButtonText}>Jouer maintenant</Text>
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