import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
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
import { auth, db } from "../firebase_Config"; // assure-toi que le fichier s'appelle bien comme ça

type AccountType = "private" | "pro";

export default function SurveyScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Étape 1
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  // Étape 2
  const interestOptions = ["Cinéma", "Théâtre", "Sport", "Musée", "Sortie", "Bowling"];
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Étape 3
  const cityOptions = ["Bruxelles", "Liège", "Anvers", "Gand", "Autre"];
  const [selectedCityOption, setSelectedCityOption] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState("");

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    console.log("▶ handleContinue step =", step);

    // STEP 1 → STEP 2
    if (step === 1) {
      if (!accountType) {
        Alert.alert("Info", "Choisis une option pour continuer.");
        return;
      }
      setStep(2);
      return;
    }

    // STEP 2 → STEP 3
    if (step === 2) {
      if (selectedInterests.length === 0) {
        Alert.alert("Info", "Sélectionne au moins un centre d’intérêt.");
        return;
      }
      setStep(3);
      return;
    }

    // STEP 3 → ENVOI FIRESTORE
    if (step === 3) {
      if (!selectedCityOption) {
        Alert.alert("Info", "Choisis une ville ou 'Autre'.");
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

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non connecté.");
        console.log("❌ Pas de user auth.currentUser dans survey");
        return;
      }

      try {
        console.log("▶ Updating user doc in Firestore...", user.uid);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          surveyCompleted: true,
          accountType: accountType,
          interests: selectedInterests,
          city: finalCity,
        });
        console.log("✅ Firestore survey updated");

        if (accountType === "private") {
          console.log("▶ Redirecting to ./tabs/Home");
          router.replace("./tabs/Home");
        } else {
          console.log("▶ Redirecting to /work_in_progress");
          router.replace("/work_in_progress");
        }
      } catch (e: any) {
        console.error("❌ Error in survey handleContinue:", e);
        Alert.alert("Erreur", e.message || "Impossible d’enregistrer le sondage.");
      }
    }
  };

  // ---------- RENDU STEP 1 ----------

  const renderStep1 = () => (
    <View>
      <Text style={styles.title}>Bienvenue 👋</Text>
      <Text style={styles.subtitle}>
        Dis-nous comment tu veux utiliser What2do. On personnalise tout pour toi
      </Text>

      <SelectableAccountCard
        type="private"
        selected={accountType}
        onSelect={setAccountType}
        emoji="🎉"
        title="Personnel"
        desc="Pour organiser tes sorties, jeux, anniversaires, soirées..."
      />

      <SelectableAccountCard
        type="pro"
        selected={accountType}
        onSelect={setAccountType}
        emoji="💼"
        title="Professionnel"
        desc="Pour l’équipe, les afterworks, les activités de cohésion, etc."
      />
    </View>
  );

  // ---------- RENDU STEP 2 ----------

  const renderStep2 = () => (
    <View>
      <Text style={styles.title}>Qu’est-ce qui t’intéresse ?</Text>
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

  // ---------- RENDU STEP 3 ----------

  const renderStep3 = () => (
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
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <TouchableOpacity style={styles.buttonWrapper} onPress={handleContinue}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {step === 3 ? "Terminer" : "Continuer"}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ---------- COMPOSANT CARTE AVEC GRADIENT + ANIMATION ----------

type CardProps = {
  type: AccountType;
  selected: AccountType | null;
  onSelect: (type: AccountType) => void;
  emoji: string;
  title: string;
  desc: string;
};

function SelectableAccountCard({
  type,
  selected,
  onSelect,
  emoji,
  title,
  desc,
}: CardProps) {
  const isSelected = selected === type;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: isSelected ? 1.03 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isSelected ? 1 : 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected, scaleAnim, opacityAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() => onSelect(type)}
    >
      <Animated.View
        style={[
          styles.cardAnimated,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {isSelected ? (
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.card, styles.cardGradient]}
          >
            <Text style={styles.cardEmoji}>{emoji}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.card, styles.cardBase]}>
            <Text style={styles.cardEmoji}>{emoji}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ---------- STYLES ----------

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: "flex-start",
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
  },

  // Cards
  cardWrapper: {
    marginBottom: 18,
  },
  cardAnimated: {
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  cardBase: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardGradient: {
    borderWidth: 2,
    borderColor: COLORS.titleGradientStart,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: COLORS.textSecondary,
    width: "95%",
  },

  // Chips (step 2 & 3)
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
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

  // Input (step 3)
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
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});
