import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../components/Colors";
import { auth, db } from "../firebase_Config";

export default function WorkInProgressScreen() {
  const router = useRouter();

  const handleSwitchToPersonal = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }

    try {
      // Mettre à jour le type de compte en "personal"
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        accountType: "personal",
      });

      Alert.alert(
        "Succès",
        "Ton compte a été changé en mode personnel !",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/Home") }]
      );
    } catch (error: any) {
      console.error("Erreur changement de compte:", error);
      Alert.alert("Erreur", "Impossible de changer le type de compte");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icône principale */}
        <View style={styles.iconContainer}>
          <Icon name="construct" size={80} color={COLORS.secondary} />
        </View>
        
        <Text style={styles.title}>Mode Professionnel 🚧</Text>
        
        <Text style={styles.subtitle}>
          Cette fonctionnalité est en cours de développement
        </Text>
        
        <Text style={styles.description}>
          Le mode professionnel de What2Do permettra aux entreprises de :
        </Text>

        {/* Liste des fonctionnalités à venir */}
        <View style={styles.featuresList}>
          <FeatureItem icon="people" text="Organiser des team buildings" />
          <FeatureItem icon="calendar" text="Planifier des afterworks" />
          <FeatureItem icon="business" text="Gérer plusieurs équipes" />
          <FeatureItem icon="stats-chart" text="Analyser l'engagement de l'équipe" />
          <FeatureItem icon="trophy" text="Créer des challenges d'équipe" />
        </View>

        {/* Message pour le jury */}
        <View style={styles.juryBox}>
          <Icon name="school" size={24} color={COLORS.info} />
          <View style={{ flex: 1 }}>
            <Text style={styles.juryTitle}>Note pour le jury académique</Text>
            <Text style={styles.juryText}>
              Cette interface est volontairement en "Work in Progress" car le développement 
              de la partie professionnelle n'était pas prioritaire pour cette version de démonstration. 
              L'accent a été mis sur la partie personnelle qui est entièrement fonctionnelle.
            </Text>
          </View>
        </View>

        {/* BOUTONS D'ACTION */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSwitchToPersonal}
          >
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Icon name="person" size={20} color={COLORS.textPrimary} />
              <Text style={styles.primaryButtonText}>
                Passer en mode Personnel
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/Profile/Modif_prof")}
          >
            <Icon name="settings" size={20} color={COLORS.textPrimary} />
            <Text style={styles.secondaryButtonText}>
              Modifier mon profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            En attendant, profite de toutes les fonctionnalités en mode personnel !
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Composant pour afficher une fonctionnalité
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Icon name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "center",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  featuresList: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
  },
  juryBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
    marginBottom: 24,
  },
  juryTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.info,
    marginBottom: 6,
  },
  juryText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.info,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#34C759",
    lineHeight: 20,
  },
});