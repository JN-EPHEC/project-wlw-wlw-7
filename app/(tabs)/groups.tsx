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
  TextInput,
  View,
} from "react-native";

const GROUPS = [
  {
    id: "bowling",
    name: "Bowling",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Sortie de ce soir?",
    icon: "🎳",
    badge: "BW",
    accent: "#8bc6ff",
  },
  {
    id: "girls-night",
    name: "Girls Night",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Sortie de ce soir?",
    icon: "💃",
    badge: "GN",
    accent: "#d292ff",
  },
  {
    id: "escalade",
    name: "Escalade",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Escalade ?",
    icon: "🧗",
    badge: "ES",
    accent: "#f6b56b",
  },
  {
    id: "afterwork",
    name: "Afterwork",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Escape Game",
    icon: "🍸",
    badge: "AW",
    accent: "#a1b7ff",
  },
  {
    id: "family",
    name: "Dimanche en famille",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Brunch chez mamie",
    icon: "👨‍👩‍👧‍👦",
    badge: "DF",
    accent: "#ff9ea6",
  },
];

export default function Groups() {
  const handlePress = (groupId: string) => {
    Alert.alert("À venir", `Navigation vers le groupe ${groupId}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Groupe</Text>
          <Pressable
            onPress={() => Alert.alert("Favoris", "Tu n'as pas encore de favoris")}
            style={({ pressed }) => [styles.heartButton, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="heart" size={22} color="#f26d7d" />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#7d8397" />
          <TextInput
            placeholder="Chercher un groupe"
            placeholderTextColor="#7d8397"
            style={styles.searchInput}
            selectionColor="#fff"
          />
        </View>

        <View style={styles.list}>
          {GROUPS.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => handlePress(group.id)}
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}
            >
              <View style={[styles.avatar, { backgroundColor: `${group.accent}1A` }]}> 
                <Text style={[styles.avatarText, { color: group.accent }]}>{group.badge}</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{group.name}</Text>
                  <Text style={styles.members}>{group.members} membres</Text>
                </View>

                <View style={styles.pollRow}>
                  <Text style={styles.pollLabel}>{group.lastPollLabel} :</Text>
                  <Text style={styles.pollValue}>{group.lastPollValue}</Text>
                </View>
              </View>

              <Text style={styles.icon}>{group.icon}</Text>
            </Pressable>
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
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1a1f33",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#161a2b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  members: {
    color: "#7d8397",
    fontSize: 13,
  },
  pollRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 6,
  },
  pollLabel: {
    color: "#7d8397",
    fontSize: 13,
    fontWeight: "500",
  },
  pollValue: {
    color: "#d6ddff",
    fontSize: 13,
    fontWeight: "600",
  },
  icon: {
    fontSize: 20,
    marginLeft: 10,
  },
});