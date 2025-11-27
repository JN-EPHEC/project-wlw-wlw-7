// app/(auth)/register-next.tsx
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
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

const COLORS = {
  backgroundStart: "#110A1E",
  backgroundEnd: "#0A0612",
  primary: "#3A2A60",
  secondary: "#B57BFF",
  logoStart: "#A259FF",
  logoEnd: "#00A3FF",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textDisabled: "#6B7280",
  chipBg: "#141329",
  chipSelectedBg: "#3A2A60",
  chipSelectedBorder: "#B57BFF",
  inputBackground: "#1F1833",
  neutralGray800: "#1F2937",
};

const TYPO = {
  h1: { fontFamily: "Poppins-Bold" as const, fontSize: 28 },
  body: { fontFamily: "Poppins-Regular" as const, fontSize: 15 },
  button: { fontFamily: "Poppins-SemiBold" as const, fontSize: 16 },
  label: { fontFamily: "Poppins-Medium" as const, fontSize: 14 },
};

const INTERESTS = [
  "Cinéma",
  "Théâtre",
  "Sport",
  "Musée",
  "Sorties",
  "Bowling",
  "Restaurants",
  "Jeux de société",
  "Soirées",
  "Concerts",
  "Randonnée",
  "Voyages",
];

export default function RegisterNextScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<"personnel" | "professionnel" | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    // si quelqu’un arrive ici sans être connecté -> retour login
    router.replace("/login");
    return null;
  }

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const canContinue =
    (step === 1 && !!accountType) ||
    (step === 2 && interests.length > 0) ||
    (step === 3 && city.trim().length > 1);

  const handleNext = async () => {
    if (!canContinue) return;

    if (step < 3) {
      setStep((prev) => (prev + 1) as 2 | 3);
      return;
    }

    // Dernière étape -> on sauvegarde en base
    try {
      setSaving(true);
      setError(null);

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          accountType,
          interests,
          city: city.trim(),
          onboardingCompleted: true,
        },
        { merge: true }
      );

      router.replace("/home");
    } catch (e) {
      console.error(e);
      setError("Impossible d'enregistrer vos préférences pour le moment.");
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>Bienvenue 👋</Text>
          <Text style={styles.subtitle}>
            Dis-nous comment tu veux utiliser What2Do. On personnalise tout pour toi.
          </Text>

          <View style={styles.cardsContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.card,
                accountType === "personnel" && styles.cardSelected,
              ]}
              onPress={() => setAccountType("personnel")}
            >
              <LinearGradient
                colors={["#A259FF", "#00A3FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardInner}
              >
                <Text style={styles.cardTitle}>Personnel</Text>
                <Text style={styles.cardText}>
                  Pour organiser tes sorties, jeux, anniversaires, soirées...
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.card,
                accountType === "professionnel" && styles.cardSelected,
              ]}
              onPress={() => setAccountType("professionnel")}
            >
              <View style={[styles.cardInner, styles.cardInnerAlt]}>
                <Text style={styles.cardTitle}>Professionnel</Text>
                <Text style={styles.cardText}>
                  Pour l&apos;équipe, les afterworks, les activités de cohésion, etc.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Text style={styles.title}>Qu&apos;est-ce qui t&apos;intéresse ?</Text>
          <Text style={styles.subtitle}>
            Dis-nous ce que tu veux faire. On te proposera les meilleures idées autour de toi.
          </Text>

          <View style={styles.chipsContainer}>
            {INTERESTS.map((item) => {
              const selected = interests.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => toggleInterest(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={styles.title}>Où habites-tu ?</Text>
        <Text style={styles.subtitle}>
          Dis-nous ta ville pour qu&apos;on puisse adapter les propositions à ton secteur.
        </Text>

        <View style={styles.cityField}>
          <Text style={styles.label}>Ville</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Entrez votre ville"
            placeholderTextColor={COLORS.textDisabled}
            style={styles.input}
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo en haut, comme login/register */}
            <View style={styles.logoContainer}>
              {Platform.OS === "web" ? (
                <Text
                  style={{
                    ...styles.logoText,
                    backgroundImage: "linear-gradient(90deg, #A259FF, #00A3FF)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  } as any}
                >
                  What2Do
                </Text>
              ) : (
                <MaskedView
                  maskElement={<Text style={styles.logoText}>What2Do</Text>}
                >
                  <LinearGradient
                    colors={[COLORS.logoStart, COLORS.logoEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.logoText, { opacity: 0 }]}>
                      What2Do
                    </Text>
                  </LinearGradient>
                </MaskedView>
              )}
            </View>

            <View style={styles.content}>
              {renderStepContent()}

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.primaryButton,
                  (!canContinue || saving) && styles.buttonDisabled,
                ]}
                onPress={handleNext}
                disabled={!canContinue || saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {step < 3 ? "Continuer" : "Terminer"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* petites puces de progression */}
              <View style={styles.stepsDots}>
                {[1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.dot,
                      step === s && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000" },
  gradient: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    ...TYPO.h1,
    fontSize: 30,
    color: COLORS.textPrimary,
  },
  content: {
    flexGrow: 1,
    gap: 24,
  },
  title: {
    ...TYPO.h1,
    fontSize: 24,
    color: COLORS.textPrimary,
    textAlign: "left",
  },
  subtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  cardsContainer: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: COLORS.secondary,
  },
  cardInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardInnerAlt: {
    backgroundColor: COLORS.inputBackground,
  },
  cardTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardText: {
    ...TYPO.body,
    color: COLORS.textPrimary,
  },
  chipsContainer: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.chipBg,
  },
  chipSelected: {
    backgroundColor: COLORS.chipSelectedBg,
    borderWidth: 1,
    borderColor: COLORS.chipSelectedBorder,
  },
  chipText: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.textPrimary,
  },
  cityField: {
    marginTop: 16,
    gap: 8,
  },
  label: {
    ...TYPO.label,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontFamily: TYPO.body.fontFamily,
    fontSize: TYPO.body.fontSize,
    borderWidth: 1,
    borderColor: COLORS.neutralGray800,
  },
  primaryButton: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    ...TYPO.button,
    color: "#FFFFFF",
    textAlign: "center",
  },
  stepsDots: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#31264A",
  },
  dotActive: {
    backgroundColor: COLORS.secondary,
  },
  errorText: {
    color: "#EF4444",
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
});
