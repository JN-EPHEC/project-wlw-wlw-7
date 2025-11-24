// app/(app)/home.tsx
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getSampleRecommendations } from "../lib/recommendation";

const cards = getSampleRecommendations();

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Que faire aujourd'hui ?</Text>
          <Text style={styles.subtitle}>
            Des idées rapides et adaptées à tes envies autour de Bruxelles.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggestions personnalisées</Text>
          <Text style={styles.sectionHint}>Basées sur tes choix de compte et centres d'intérêt</Text>
        </View>

        <View style={styles.cardList}>
          {cards.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <Text style={styles.badge}>{item.location}</Text>
                  <Text style={styles.badge}>{item.distance}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.description}</Text>
              </View>

              <View style={styles.tagRow}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.footerLabel}>Quand</Text>
                  <Text style={styles.footerValue}>{item.timing}</Text>
                </View>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
                  <Text style={styles.primaryButtonText}>Voir les détails</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#B4ACC8",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 8,
    gap: 4,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHint: {
    color: "#8B84A2",
    fontSize: 13,
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: "#0A051C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardHeader: {
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    color: "#FFFFFF",
    backgroundColor: "#1F1A2F",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#C4BDE0",
    fontSize: 14,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#0E1F29",
    borderColor: "#46E4D6",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    color: "#46E4D6",
    fontWeight: "700",
    fontSize: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLabel: {
    color: "#8B84A2",
    fontSize: 12,
  },
  footerValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#7C5BBF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});