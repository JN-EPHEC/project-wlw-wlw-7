// app/(app)/edit-profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../lib/auth-context";
import { db } from "../lib/firebaseConfig";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  solo: "Solo",
  group: "En groupe",
};

type ProfileDoc = {
  username?: string;
  accountType?: string | null;
  interests?: string[];
  photoURL?: string | null;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileDoc>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as ProfileDoc);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const displayName = useMemo(
    () => profile.username || user?.displayName || "Utilisateur",
    [profile.username, user?.displayName]
  );

  const avatarSource = useMemo(() => {
    const url = profile.photoURL || user?.photoURL;
    return url ? { uri: url } : null;
  }, [profile.photoURL, user?.photoURL]);

  const interests = profile.interests || [];
  const accountTypeLabel = profile.accountType
    ? ACCOUNT_TYPE_LABELS[profile.accountType] || profile.accountType
    : "Non renseigné";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Mon profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de connexion</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || "Non renseigné"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type de compte</Text>
            <Text style={styles.infoValue}>{accountTypeLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tes préférences</Text>
          {loading ? (
            <ActivityIndicator color="#9B5DE5" />
          ) : interests.length > 0 ? (
            <View style={styles.chipGrid}>
              {interests.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucune préférence enregistrée.</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.9}
          onPress={() => router.push("/(app)/premium")}
        >
          <Text style={styles.primaryButtonText}>Changer d'abonnement</Text>
        </TouchableOpacity>
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
    paddingVertical: 24,
    gap: 20,
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
    borderColor: "#1F1A2F",
    backgroundColor: "#0D081F",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: "#0A051C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3C276B",
    padding: 20,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  avatarWrapper: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#140E2B",
    borderWidth: 1,
    borderColor: "#2E2452",
  },
  avatarPlaceholder: {
    height: 86,
    width: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C0F3A",
    borderWidth: 1,
    borderColor: "#7848FF",
  },
  avatarImage: {
    height: 86,
    width: 86,
    borderRadius: 43,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    color: "#B4ACC8",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#0A051C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#140E2B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3C276B",
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyText: {
    color: "#B4ACC8",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#4BB5F9",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});