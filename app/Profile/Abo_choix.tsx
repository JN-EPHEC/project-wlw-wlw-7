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

export default function SubscriptionScreen() {
  const router = useRouter();

  const handleActivateFree = () => {
    router.back();
  };

  const handleActivateMonthly = () => {
    (router as any).push({
      pathname: "/Profile/Fake_payment",
      params: { planType: "monthly" }
    });
  };

  const handleActivateAnnual = () => {
    (router as any).push({
      pathname: "/Profile/Fake_payment",
      params: { planType: "annual" }
    });
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Abonnement</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* TITRE PREMIUM */}
        <View style={styles.premiumHeader}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBadge}
          >
            <Icon name="diamond" size={20} color={COLORS.textPrimary} />
            <Text style={styles.premiumBadgeText}>Passe en premium</Text>
          </LinearGradient>
          <Text style={styles.premiumDescription}>
            Débloque les jeux, les sondages avancés et les activités ciblées.
          </Text>
        </View>

        {/* PLAN FREE */}
        <View style={styles.planCard}>
          <View style={styles.planContent}>
            <Text style={styles.planTitle}>Free</Text>
            <Text style={styles.planSubtitle}>
              Accès à certains jeux et groupes limités
            </Text>
          </View>

          <Text style={styles.planPrice}>0€/mois</Text>

          <TouchableOpacity 
            style={styles.planCTA}
            onPress={handleActivateFree}
          >
            <Text style={styles.planCTAText}>Débloquer Premium</Text>
          </TouchableOpacity>
        </View>

        {/* PLAN PREMIUM ANNUEL */}
        <View style={[styles.planCard, styles.planCardPremium]}>
          {/* BADGE "LE PLUS AVANTAGEUX" */}
          <View style={styles.bestValueBadge}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bestValueGradient}
            >
              <Icon name="star" size={14} color="#FFFFFF" />
              <Text style={styles.bestValueText}>Le plus avantageux</Text>
            </LinearGradient>
          </View>

          <View style={styles.planContent}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumLabel}
            >
              <Text style={styles.planTitle}>Premium Annuel</Text>
            </LinearGradient>
            <Text style={styles.planSubtitle}>
              2 mois offerts, tous les avantages inclus.
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>29,99€/an</Text>
            <Text style={styles.planSavings}>Économise 25%</Text>
          </View>

          <TouchableOpacity 
            style={styles.activateButtonWrapper}
            onPress={handleActivateAnnual}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activateButton}
            >
              <Text style={styles.activateButtonText}>Activer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* PLAN PREMIUM MENSUEL */}
        <View style={[styles.planCard, styles.planCardPremium]}>
          <View style={styles.planContent}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumLabel}
            >
              <Text style={styles.planTitle}>Premium mensuel</Text>
            </LinearGradient>
            <Text style={styles.planSubtitle}>
              Accès illimité à tous les jeux et fonctionnalités.
            </Text>
          </View>

          <Text style={styles.planPrice}>3,99€/mois</Text>

          <TouchableOpacity 
            style={styles.activateButtonOutlineWrapper}
            onPress={handleActivateMonthly}
          >
            <View style={styles.activateButtonOutline}>
              <Text style={styles.activateButtonOutlineText}>Activer</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* AVANTAGES PREMIUM */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Avantages Premium</Text>
          
          {[
            { icon: "game-controller", text: "Accès illimité aux jeux" },
            { icon: "people", text: "Groupes illimités" },
            { icon: "star", text: "Badge premium sur le profil" },
            { icon: "notifications-off", text: "Sans publicité" },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                style={styles.benefitIcon}
              >
                <Icon name={benefit.icon} size={16} color={COLORS.textPrimary} />
              </LinearGradient>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
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
    marginBottom: 32,
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
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  premiumHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 12,
  },
  premiumBadgeText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  premiumDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 16,
    position: "relative",
    alignItems: "center",
  },
  planCardPremium: {
    backgroundColor: "#1E1B3F",
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    zIndex: 1,
  },
  bestValueGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bestValueText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  planContent: {
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  premiumLabel: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  planSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  planSavings: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#10B981",
  },
  planCTA: {
    backgroundColor: COLORS.backgroundTop,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%",
  },
  planCTAText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textSecondary,
  },
  activateButtonWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  activateButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activateButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  activateButtonOutlineWrapper: {
    width: "100%",
  },
  activateButtonOutline: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  activateButtonOutlineText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#6366F1",
  },
  benefitsSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
  },
});