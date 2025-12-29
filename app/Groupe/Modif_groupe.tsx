import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { auth, db } from "../../firebase_Config";

export default function EditProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // États du profil
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<"personal" | "professional">("personal");

  // ✅ NOUVEAUX INTÉRÊTS - 20 OPTIONS AU LIEU DE 8
  const interestOptions = [
    // Culture & Art
    "Cinéma", "Théâtre", "Musée", "Art", "Concert",
    
    // Sport & Aventure
    "Sport", "Escalade", "Bowling", "Yoga", "Running",
    
    // Social & Soirées
    "Sortie", "Danse", "Festival", "Karaoké",
    
    // Découverte & Nature
    "Nature", "Randonnée", "Balade", 
    
    // Food & Boissons
    "Restaurant", "Cuisine", "Dégustation"
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const cityOptions = ["Bruxelles", "Liège", "Anvers", "Gand", "Autre"];
  const [selectedCityOption, setSelectedCityOption] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState("");

  // États PRO
  const sectorOptions = [
    "Tech & IT",
    "Finance & Banque",
    "Commerce & Retail",
    "Santé",
    "Éducation",
    "Construction",
    "Restauration & Hôtellerie",
    "Marketing & Communication",
    "Juridique",
    "Autre"
  ];
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [customSector, setCustomSector] = useState("");

  const teamSizeOptions = [
    "1-10 employés",
    "11-50 employés",
    "51-200 employés",
    "201-500 employés",
    "500+ employés"
  ];
  const [selectedTeamSize, setSelectedTeamSize] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      router.back();
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      
      if (!userDoc.exists()) {
        Alert.alert("Erreur", "Profil introuvable");
        router.back();
        return;
      }

      const userData = userDoc.data();
      
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setAccountType(userData.accountType || "personal");

      // Charger selon le type de compte
      if (userData.accountType === "personal") {
        setSelectedInterests(userData.interests || []);
        
        const userCity = userData.city || "";
        if (cityOptions.includes(userCity)) {
          setSelectedCityOption(userCity);
        } else if (userCity) {
          setSelectedCityOption("Autre");
          setCustomCity(userCity);
        }
      } else {
        // Professionnel
        const sector = userData.businessSector || "";
        if (sectorOptions.includes(sector)) {
          setSelectedSector(sector);
        } else if (sector) {
          setSelectedSector("Autre");
          setCustomSector(sector);
        }
        
        setSelectedTeamSize(userData.teamSize || null);
      }

    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Erreur", "Impossible de charger le profil");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) 
        ? prev.filter((i) => i !== interest) 
        : [...prev, interest]
    );
  };

  const saveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Validation commune
    if (!username.trim()) {
      Alert.alert("Erreur", "Le nom d'utilisateur ne peut pas être vide");
      return;
    }

    // Validation selon le type de compte
    if (accountType === "personal") {
      if (selectedInterests.length < 2) {
        Alert.alert("Info", "Sélectionne au moins 2 centres d'intérêt pour de meilleures recommandations");
        return;
      }

      if (!selectedCityOption) {
        Alert.alert("Info", "Choisis une ville");
        return;
      }

      if (selectedCityOption === "Autre" && !customCity.trim()) {
        Alert.alert("Info", "Indique ta ville");
        return;
      }
    } else {
      // Professionnel
      if (!selectedSector) {
        Alert.alert("Info", "Choisis un secteur d'activité");
        return;
      }

      if (selectedSector === "Autre" && !customSector.trim()) {
        Alert.alert("Info", "Indique ton secteur d'activité");
        return;
      }

      if (!selectedTeamSize) {
        Alert.alert("Info", "Choisis la taille de ton équipe");
        return;
      }
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      
      if (accountType === "personal") {
        let finalCity = selectedCityOption;
        if (selectedCityOption === "Autre") {
          finalCity = customCity.trim();
        }

        await updateDoc(userRef, {
          username: username.trim(),
          interests: selectedInterests,
          city: finalCity,
        });
      } else {
        // Professionnel
        let finalSector = selectedSector;
        if (selectedSector === "Autre") {
          finalSector = customSector.trim();
        }

        await updateDoc(userRef, {
          username: username.trim(),
          businessSector: finalSector,
          teamSize: selectedTeamSize,
        });
      }

      Alert.alert("Succès", "Profil mis à jour ! 🎉", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
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
          keyboardShouldPersistTaps="handled"
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

          {/* BADGE TYPE DE COMPTE */}
          <View style={styles.accountBadge}>
            <Text style={styles.accountBadgeText}>
              Compte {accountType === "personal" ? "Personnel 🎉" : "Professionnel 💼"}
            </Text>
          </View>

          {/* NOM D'UTILISATEUR */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Ton nom"
              placeholderTextColor={COLORS.textSecondary}
              value={username}
              onChangeText={setUsername}
              maxLength={30}
            />
          </View>

          {/* EMAIL (NON MODIFIABLE) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{email}</Text>
              <Icon name="lock-closed" size={16} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.helperText}>
              L'email ne peut pas être modifié
            </Text>
          </View>

          {/* SECTION COMPTE PERSONNEL */}
          {accountType === "personal" && (
            <>
              {/* INTÉRÊTS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
                <Text style={styles.subtitle}>
                  Choisis au moins 2 activités pour de meilleures recommandations
                </Text>
                
                <View style={styles.chipsContainer}>
                  {interestOptions.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <TouchableOpacity
                        key={interest}
                        onPress={() => toggleInterest(interest)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {interest}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedInterests.length > 0 && (
                  <Text style={styles.selectionCount}>
                    {selectedInterests.length} intérêt{selectedInterests.length > 1 ? 's' : ''} sélectionné{selectedInterests.length > 1 ? 's' : ''}
                  </Text>
                )}
              </View>

              {/* VILLE */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ville</Text>
                <View style={styles.chipsContainer}>
                  {cityOptions.map((city) => {
                    const active = selectedCityOption === city;
                    return (
                      <TouchableOpacity
                        key={city}
                        onPress={() => setSelectedCityOption(city)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {city}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedCityOption === "Autre" && (
                  <TextInput
                    style={[styles.input, { marginTop: 12 }]}
                    placeholder="Ex : Namur"
                    placeholderTextColor={COLORS.textSecondary}
                    value={customCity}
                    onChangeText={setCustomCity}
                  />
                )}
              </View>
            </>
          )}

          {/* SECTION COMPTE PROFESSIONNEL */}
          {accountType === "professional" && (
            <>
              {/* SECTEUR */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Secteur d'activité</Text>
                <View style={styles.chipsContainer}>
                  {sectorOptions.map((sector) => {
                    const active = selectedSector === sector;
                    return (
                      <TouchableOpacity
                        key={sector}
                        onPress={() => setSelectedSector(sector)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {sector}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedSector === "Autre" && (
                  <TextInput
                    style={[styles.input, { marginTop: 12 }]}
                    placeholder="Ex : Énergie, Transport..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={customSector}
                    onChangeText={setCustomSector}
                  />
                )}
              </View>

              {/* TAILLE DE L'ÉQUIPE */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Taille de l'équipe</Text>
                <View style={styles.chipsContainer}>
                  {teamSizeOptions.map((size) => {
                    const active = selectedTeamSize === size;
                    return (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setSelectedTeamSize(size)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* BOUTONS */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={saveProfile}
              disabled={saving}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>Enregistrement...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="checkmark" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </>
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  accountBadge: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    marginBottom: 24,
  },
  accountBadgeText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  inputDisabled: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputDisabledText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  selectionCount: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  saveButtonWrapper: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
  saveButton: {
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});