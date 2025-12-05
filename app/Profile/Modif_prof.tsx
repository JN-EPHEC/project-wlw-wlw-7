import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_env";

export default function EditProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupérer les infos du user
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setEmail(user.email || "");
    }
  }, []);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Erreur", "Le nom d'utilisateur est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Mettre à jour le displayName dans Firebase Auth
      await updateProfile(user, { displayName: username.trim() });

      // Mettre à jour dans Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: username.trim(),
        city: city.trim(),
        bio: bio.trim(),
      });

      Alert.alert("Succès", "Profil mis à jour !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Error updating profile:", e);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* AVATAR SECTION */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {username.charAt(0).toUpperCase() || "U"}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre nom"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="Email"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                editable={false}
              />
              <Text style={styles.helperText}>
                L'email ne peut pas être modifié
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                placeholder="Bruxelles"
                placeholderTextColor={COLORS.textSecondary}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Parlez-nous de vous..."
                placeholderTextColor={COLORS.textSecondary}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* BOUTON SAUVEGARDER */}
            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "600",
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  saveButtonWrapper: {
    marginTop: 24,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  saveButton: {
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});