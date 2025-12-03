// app/(app)/edit-profile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";
import { useAuth } from "./lib/auth-context";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  solo: "Solo",
  group: "En groupe",
};

type ProfileDoc = {
  username?: string;
  accountType?: string | null;
  interests?: string[];
  photoURL?: string | null;
  updatedAt?: any;
  usernameLower?: string;
  subscriptionStatus?: "free" | "premium" | string;
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
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const usernameInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as ProfileDoc;
          setProfile(data);
          setUsername(data.username || user.displayName || "");
          setPhotoUrl(data.photoURL || user.photoURL || "");
          setAccountType(data.accountType || null);
          setSelectedInterests(data.interests || []);
        } else {
          setUsername(user.displayName || "");
          setPhotoUrl(user.photoURL || "");
        }
      } catch (err) {
        console.error("Unable to load profile", err);
        setError("Impossible de charger ton profil.");
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

  const avatarSource: ImageSourcePropType | undefined = useMemo(() => {
    const url = photoUrl || profile.photoURL || user?.photoURL;
    return url ? { uri: url } : undefined;
  }, [photoUrl, profile.photoURL, user?.photoURL]);

  const accountTypeLabel = accountType
    ? ACCOUNT_TYPE_LABELS[accountType] || accountType
    : "Non renseigné";

  const subscriptionLabel =
    profile.subscriptionStatus === "premium" ? "Premium" : "Free";

  const subscriptionBadgeStyle =
    profile.subscriptionStatus === "premium"
      ? styles.subscriptionBadgePremium
      : styles.subscriptionBadgeFree;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
    setError(null);
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

      // Vérifier l’unicité du username
      const existingUsernames = await getDocs(
        query(
          collection(db, "users"),
          where("usernameLower", "==", normalizedLower)
        )
      );

      if (!existingUsernames.empty) {
        const clash = existingUsernames.docs.find(
          (d) => d.id !== user.uid
        );
        if (clash) {
          setError("Ce nom d'utilisateur est déjà pris.");
          setSaving(false);
          return;
        }
      }

      const updates: ProfileDoc = {
        username: normalizedUsername,
        usernameLower: normalizedLower,
        photoURL: photoUrl.trim() || null,
        accountType: accountType || null,
        interests: selectedInterests,
        updatedAt: new Date(),
      };

      await Promise.all([
        setDoc(doc(db, "users", user.uid), updates, { merge: true }),
        updateProfile(user, {
          displayName: normalizedUsername,
          photoURL: photoUrl.trim() || undefined,
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

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Active l'accès à la caméra dans tes réglages pour prendre une photo."
      );
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Active l'accès à ta galerie pour choisir une photo."
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const allowed = await requestCameraPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUrl(result.assets[0].uri);
      setError(null);
      setSuccess(false);
    }
  };

  const handlePickImage = async () => {
    const allowed = await requestLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUrl(result.assets[0].uri);
      setError(null);
      setSuccess(false);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert("Photo de profil", "Comment veux-tu changer ta photo ?", [
      { text: "Prendre une photo", onPress: handleTakePhoto },
      { text: "Choisir dans la galerie", onPress: handlePickImage },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Modifier le mot de passe",
      "Cette action ouvrira la mise à jour du mot de passe dans l'application."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.safeArea}
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
          <Text style={styles.title}>Mon profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Card profil */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.9}
            onPress={handleAvatarPress}
            disabled={saving}
          >
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="pencil" size={16} color="#050013" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{displayName}</Text>

          <View style={[styles.subscriptionBadge, subscriptionBadgeStyle]}>
            <Text style={styles.subscriptionText}>{subscriptionLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>
              {user?.email || "Non renseigné"}
            </Text>
          </View>
          <Text style={styles.helperText}>
            L&apos;email est lié à ton compte et n&apos;est pas modifiable.
          </Text>
        </View>

        {/* Nom d'utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nom d&apos;utilisateur</Text>
          <View style={styles.fieldGroup}>
            <View style={styles.inputWithIcon}>
              <TextInput
                ref={usernameInputRef}
                placeholder="Ton nom d'utilisateur"
                placeholderTextColor="#6C6680"
                style={[styles.input, styles.inputPaddingRight]}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setError(null);
                  setSuccess(false);
                }}
                editable={!saving}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => usernameInputRef.current?.focus()}
                activeOpacity={0.9}
                disabled={saving}
              >
                <Ionicons name="pencil" size={16} color="#CFC8E6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              C&apos;est le nom visible par les autres utilisateurs.
            </Text>
          </View>
        </View>

        {/* Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type de compte</Text>
            <Text style={styles.infoValue}>{accountTypeLabel}</Text>
          </View>

          <View style={styles.choices}>
            {ACCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.choice,
                  accountType === type.key && styles.choiceActive,
                ]}
                onPress={() => {
                  setAccountType(type.key);
                  setError(null);
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

        {/* Sécurité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.9}
            onPress={handleChangePassword}
            disabled={saving}
          >
            <Ionicons name="lock-closed" size={16} color="#CFC8E6" />
            <Text style={styles.outlineButtonText}>
              Modifier mon mot de passe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.9}
            onPress={() => setPreferencesOpen((prev) => !prev)}
            disabled={loading || saving}
          >
            <Ionicons name="options" size={16} color="#CFC8E6" />
            <Text style={styles.outlineButtonText}>
              {preferencesOpen
                ? "Fermer mes préférences"
                : "Modifier mes préférences"}
            </Text>
          </TouchableOpacity>

          {preferencesOpen && (
            <>
              {loading ? (
                <ActivityIndicator color="#9B5DE5" />
              ) : (
                <View style={styles.chipGrid}>
                  {INTERESTS.map((item) => {
                    const active = selectedInterests.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chip,
                          active && styles.chipActive,
                        ]}
                        onPress={() => toggleInterest(item)}
                        activeOpacity={0.85}
                        disabled={saving}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {!loading && selectedInterests.length === 0 && (
                <Text style={styles.emptyText}>
                  Aucune préférence enregistrée.
                </Text>
              )}
            </>
          )}
        </View>

        {/* Messages d'erreur / succès */}
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

        {/* Boutons bas de page */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              saving && styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={() => router.push("/premium")}
            disabled={saving}
          >
            <Text style={styles.secondaryButtonText}>
              Changer d'abonnement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              saving && styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator />
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
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F1A2F",
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
    position: "relative",
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
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#7C5BFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A051C",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  section: {
    backgroundColor: "#0A051C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    padding: 16,
    gap: 12,
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  subscriptionBadgeFree: {
    backgroundColor: "#0E1F29",
    borderColor: "#46E4D6",
  },
  subscriptionBadgePremium: {
    backgroundColor: "#24103E",
    borderColor: "#E4C046",
  },
  subscriptionText: {
    color: "#FFFFFF",
    fontWeight: "700",
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
  emptyText: {
    color: "#B4ACC8",
    fontSize: 14,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  inputWithIcon: {
    position: "relative",
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
  inputPaddingRight: {
    paddingRight: 44,
  },
  editIcon: {
    position: "absolute",
    right: 12,
    top: 8,
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1232",
    borderWidth: 1,
    borderColor: "#2E2452",
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
  outlineButton: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2E2452",
    backgroundColor: "#0E0824",
  },
  outlineButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    marginTop: 8,
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
    fontWeight: "600",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorBox: {
    marginTop: 8,
    backgroundColor: "#3B1A2A",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FF4D6A",
  },
  errorText: {
    color: "#FFD0DA",
    fontSize: 13,
  },
  successBox: {
    marginTop: 8,
    backgroundColor: "#17312C",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#46E4D6",
  },
  successText: {
    color: "#CCFFF7",
    fontSize: 13,
  },
});
