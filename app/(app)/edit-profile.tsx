// app/(app)/edit-profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { updateProfile } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  updatedAt?: Date;
  usernameLower?: string;
};

const ACCOUNT_TYPES = [
  { key: "solo", label: "Solo" },
  { key: "group", label: "En groupe" },
];

const INTERESTS = [
  "Bars",
  "Restaurants",
  "Cinéma",
  "Musées",
  "Concerts",
  "Escape Games",
  "Sport",
  "Randonnées",
  "Théâtre",
  "Jeux de société",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileDoc>({});
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [accountType, setAccountType] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as ProfileDoc);
          const data = snap.data() as ProfileDoc;
          setUsername(data.username || user.displayName || "");
          setPhotoUrl(data.photoURL || user.photoURL || "");
          setAccountType(data.accountType || null);
          setSelectedInterests(data.interests || []);
        } else {
          setUsername(user.displayName || "");
          setPhotoUrl(user.photoURL || "");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const displayName = useMemo(
    () => username || user?.displayName || "Utilisateur",
    [username, user?.displayName]
  );

  const avatarSource = useMemo(() => {
    const url = photoUrl || profile.photoURL || user?.photoURL;
    return url ? { uri: url } : null;
  }, [photoUrl, profile.photoURL, user?.photoURL]);

  const accountTypeLabel = accountType
    ? ACCOUNT_TYPE_LABELS[accountType] || accountType
    : "Non renseigné";

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
    setSuccess(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      setError("Merci d'indiquer un nom d'utilisateur.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const normalizedLower = normalizedUsername.toLowerCase();
      const existingUsernames = await getDocs(
        query(collection(db, "users"), where("usernameLower", "==", normalizedLower))
      );

      const conflict = existingUsernames.docs.find((doc) => doc.id !== user.uid);
      if (conflict) {
        setError("Ce nom d'utilisateur est déjà utilisé.");
        return;
      }

      const updates: ProfileDoc & { usernameLower?: string } = {
        username: normalizedUsername,
        usernameLower: normalizedLower,
        photoURL: photoUrl || null,
        accountType: accountType || null,
        interests: selectedInterests,
        updatedAt: new Date(),
      };

      await Promise.all([
        setDoc(doc(db, "users", user.uid), updates, { merge: true }),
        updateProfile(user, {
          displayName: normalizedUsername,
          photoURL: photoUrl || undefined,
        }),
      ]);

      setProfile((prev) => ({ ...prev, ...updates }));
      setSuccess(true);
    } catch (err) {
      console.error("Unable to update profile", err);
      setError("Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.sectionTitle}>Identité</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
            <TextInput
              placeholder="Ton nom d'utilisateur"
              placeholderTextColor="#6C6680"
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setSuccess(false);
              }}
              editable={!saving}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.infoLabel}>Photo de profil</Text>
            <TextInput
              placeholder="URL de ta photo"
              placeholderTextColor="#6C6680"
              style={styles.input}
              value={photoUrl}
              onChangeText={(text) => {
                setPhotoUrl(text);
                setSuccess(false);
              }}
              editable={!saving}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              Colle un lien d'image pour mettre à jour ta photo de profil.
            </Text>
          </View>
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
          <View style={styles.choices}>
            {ACCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.choice, accountType === type.key && styles.choiceActive]}
                onPress={() => {
                  setAccountType(type.key);
                  setSuccess(false);
                }}
                activeOpacity={0.9}
                disabled={saving}
              >
                <Text style={styles.choiceLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tes préférences</Text>
          {loading ? (
            <ActivityIndicator color="#9B5DE5" />
          ) : (
            <View style={styles.chipGrid}>
              {INTERESTS.map((item) => {
                const active = selectedInterests.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInterest(item)}
                    activeOpacity={0.85}
                    disabled={saving}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {!loading && selectedInterests.length === 0 && (
            <Text style={styles.emptyText}>Aucune préférence enregistrée.</Text>
          )}
        </View>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Profil mis à jour !</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, saving && styles.buttonDisabled]}
            activeOpacity={0.9}
            onPress={() => router.push("/(app)/premium")}
            disabled={saving}
          >
            <Text style={styles.secondaryButtonText}>Changer d'abonnement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.buttonDisabled]}
            activeOpacity={0.9}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Enregistrer</Text>
            )}
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
    paddingVertical: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  card: {
    backgroundColor: "#140E2B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#2A2140",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#3C276B",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  // email style for the small email text shown under the display name
  email: {
    color: "#B4ACC8",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  // added section container style used in the component
  section: {
    marginBottom: 12,
    gap: 12,
  },
  // added sectionTitle to fix the missing style reference
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#140E2B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3C276B",
  },
  chipActive: {
    backgroundColor: "#7B5CFF",
    borderColor: "#A685FF",
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emptyText: {
    color: "#B4ACC8",
    fontSize: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  input: {
    backgroundColor: "#0E0824",
    borderWidth: 1,
    borderColor: "#1F1A2F",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  helperText: {
    color: "#8B84A2",
    fontSize: 12,
  },
  choices: {
    flexDirection: "row",
    gap: 12,
  },
  choice: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2140",
    padding: 14,
    backgroundColor: "#0E0824",
    gap: 6,
  },
  choiceActive: {
    borderColor: "#7B5CFF",
    backgroundColor: "#130F32",
  },
  choiceLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4BB5F9",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1F1A2F",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E2452",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: "#2D0F1F",
    borderColor: "#F06366",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#F06366",
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: "#0F2D1F",
    borderColor: "#46E4D6",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    color: "#46E4D6",
    fontWeight: "700",
  },
});