import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { auth, db } from "../../firebase_Config";

type AccountType = "private" | "pro";

export default function EditProfileScreen() {
  const router = useRouter();
  
  // États pour les données utilisateur
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  
  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // États UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showSurveySection, setShowSurveySection] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const interestOptions = ["Cinéma", "Théâtre", "Sport", "Musée", "Sortie", "Bowling"];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setEmail(user.email || "");
      setUsername(user.displayName || "");

      // Charger les données Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCity(data.city || "");
        setAccountType(data.accountType || null);
        setInterests(data.interests || []);
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Le nom d'utilisateur est obligatoire.");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Vérifier si le username a changé
      if (username.trim().toLowerCase() !== user.displayName?.toLowerCase()) {
        // Vérifier si le nouveau username existe déjà
        const usersRef = collection(db, "users");
        const usernameQuery = query(usersRef, where("username", "==", username.trim().toLowerCase()));
        const querySnapshot = await getDocs(usernameQuery);
        
        if (!querySnapshot.empty) {
          setError("❌ Ce nom d'utilisateur est déjà utilisé.");
          setSaving(false);
          return;
        }

        // Mettre à jour le displayName dans Firebase Auth
        await updateProfile(user, { displayName: username.trim() });
      }

      // Mettre à jour dans Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: username.trim().toLowerCase(),
        displayName: username.trim(),
        city: city.trim(),
        accountType: accountType,
        interests: interests,
      });

      setSuccess("✅ Profil mis à jour avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      console.error("Error updating profile:", e);
      setError("❌ Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Tous les champs de mot de passe sont obligatoires.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) return;

      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Changer le mot de passe
      await updatePassword(user, newPassword);

      setSuccess("✅ Mot de passe modifié avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordSection(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      console.error("Error changing password:", e);
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("❌ Mot de passe actuel incorrect.");
      } else {
        setError("❌ Impossible de changer le mot de passe.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

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
              onPress={() => (router as any).push("/(tabs)/Profile")}
            >
              <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* MESSAGES */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

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
          </View>

          {/* INFORMATIONS DE BASE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations de base</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre nom"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
                editable={!saving}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
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
                editable={!saving}
              />
            </View>
          </View>

          {/* SECTION SONDAGE */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowSurveySection(!showSurveySection)}
            >
              <Text style={styles.sectionTitle}>Préférences du sondage</Text>
              <Icon
                name={showSurveySection ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {showSurveySection && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Type de compte</Text>
                  <View style={styles.accountTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.accountTypeButton,
                        accountType === "private" && styles.accountTypeButtonActive,
                      ]}
                      onPress={() => setAccountType("private")}
                      disabled={saving}
                    >
                      <Text
                        style={[
                          styles.accountTypeText,
                          accountType === "private" && styles.accountTypeTextActive,
                        ]}
                      >
                        🎉 Personnel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.accountTypeButton,
                        accountType === "pro" && styles.accountTypeButtonActive,
                      ]}
                      onPress={() => setAccountType("pro")}
                      disabled={saving}
                    >
                      <Text
                        style={[
                          styles.accountTypeText,
                          accountType === "pro" && styles.accountTypeTextActive,
                        ]}
                      >
                        💼 Professionnel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Centres d'intérêt</Text>
                  <View style={styles.chipsContainer}>
                    {interestOptions.map((interest) => {
                      const active = interests.includes(interest);
                      return (
                        <TouchableOpacity
                          key={interest}
                          onPress={() => toggleInterest(interest)}
                          style={[styles.chip, active && styles.chipActive]}
                          disabled={saving}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {interest}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* SECTION MOT DE PASSE */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
              <Icon
                name={showPasswordSection ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {showPasswordSection && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Mot de passe actuel</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre mot de passe actuel"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    editable={!saving}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nouveau mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez un nouveau mot de passe"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!saving}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmez le nouveau mot de passe"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    editable={!saving}
                  />
                </View>

                <TouchableOpacity
                  style={styles.secondaryButtonWrapper}
                  onPress={handleChangePassword}
                  disabled={saving}
                >
                  <View style={styles.secondaryButton}>
                    {saving ? (
                      <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                      <Text style={styles.secondaryButtonText}>Modifier le mot de passe</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* BOUTON SAUVEGARDER LE PROFIL */}
          <TouchableOpacity
            style={styles.saveButtonWrapper}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Sauvegarder le profil</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderWidth: 1,
    borderColor: "#34C759",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  successText: {
    color: "#34C759",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    marginBottom: 8,
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
    fontFamily: "Poppins-Regular",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  accountTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  accountTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.titleGradientStart,
  },
  accountTypeText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  accountTypeTextActive: {
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.titleGradientStart,
  },
  chipText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Medium",
  },
  secondaryButtonWrapper: {
    marginTop: 8,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  saveButtonWrapper: {
    marginTop: 8,
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
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});