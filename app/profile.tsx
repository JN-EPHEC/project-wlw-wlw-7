// app/(app)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";
import { useAuth } from "./lib/auth-context";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  personnel: "Personnel",
  professionnel: "Professionnel",
};

type ProfileDoc = {
  accountType?: string | null;
  interests?: string[];
  city?: string;
  subscriptionStatus?: "free" | "premium" | string;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      setError(null);
      setLoadingProfile(true);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as ProfileDoc);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.log("Unable to load profile", err);
        setError("Impossible de charger tes informations.");
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Utilisateur";

  const accountTypeLabel = profile?.accountType
    ? ACCOUNT_TYPE_LABELS[profile.accountType] || profile.accountType
    : "Non renseigné";

  const interests = profile?.interests || [];
  const city = profile?.city || "Non renseignée";
  const subscriptionLabel =
    profile?.subscriptionStatus === "premium" ? "Premium" : "Free";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Carte profil */}
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{subscriptionLabel}</Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              activeOpacity={0.9}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.actionText}>Modifier mon profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              activeOpacity={0.9}
              onPress={logout}
            >
              <Text style={styles.actionText}>Se déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.premiumButton]}
              activeOpacity={0.9}
              onPress={() => router.push("/premium")}
            >
              <Text style={styles.actionText}>Passer en premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Carte préférences */}
        <View style={styles.preferencesCard}>
          <View style={styles.preferencesHeader}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            {loadingProfile && (
              <ActivityIndicator size="small" color="#7C5BBF" />
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type de compte</Text>
            <Text style={styles.infoValue}>{accountTypeLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ville</Text>
            <Text style={styles.infoValue}>{city}</Text>
          </View>

          <View style={styles.interestsBlock}>
            <Text style={styles.infoLabel}>Centres d’intérêt</Text>

            {interests.length === 0 ? (
              <Text style={styles.infoValue}>
                Aucun centre d’intérêt renseigné.
              </Text>
            ) : (
              <View style={styles.chipsWrapper}>
                {interests.map((interest) => (
                  <View key={interest} style={styles.chip}>
                    <Text style={styles.chipText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A1A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: "#0A051C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3C276B",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    marginBottom: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1C0F3A",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    color: "#B4ACC8",
    fontSize: 14,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#1C0F3A",
  },
  badgeText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  editButton: {
    backgroundColor: "#7C5BBF",
  },
  logoutButton: {
    backgroundColor: "#F06366",
  },
  premiumButton: {
    backgroundColor: "#4BB5F9",
  },
  preferencesCard: {
    backgroundColor: "#0A051C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3C276B",
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 14,
  },
  preferencesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: "#B4ACC8",
    fontSize: 14,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  interestsBlock: {
    gap: 8,
    marginTop: 4,
  },
  chipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: "#1C0F3A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3C276B",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    color: "#F87171",
    fontSize: 13,
  },
});
