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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Jeux</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="heart-outline" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="notifications-outline" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TITRE */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Jeux entre amis</Text>
          <Text style={styles.pageSubtitle}>
            Amuse-toi avec ton groupe grâce à nos mini-jeux exclusifs ! 🎲
          </Text>
        </View>

        {/* CARDS */}
        <View style={styles.cardList}>
          {/* ACTION OU VÉRITÉ */}
          <TouchableOpacity 
            style={styles.cardWrapper}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
              <LinearGradient
                colors={["#9D4EDD", "#7B2CBF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImage}
              >
                <View style={styles.cardImageContent}>
                  <Icon name="chatbubbles" size={40} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardImageTitle}>Action ou Vérité</Text>
                </View>
              </LinearGradient>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardDescription}>
                  Défis et vérités à partager en groupe ! Idéal pour animer vos soirées.
                </Text>
                
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.cardButton}>
                    <LinearGradient
                      colors={["#9D4EDD", "#7B2CBF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.cardButtonGradient}
                    >
                      <Icon name="play" size={16} color={COLORS.textPrimary} />
                      <Text style={styles.cardButtonText}>Jouer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <View style={styles.badge}>
                    <Icon name="gift" size={12} color="#10B981" />
                    <Text style={styles.badgeText}>Gratuit</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* UNDERCOVER */}
          <TouchableOpacity 
            style={styles.cardWrapper}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
              <View style={styles.cardImageDark}>
                <View style={styles.lockedOverlay}>
                  <Icon name="lock-closed" size={32} color="rgba(255,255,255,0.6)" />
                </View>
                <View style={styles.cardImageContent}>
                  <Icon name="eye-off" size={40} color="rgba(255,255,255,0.4)" />
                  <Text style={[styles.cardImageTitle, { opacity: 0.6 }]}>Undercover</Text>
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardDescription}>
                  Devine qui ment dans ton groupe ! Jeu de déduction et de bluff.
                </Text>
                
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.cardButton}>
                    <View style={styles.cardButtonLocked}>
                      <Icon name="lock-closed" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.cardButtonTextLocked}>Débloquer</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.badgePremium}>
                    <Icon name="diamond" size={12} color="#FFD700" />
                    <Text style={styles.badgeTextPremium}>Premium</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* LOUP-GAROU */}
          <TouchableOpacity 
            style={styles.cardWrapper}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImage}
              >
                <View style={styles.cardImageContent}>
                  <Icon name="moon" size={40} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardImageTitle}>Loup-Garou</Text>
                </View>
              </LinearGradient>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardDescription}>
                  Le classique jeu de rôle entre amis ! Incarnez villageois ou loup-garou.
                </Text>
                
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.cardButton}>
                    <LinearGradient
                      colors={["#6366F1", "#8B5CF6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.cardButtonGradient}
                    >
                      <Icon name="play" size={16} color={COLORS.textPrimary} />
                      <Text style={styles.cardButtonText}>Jouer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <View style={styles.badge}>
                    <Icon name="gift" size={12} color="#10B981" />
                    <Text style={styles.badgeText}>Gratuit</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* DEVINE QUI */}
          <TouchableOpacity 
            style={styles.cardWrapper}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
              <LinearGradient
                colors={["#F59E0B", "#EF4444"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImage}
              >
                <View style={styles.cardImageContent}>
                  <Icon name="help-circle" size={40} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.cardImageTitle}>Devine Qui ?</Text>
                </View>
              </LinearGradient>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardDescription}>
                  Pose des questions pour deviner le personnage mystère choisi par tes amis !
                </Text>
                
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.cardButton}>
                    <LinearGradient
                      colors={["#F59E0B", "#EF4444"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.cardButtonGradient}
                    >
                      <Icon name="play" size={16} color={COLORS.textPrimary} />
                      <Text style={styles.cardButtonText}>Jouer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <View style={styles.badge}>
                    <Icon name="gift" size={12} color="#10B981" />
                    <Text style={styles.badgeText}>Gratuit</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
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
  titleSection: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Poppins-Bold",
  },
  pageSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Poppins-Regular",
  },
  cardList: {
    gap: 20,
  },
  cardWrapper: {
    borderRadius: 24,
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cardImageDark: {
    height: 140,
    backgroundColor: COLORS.neutralGray800,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cardImageContent: {
    alignItems: "center",
    gap: 12,
  },
  cardImageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardButton: {
    borderRadius: 999,
    overflow: "hidden",
  },
  cardButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cardButtonLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardButtonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  cardButtonTextLocked: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  badge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    fontFamily: "Poppins-SemiBold",
  },
  badgePremium: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeTextPremium: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
    fontFamily: "Poppins-SemiBold",
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