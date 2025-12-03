// app/(app)/groups.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  backgroundStart: "#110A1E",
  backgroundEnd: "#0A0612",
  cardBg: "#15102A",
  cardBorder: "#1F1A2F",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  searchBg: "#141329",
  primary: "#3A2A60",
  accent: "#B57BFF",
};

const TYPO = {
  h1: { fontFamily: "Poppins-Bold" as const, fontSize: 24 },
  body: { fontFamily: "Poppins-Regular" as const, fontSize: 14 },
  button: { fontFamily: "Poppins-Medium" as const, fontSize: 13 },
};

type Group = {
  id: string;
  name: string;
  membersCount: number;
  lastPoll: string;
  emoji: string;
};

// 👉 pour l’instant : données mockées, plus tard tu remplaces par Firestore
const MOCK_GROUPS: Group[] = [
  {
    id: "1",
    name: "Bowling",
    membersCount: 6,
    lastPoll: "Sortie de ce soir ?",
    emoji: "🎳",
  },
  {
    id: "2",
    name: "Girls Night",
    membersCount: 6,
    lastPoll: "Sortie en boîte",
    emoji: "💃",
  },
  {
    id: "3",
    name: "Escalade",
    membersCount: 6,
    lastPoll: "Escalade Fri",
    emoji: "🧗‍♀️",
  },
  {
    id: "4",
    name: "Afterwork",
    membersCount: 30,
    lastPoll: "Escape Game",
    emoji: "💼",
  },
];

export default function GroupsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_GROUPS;
    return MOCK_GROUPS.filter((g) =>
      `${g.name} ${g.lastPoll}`.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TOPBAR */}
          <View style={styles.header}>
            {/* spacer gauche pour centrer le titre */}
            <View style={styles.headerSpacer} />

            <Text style={styles.headerTitle}>Groupes</Text>

            <View style={styles.headerRight}>
              {/* cœur rouge → page favoris */}
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.8}
                onPress={() => router.push("./favorite/index")}
              >
                <Ionicons name="heart" size={18} color="#EF4444" />
              </TouchableOpacity>

              {/* bouton + → page création de groupe */}
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.8}
                onPress={() => router.push("/create-group")}
              >
                <Ionicons name="add" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Chercher un groupe"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearch("")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* LISTE DES GROUPES */}
          <View style={styles.groupsList}>
            {filteredGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                activeOpacity={0.9}
                style={styles.groupCard}
                onPress={() =>
                  router.push({
                    pathname: "/group-detail",
                    params: { id: group.id },
                  })
                }
              >
                {/* avatar + contenu */}
                <View style={styles.groupLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {group.emoji || group.name[0]}
                    </Text>
                  </View>

                  <View style={styles.groupTextBlock}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>
                      {group.membersCount} membres
                    </Text>
                    <Text style={styles.groupLastPoll}>
                      Dernier sondage : "{group.lastPoll}"
                    </Text>
                  </View>
                </View>

                {/* chevron à droite */}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            ))}

            {filteredGroups.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Aucun groupe trouvé</Text>
                <Text style={styles.emptyText}>
                  Essaie une autre recherche ou crée un nouveau groupe avec le
                  bouton + en haut à droite.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    ...TYPO.h1,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1A4A",
    alignItems: "center",
    justifyContent: "center",
  },

  // SEARCH
  searchContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.searchBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...TYPO.body,
    color: COLORS.textPrimary,
  },
  clearButton: {
    marginLeft: 8,
  },

  // LISTE
  groupsList: {
    marginTop: 16,
    gap: 10,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  groupLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#241644",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  groupTextBlock: {
    flex: 1,
  },
  groupName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  groupMembers: {
    ...TYPO.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  groupLastPoll: {
    ...TYPO.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // EMPTY STATE
  emptyState: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.accent,
    padding: 16,
    backgroundColor: "rgba(181, 123, 255, 0.05)",
    gap: 6,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  emptyText: {
    ...TYPO.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
