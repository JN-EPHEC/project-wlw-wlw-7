import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PARTY_GAMES = [
  {
    id: "truth-dare",
    title: "Action ou vérité",
    description: "Défis et vérités à partager en groupe !",
    accent: "#b388ff",
    background: "#2a1e42",
    icon: "🎉",
    ctaLabel: "Jouer",
    statusLabel: "Free",
  },
  {
    id: "undercover",
    title: "Undercover",
    description: "Devine qui ment dans ton groupe !",
    accent: "#d28bff",
    background: "#221630",
    icon: "😈",
    ctaLabel: "Débloquer",
    statusLabel: "Premium",
  },
  {
    id: "werewolf",
    title: "Loup-Garou",
    description: "Stratégie, bluff et rôles cachés pour tous.",
    accent: "#ffb07c",
    background: "#251f1b",
    icon: "🐺",
    ctaLabel: "Découvrir",
    statusLabel: "Soon",
  },
];

export default function Game() {
  const handlePress = (id: string, action: string) => {
    Alert.alert("Bientôt disponible", `Action "${action}" pour ${id}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>What2do</Text>
          <Pressable
            onPress={() => handlePress("favorites", "favoris")}
            style={({ pressed }) => [styles.heartButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="heart" size={22} color="#cf5a5a" />
          </Pressable>
        </View>

        <Text style={styles.heading}>Jeux entre amis</Text>
        <Text style={styles.subtitle}>
          Amuse-toi avec ton groupe grâce à nos mini-jeux exclusifs !
        </Text>

        <View style={styles.cardList}>
          {PARTY_GAMES.map((game) => (
            <View key={game.id} style={[styles.card, { backgroundColor: game.background }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardIcon, { color: game.accent }]}>{game.icon}</Text>
                <Pressable
                  onPress={() => handlePress(game.id, "status")}
                  style={({ pressed }) => [
                    styles.statusPill,
                    { borderColor: game.accent },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={[styles.statusText, { color: game.accent }]}>
                    {game.statusLabel}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.cardTitle}>{game.title}</Text>
              <Text style={styles.cardDescription}>{game.description}</Text>

              <Pressable
                onPress={() => handlePress(game.id, game.ctaLabel)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: game.accent },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.primaryButtonText}>{game.ctaLabel}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f1220",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brand: {
    color: "#5ea1ff",
    fontSize: 24,
    fontWeight: "900",
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9aa3b2",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  cardList: {
    gap: 20,
  },
  card: {
    borderRadius: 24,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 32,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardDescription: {
    color: "#d0d6e3",
    marginBottom: 16,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0f1220",
    fontWeight: "800",
    fontSize: 16,
  },
});