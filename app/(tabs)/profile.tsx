import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useAuthStore } from "@/store/useAuthStore";

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
};

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "reminders",
    label: "Rappels d'activités",
    description: "Reçois un rappel la veille de tes sorties planifiées.",
    defaultValue: true,
  },
  {
    id: "polls",
    label: "Votes de groupes",
    description: "Sois averti quand un nouveau sondage est lancé dans tes groupes.",
    defaultValue: true,
  },
  {
    id: "news",
    label: "Nouveautés",
    description: "Promotions, nouveaux spots et idées de sorties personnalisées.",
    defaultValue: false,
  },
];

const DEFAULT_PROFILE = {
  name: "Camille Dupont",
  role: "Exploratrice urbaine",
  location: "Paris, France",
  plan: "Plan Découverte",
  persona: "Personnel",
  interests: ["Foodies", "Art & culture", "Afterwork"],
};

type QuickAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function ProfileScreen() {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const { profile, preferredName } = useAuthStore();
  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>(() =>
    NOTIFICATION_SETTINGS.reduce(
      (acc, setting) => ({ ...acc, [setting.id]: setting.defaultValue }),
      {} as Record<string, boolean>,
    ),
  );

  const userProfile = useMemo(
    () => ({
      name: profile?.displayName ?? preferredName ?? DEFAULT_PROFILE.name,
      role: profile?.bio?.trim() || DEFAULT_PROFILE.role,
      location: profile?.city ?? DEFAULT_PROFILE.location,
      plan: DEFAULT_PROFILE.plan,
      persona: profile?.persona ?? DEFAULT_PROFILE.persona,
      interests:
        profile?.interests && profile.interests.length > 0
          ? profile.interests
          : DEFAULT_PROFILE.interests,
    }),
    [preferredName, profile],
  );

  const avatarLabel = useMemo(() => {
    const parts = userProfile.name
      .split(" ")
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase())
      .join("");

    return parts.slice(0, 2) || "WD";
  }, [userProfile.name]);

  const stats = useMemo(
    () => [
      { id: "favorites", label: "Favoris", value: favoritesCount.toString(), accent: "#fcd29c" },
      { id: "events", label: "Sorties organisées", value: "12", accent: "#7fe3ff" },
      { id: "recommendations", label: "Idées suivies", value: "34", accent: "#c7b8ff" },
    ],
    [favoritesCount],
  );

  const completedSections = useMemo(() => 2 + (favoritesCount > 0 ? 1 : 0), [favoritesCount]);
  const completionRatio = completedSections / 3;

  const quickActions: QuickAction[] = [
    {
      id: "preferences",
      label: "Modifier mes préférences",
      icon: "color-wand-outline",
      onPress: () => router.push("/index"),
    },
    {
      id: "favorites",
      label: "Voir mes favoris",
      icon: "heart-outline",
      onPress: () => router.push("/favorites"),
    },
    {
      id: "groups",
      label: "Gérer mes groupes",
      icon: "people-outline",
      onPress: () => router.push("/groups/new"),
    },
  ];

  const toggleNotification = (id: string) =>
    setNotificationPrefs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{avatarLabel}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.role}>{userProfile.role}</Text>
            <Text style={styles.meta}>{userProfile.location}</Text>
          </View>
          <Pressable style={styles.planPill}>
            <Text style={styles.planPillText}>{userProfile.plan}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progression du profil</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionRatio * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {completedSections}/3 sections complétées · ajoute des favoris pour débloquer plus de recommandations
          </Text>
        </View>

        <View style={[styles.section, { gap: 12 }]}> 
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={[styles.statBadge, { backgroundColor: `${stat.accent}30` }]}>
                  <Text style={[styles.statBadgeLabel, { color: stat.accent }]}>{stat.value}</Text>
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
@@ -147,53 +174,53 @@ export default function ProfileScreen() {
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <Pressable key={action.id} style={styles.quickActionCard} onPress={action.onPress}>
                <Ionicons name={action.icon} size={20} color="#5ea1ff" />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Préférences</Text>
              <Text style={styles.sectionSubtitle}>Personnalise ton expérience en fonction de tes envies</Text>
            </View>
            <Pressable style={styles.editButton} onPress={() => router.push("/index")}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </Pressable>
          </View>
          <View style={styles.preferenceChips}>
            <View style={styles.personaPill}>
              <Text style={styles.personaLabel}>{userProfile.persona}</Text>
            </View>
            {userProfile.interests.map((interest) => (
              <View key={interest} style={styles.preferenceChip}>
                <Text style={styles.preferenceChipLabel}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { gap: 16 }]}> 
          <Text style={styles.sectionTitle}>Notifications</Text>
          {NOTIFICATION_SETTINGS.map((setting) => (
            <View key={setting.id} style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={notificationPrefs[setting.id]}
                onValueChange={() => toggleNotification(setting.id)}
                trackColor={{ true: "#5ea1ff", false: "#2a2f45" }}
                thumbColor="#fff"
              />
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
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#151a2f",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#5ea1ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: "#0f1220",
    fontSize: 24,
    fontWeight: "800",
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  role: {
    color: "#aab4ce",
    fontSize: 14,
    marginTop: 2,
  },
  meta: {
    color: "#7d85a6",
    fontSize: 13,
    marginTop: 2,
  },
  planPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(94, 161, 255, 0.15)",
  },
  planPillText: {
    color: "#5ea1ff",
    fontWeight: "700",
    fontSize: 13,
  },
  section: {
    backgroundColor: "#11152a",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: "#7d85a6",
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#1a2038",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5ea1ff",
  },
  progressLabel: {
    color: "#97a0be",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#151a32",
    borderRadius: 18,
    paddingVertical: 16,
  },
  statBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statBadgeLabel: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#9aa3c1",
    fontSize: 13,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    flexBasis: "48%",
    backgroundColor: "#151a32",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  quickActionLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  preferenceChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  personaPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(127,227,255,0.18)",
  },
  personaLabel: {
    color: "#7fe3ff",
    fontWeight: "700",
  },
  preferenceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#161b33",
  },
  preferenceChipLabel: {
    color: "#d8e0ff",
    fontSize: 13,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  settingDescription: {
    color: "#7d85a6",
    fontSize: 13,
    marginTop: 2,
  },
});