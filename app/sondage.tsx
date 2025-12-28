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

import { COLORS } from "../components/Colors";
import { auth, db } from "../firebase_Config";

export default function SurveyScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<"personal" | "professional" | null>(null);

  // ========== QUESTIONS PERSO ==========
  const interestOptions = ["Cinéma", "Théâtre", "Sport", "Musée", "Sortie", "Bowling", "Restaurant", "Concert"];
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const cityOptions = ["Bruxelles", "Liège", "Anvers", "Gand", "Autre"];
  const [selectedCityOption, setSelectedCityOption] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState("");

  // ========== QUESTIONS PRO ==========
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

  // Charger le type de compte depuis Firestore
  useEffect(() => {
    const loadUserAccountType = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non connecté.");
        router.replace("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setAccountType(userData.accountType || "personal");
        } else {
          setAccountType("personal");
        }
      } catch (e) {
        console.error("Erreur chargement compte:", e);
        setAccountType("personal");
      } finally {
        setLoading(false);
      }
    };

    loadUserAccountType();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    // STEP 1 → STEP 2
    if (step === 1) {
      if (accountType === 'personal') {
        // Vérifier les centres d'intérêt
        if (selectedInterests.length === 0) {
          Alert.alert("Info", "Sélectionne au moins un centre d'intérêt.");
          return;
        }
      } else {
        // Vérifier le secteur
        if (!selectedSector) {
          Alert.alert("Info", "Choisis un secteur d'activité.");
          return;
        }
        if (selectedSector === "Autre" && !customSector.trim()) {
          Alert.alert("Info", "Indique ton secteur d'activité.");
          return;
        }
      }
      setStep(2);
      return;
    }

    // STEP 2 → ENVOI FIRESTORE
    if (step === 2) {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non connecté.");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);

        if (accountType === 'personal') {
          // Valider la ville
          if (!selectedCityOption) {
            Alert.alert("Info", "Choisis une ville.");
            return;
          }

          let finalCity = selectedCityOption;
          if (selectedCityOption === "Autre") {
            if (!customCity.trim()) {
              Alert.alert("Info", "Indique ta ville.");
              return;
            }
            finalCity = customCity.trim();
          }

          // Sauvegarder pour perso
          await updateDoc(userRef, {
            surveyCompleted: true,
            interests: selectedInterests,
            city: finalCity,
          });

          router.replace("/(tabs)/Home");

        } else {
          // Professionnel
          // Valider la taille d'équipe
          if (!selectedTeamSize) {
            Alert.alert("Info", "Choisis la taille de ton équipe.");
            return;
          }

          let finalSector = selectedSector;
          if (selectedSector === "Autre") {
            finalSector = customSector.trim();
          }

          // Sauvegarder pour pro
          await updateDoc(userRef, {
            surveyCompleted: true,
            businessSector: finalSector,
            teamSize: selectedTeamSize,
          });

          // Redirection vers Work in Progress
          router.replace("/work_in_progress");
        }
      } catch (e: any) {
        console.error(e);
        Alert.alert("Erreur", e.message || "Impossible d'enregistrer le sondage.");
      }
    }
  };

  // Loading
  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  // ========== RENDU POUR COMPTES PERSO ==========

  const renderPersonalStep1 = () => (
    <View>
      <Text style={styles.title}>Qu'est-ce qui t'intéresse ? 🎯</Text>
      <Text style={styles.subtitle}>
        Dis-nous ce que tu veux faire. On te proposera les meilleures idées autour de toi.
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
    </View>
  );

  const renderPersonalStep2 = () => (
    <View>
      <Text style={styles.title}>Tu es où ? 🌍</Text>
      <Text style={styles.subtitle}>
        On a besoin de ta ville pour te proposer des idées vraiment proches de toi.
      </Text>

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
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Indique ta ville</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Namur"
            placeholderTextColor={COLORS.textSecondary}
            value={customCity}
            onChangeText={setCustomCity}
          />
        </View>
      )}
    </View>
  );

  // ========== RENDU POUR COMPTES PRO ==========

  const renderProfessionalStep1 = () => (
    <View>
      <Text style={styles.title}>Dans quel secteur opères-tu ? 💼</Text>
      <Text style={styles.subtitle}>
        Ça nous aidera à te proposer des activités adaptées à ton domaine.
      </Text>

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
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Indique ton secteur</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Énergie, Transport..."
            placeholderTextColor={COLORS.textSecondary}
            value={customSector}
            onChangeText={setCustomSector}
          />
        </View>
      )}
    </View>
  );

  const renderProfessionalStep2 = () => (
    <View>
      <Text style={styles.title}>Quelle est la taille de ton équipe ? 👥</Text>
      <Text style={styles.subtitle}>
        On adaptera nos suggestions selon la taille de ton groupe.
      </Text>

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
  );

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
        >
          {/* Badge du type de compte */}
          <View style={styles.accountBadge}>
            <Text style={styles.accountBadgeText}>
              Compte {accountType === "personal" ? "Personnel 🎉" : "Professionnel 💼"}
            </Text>
          </View>

          {/* Rendu conditionnel selon le type de compte */}
          {accountType === 'personal' ? (
            <>
              {step === 1 && renderPersonalStep1()}
              {step === 2 && renderPersonalStep2()}
            </>
          ) : (
            <>
              {step === 1 && renderProfessionalStep1()}
              {step === 2 && renderProfessionalStep2()}
            </>
          )}

          <TouchableOpacity style={styles.buttonWrapper} onPress={handleContinue}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {step === 2 ? "Terminer" : "Continuer"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ---------- STYLES ----------

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: "flex-start",
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
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 26,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  // Chips
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 24,
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

  // Input
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },

  // Button
  buttonWrapper: {
    marginTop: 24,
    borderRadius: 999,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});