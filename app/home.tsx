// app/(app)/home.tsx
import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
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
  cardBg: "#0A051C",
  cardBorder: "#1F1A2F",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  chipBg: "#141329",
  chipActiveBg: "#3A2A60",
  chipActiveBorder: "#B57BFF",
  primary: "#3A2A60",
  accent: "#B57BFF",
};

const TYPO = {
  h1: { fontFamily: "Poppins-Bold" as const, fontSize: 24 },
  body: { fontFamily: "Poppins-Regular" as const, fontSize: 14 },
  button: { fontFamily: "Poppins-SemiBold" as const, fontSize: 14 },
};

// gradient texte pour le logo sur le web
const WEB_LOGO_GRADIENT: any = {
  backgroundImage: "linear-gradient(90deg,#A259FF,#00A3FF)",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  distanceKm: number;
  category: string;
  isFree: boolean;
  isNew: boolean;
  dateLabel: string;
};

type FilterKey = "nearby" | "free" | "new";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "nearby", label: "Près de moi" },
  { key: "free", label: "Gratuit" },
  { key: "new", label: "Nouveau" },
];

// 👉 plus tard tu remplaceras ça par les données Firestore
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Concert",
    subtitle: "Ambiance live avec ton groupe d'amis",
    location: "Centre-ville",
    distanceKm: 1.2,
    category: "Musique",
    isFree: false,
    isNew: true,
    dateLabel: "Today",
  },
  {
    id: "2",
    title: "Escape Game",
    subtitle: "Résous les énigmes en équipe",
    location: "Ixelles",
    distanceKm: 3.8,
    category: "Jeux",
    isFree: false,
    isNew: false,
    dateLabel: "Cette semaine",
  },
  {
    id: "3",
    title: "Cinéma en plein air",
    subtitle: "Projection gratuite sous les étoiles",
    location: "Parc du Cinquantenaire",
    distanceKm: 2.0,
    category: "Cinéma",
    isFree: true,
    isNew: true,
    dateLabel: "Vendredi",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]); // pour l’instant juste local

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredActivities = useMemo(() => {
    return MOCK_ACTIVITIES.filter((activity) => {
      const q = search.trim().toLowerCase();

      if (q) {
        const haystack = `${activity.title} ${activity.subtitle} ${activity.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (activeFilters.includes("nearby") && activity.distanceKm > 3) {
        return false;
      }

      if (activeFilters.includes("free") && !activity.isFree) {
        return false;
      }

      if (activeFilters.includes("new") && !activity.isNew) {
        return false;
      }

      return true;
    });
  }, [search, activeFilters]);

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
            {/* à gauche, un spacer pour centrer le logo */}
            <View style={styles.headerSpacer} />

            <View style={styles.logoWrapper}>
              {Platform.OS === "web" ? (
                <Text style={[styles.logoText, WEB_LOGO_GRADIENT]}>
                  What2Do
                </Text>
              ) : (
                <MaskedView
                  maskElement={<Text style={styles.logoText}>What2Do</Text>}
                >
                  <LinearGradient
                    colors={["#A259FF", "#00A3FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.logoText, { opacity: 0 }]}>
                      What2Do
                    </Text>
                  </LinearGradient>
                </MaskedView>
              )}
            </View>

            {/* Coeur rouge → page favoris */}
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.8}
                onPress={() => router.push("./favorite/index")}
              >
                <Ionicons name="heart" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* TITRES */}
          <View style={styles.textBlock}>
            <Text style={styles.pageTitle}>Que faire aujourd&apos;hui ?</Text>
            <Text style={styles.pageSubtitle}>
              Des idées rapides et adaptées à tes envies autour de toi.
            </Text>
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
              placeholder="Search an activity"
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

          {/* FILTER CHIPS */}
          <View style={styles.chipsRow}>
            {FILTERS.map((filter) => {
              const active = activeFilters.includes(filter.key);
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => toggleFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* LISTE D’ACTIVITÉS */}
          <View style={styles.cardsList}>
            {filteredActivities.map((activity) => {
              const isFavorite = favoriteIds.includes(activity.id);

              return (
                <View key={activity.id} style={styles.card}>
                  {/* Bandeau image / illustration */}
                  <LinearGradient
                    colors={["#A259FF", "#00A3FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardBanner}
                  >
                    <View style={styles.cardBannerTopRow}>
                      <View style={styles.cardBadgesRow}>
                        <View style={styles.bannerBadge}>
                          <Text style={styles.bannerBadgeText}>
                            {activity.location}
                          </Text>
                        </View>
                        <View style={styles.bannerBadge}>
                          <Text style={styles.bannerBadgeText}>
                            {activity.distanceKm.toFixed(1)} km
                          </Text>
                        </View>
                      </View>

                      {/* coeur par carte (local pour le moment) */}
                      <TouchableOpacity
                        onPress={() => toggleFavorite(activity.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isFavorite ? "heart" : "heart-outline"}
                          size={18}
                          color={isFavorite ? "#F97373" : "#F9FAFB"}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardBannerBottom}>
                      <Text style={styles.cardTitle}>{activity.title}</Text>
                      <Text style={styles.cardDate}>{activity.dateLabel}</Text>
                    </View>
                  </LinearGradient>

                  {/* Contenu textuel */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardSubtitle}>
                      {activity.subtitle}
                    </Text>

                    <View style={styles.cardFooterRow}>
                      <TouchableOpacity
                        style={styles.cardPrimaryButton}
                        activeOpacity={0.9}
                        onPress={() =>
                          router.push({
                            pathname: "./(app)/activity",
                            params: { id: activity.id },
                          })
                        }
                      >
                        <Text style={styles.cardPrimaryButtonText}>
                          Découvrir
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.cardCategory}>
                        {activity.category}
                        {activity.isFree ? " • Gratuit" : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredActivities.length === 0 && (
              <Text style={styles.emptyText}>
                Aucun résultat ne correspond à ta recherche pour l&apos;instant.
              </Text>
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

  /* HEADER / TOPBAR */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 32,
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 32,
    color: COLORS.textPrimary,
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

  /* TITRES */
  textBlock: {
    marginTop: 12,
    gap: 4,
  },
  pageTitle: {
    ...TYPO.h1,
    color: COLORS.textPrimary,
  },
  pageSubtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },

  /* SEARCH BAR */
  searchContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141329",
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

  /* FILTER CHIPS */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.chipBg,
  },
  chipActive: {
    backgroundColor: COLORS.chipActiveBg,
    borderWidth: 1,
    borderColor: COLORS.chipActiveBorder,
  },
  chipText: {
    ...TYPO.button,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
  },

  /* CARDS */
  cardsList: {
    marginTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  cardBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardBannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBadgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  bannerBadge: {
    backgroundColor: "rgba(10,5,28,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bannerBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  cardBannerBottom: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  cardDate: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: COLORS.textPrimary,
  },

  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  cardSubtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrimaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  cardPrimaryButtonText: {
    ...TYPO.button,
    color: COLORS.textPrimary,
  },
  cardCategory: {
    ...TYPO.body,
    color: COLORS.textMuted,
  },

  emptyText: {
    marginTop: 16,
    ...TYPO.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
