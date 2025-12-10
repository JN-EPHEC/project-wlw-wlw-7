import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

export default function JeuxScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>What2do</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="heart" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="notifications" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TITRE */}
        <Text style={styles.pageTitle}>Jeux entre amis</Text>
        <Text style={styles.pageSubtitle}>
          Amuse-toi avec ton groupe grâce à nos mini-jeux exclusifs !
        </Text>

        {/* CARDS */}
        <View style={styles.cardList}>
          {/* ACTION OU VÉRITÉ */}
          <View style={styles.card}>
            <LinearGradient
              colors={["#9D4EDD", "#7B2CBF"]}
              style={styles.cardImage}
            >
              <Text style={styles.cardImageTitle}>Action ou vérité</Text>
            </LinearGradient>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Défis et vérités à partager en groupe !
              </Text>
              
              <View style={styles.cardFooter}>
  <View style={styles.cardButtons}>
    <TouchableOpacity style={styles.cardButton}
    onPress={() => router.push("../Game/Invitation")}>
      <Text style={styles.cardButtonText}>Jouer</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.cardButton} 
      onPress={() => router.push("../Game/Description_jeu")}
    >
      <Text style={styles.cardButtonText}>Détails</Text>
    </TouchableOpacity>
  </View>
  <View style={styles.badge}>
    <Text style={styles.badgeText}>Free</Text>
  </View>
</View>
            </View>
          </View>

          {/* UNDERCOVER */}
          <View style={styles.card}>
            <View style={styles.cardImageDark}>
              <Icon name="eye-off" size={48} color={COLORS.secondary} />
              <Text style={styles.cardImageTitle}>Undercover</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Devine qui ment dans ton groupe !
              </Text>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity style={[styles.cardButton, styles.cardButtonSecondary]}>
                  <Text style={styles.cardButtonText}>Débloquer</Text>
                </TouchableOpacity>
                <View style={[styles.badge, styles.badgePremium]}>
                  <Icon name="diamond" size={12} color="#FFD700" />
                  <Text style={styles.badgeTextPremium}>Premium</Text>
                </View>
              </View>
            </View>
          </View>

          {/* LOUP-GAROU */}
          <View style={styles.card}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.cardImage}
            >
              <Text style={styles.cardImageTitle}>Loup-Garou</Text>
            </LinearGradient>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Le classique jeu de rôle entre amis !
              </Text>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Jouer</Text>
                </TouchableOpacity>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Free</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.titleGradientStart,
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
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    height: 120,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardImageDark: {
    height: 120,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardImageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardContent: {
    paddingHorizontal: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardButton: {
    backgroundColor: COLORS.titleGradientStart,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  cardButtonSecondary: {
    backgroundColor: COLORS.primary,
  },
  cardButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
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
    fontWeight: "600",
    color: "#FFD700",
  },
  cardButtons: {
  flexDirection: "row",
  gap: 8,
},
cardButtonOutline: {
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: COLORS.secondary,
},
});