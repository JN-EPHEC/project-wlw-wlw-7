// app/(app)/premium.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PremiumScreen() {
  const router = useRouter();

  const handleConfirm = () => {
    Alert.alert(
      "Confirmer",
      "Es-tu sûr de vouloir changer d'abonnement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "OK",
          style: "default",
          onPress: () => router.push("/payment"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Abonnement</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Passe en premium <Text style={{ color: "#6CD1FF" }}>💎</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Débloque les jeux, les sondages avancés et les activités ciblées.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Free</Text>
          <Text style={styles.cardPrice}>0€/mois</Text>
          <Text style={styles.cardDescription}>
            Accès à certains jeux et groupes limités
          </Text>
          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.85}>
            <Text style={styles.outlineText}>Débloquer Premium</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.primaryCard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.highlightText}>Premium Annuel</Text>
            <Text style={styles.badge}>Le plus avantageux</Text>
          </View>
          <Text style={styles.primaryPrice}>49,99€/an</Text>
          <Text style={styles.primaryDescription}>
            2 mois offerts, tous les avantages inclus.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.solidButton}
              activeOpacity={0.9}
              onPress={handleConfirm}
            >
              <Text style={styles.solidText}>Activer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9}>
              <Text style={styles.secondaryText}>Le plus avantageux</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Premium mensuel</Text>
          <Text style={styles.cardPrice}>9,99€/mois</Text>
          <Text style={styles.cardDescription}>
            Accès illimité à tous les jeux et fonctionnalités.
          </Text>
          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.outlineText}>Activer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    backgroundColor: "#0D081F",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  hero: {
    gap: 6,
  },
  heroTitle: {
    color: "#7AB8FF",
    fontSize: 22,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#C9C3DD",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#0E0A23",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#272141",
    gap: 10,
  },
  primaryCard: {
    backgroundColor: "#1B0F3D",
    borderColor: "#7C5BFF",
  },
  cardTitle: {
    color: "#E7E1FF",
    fontSize: 18,
    fontWeight: "800",
  },
  highlightText: {
    color: "#94D4FF",
    fontSize: 18,
    fontWeight: "800",
  },
  cardPrice: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  primaryPrice: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  cardDescription: {
    color: "#B5AEC7",
    fontSize: 14,
    lineHeight: 20,
  },
  primaryDescription: {
    color: "#D8D2F5",
    fontSize: 14,
    lineHeight: 20,
  },
  outlineButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7C5BFF",
    alignItems: "center",
    backgroundColor: "#140C2C",
  },
  outlineText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  solidButton: {
    flex: 1,
    backgroundColor: "#7C5BFF",
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
  },
  solidText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1C1C35",
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4A4470",
    alignItems: "center",
  },
  secondaryText: {
    color: "#B8B2D7",
    fontSize: 13,
    fontWeight: "700",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    backgroundColor: "#2B214E",
    color: "#E1DBFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
  },
});