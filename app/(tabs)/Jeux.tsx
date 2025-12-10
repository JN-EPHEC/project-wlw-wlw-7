import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../Auth_context";
import { COLORS } from "../../components/Colors";
import { joinGame } from "../../service/TruthOrDareService";

export default function JeuxScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth(); // Supposant que userProfile contient isPremium
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur est premium
  const isPremium = userProfile?.isPremium || false;

  // Rejoindre une partie avec le code
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

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Jeux</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="heart" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconCircle}
              onPress={() => setShowJoinModal(true)}
            >
              <Icon name="enter" size={20} color={COLORS.secondary} />
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
          {/* ACTION OU VÉRITÉ - Toujours accessible */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push("../Game/Description_jeu")}
            activeOpacity={0.7}
          >
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
                  <TouchableOpacity 
                    style={styles.cardButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push("../Game/Invitation");
                    }}
                  >
                    <Text style={styles.cardButtonText}>Jouer</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Free</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* UNDERCOVER - Premium uniquement */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => {
              if (!isPremium) {
                Alert.alert(
                  "Premium requis",
                  "Ce jeu est réservé aux membres Premium. Passe à Premium pour débloquer tous les jeux !",
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Découvrir Premium", onPress: () => {/* Navigation vers page premium */} }
                  ]
                );
              } else {
                // Navigation vers description du jeu Undercover
                router.push("../Game/Description_undercover");
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.cardImageDark}>
              <Icon name="eye-off" size={48} color={COLORS.secondary} />
              <Text style={styles.cardImageTitle}>Undercover</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Devine qui ment dans ton groupe !
              </Text>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={[styles.cardButton, styles.cardButtonSecondary]}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (!isPremium) {
                      Alert.alert(
                        "Premium requis",
                        "Ce jeu est réservé aux membres Premium."
                      );
                    }
                  }}
                >
                  <Text style={styles.cardButtonText}>
                    {isPremium ? "Jouer" : "Débloquer"}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.badge, styles.badgePremium]}>
                  <Icon name="diamond" size={12} color="#FFD700" />
                  <Text style={styles.badgeTextPremium}>Premium</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* LOUP-GAROU - Premium uniquement */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => {
              if (!isPremium) {
                Alert.alert(
                  "Premium requis",
                  "Ce jeu est réservé aux membres Premium. Passe à Premium pour débloquer tous les jeux !",
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Découvrir Premium", onPress: () => {/* Navigation vers page premium */} }
                  ]
                );
              } else {
                // Navigation vers description du jeu Loup-Garou
                router.push("../Game/Description_loupgarou");
              }
            }}
            activeOpacity={0.7}
          >
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
                <TouchableOpacity 
                  style={styles.cardButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (!isPremium) {
                      Alert.alert(
                        "Premium requis",
                        "Ce jeu est réservé aux membres Premium."
                      );
                    }
                  }}
                >
                  <Text style={styles.cardButtonText}>
                    {isPremium ? "Jouer" : "Débloquer"}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.badge, styles.badgePremium]}>
                  <Icon name="diamond" size={12} color="#FFD700" />
                  <Text style={styles.badgeTextPremium}>Premium</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
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
    fontSize: 32,
    fontWeight: "700",
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