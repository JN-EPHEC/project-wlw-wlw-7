import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../lib/auth-context";
import { db } from "../lib/firebaseConfig";

const accountTypes = [
  {
    id: "personal" as const,
    title: "Personnel",
    description: "Pour organiser tes sorties, jeux, anniversaires...",
    color: "#46E4D6",
  },
  {
    id: "professional" as const,
    title: "Professionnel",
    description: "Pour l'équipe, les afterworks, les activités de cohésion...",
    color: "#7C5BBF",
  },
];

const interestOptions = [
  { id: "cinema", label: "Cinéma", emoji: "🍿" },
  { id: "theatre", label: "Théâtre", emoji: "🎭" },
  { id: "bowling", label: "Bowling", emoji: "🎳" },
  { id: "musee", label: "Musée", emoji: "🏛️" },
  { id: "sortie", label: "Sortie", emoji: "🌃" },
  { id: "sport", label: "Sport", emoji: "⚽" },
];

export default function RegisterNextScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<"personal" | "professional" | null>(
    null
  );
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [router, user]);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const canSubmit = useMemo(
    () => Boolean(accountType) && interests.length > 0,
    [accountType, interests.length]
  );

  const handleContinue = async () => {
    setError(null);
    if (step === 1) {
      if (!accountType) {
        setError("Choisis comment tu veux utiliser What2do.");
        return;
      }
      setStep(2);
      return;
    }

    if (!accountType || interests.length === 0) {
      setError("Sélectionne au moins un centre d'intérêt pour continuer.");
      return;
    }

    if (!user) {
      setError("Ta session a expiré. Connecte-toi à nouveau.");
      return;
    }

    try {
      setSubmitting(true);
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          accountType,
          interests,
          onboardingCompleted: true,
        },
        { merge: true }
      );
      router.replace("/(app)/home");
    } catch (err) {
      console.error("Failed to save onboarding", err);
      setError("Impossible d'enregistrer tes préférences pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAccountType = () => (
    <View style={styles.section}>
      <Text style={styles.welcome}>Bienvenue 👋</Text>
      <Text style={styles.subtitle}>
        Dis-nous comment tu veux utiliser What2do. On personnalise tout pour toi.
      </Text>

      <View style={styles.cardGrid}>
        {accountTypes.map((option) => {
          const isSelected = accountType === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.9}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setAccountType(option.id)}
            >
              <View style={[styles.badge, { backgroundColor: option.color }]}>
                <Text style={styles.badgeText}>
                  ID: {option.id === "personal" ? "6348" : "9234"}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderInterests = () => (
    <View style={styles.section}>
      <Text style={styles.welcome}>Qu’est-ce qui t’intéresse ?</Text>
      <Text style={styles.subtitle}>
        On prépare les meilleures idées selon tes préférences.
      </Text>

      <View style={styles.interestsGrid}>
        {interestOptions.map((option) => {
          const selected = interests.includes(option.id);
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.interestCard, selected && styles.interestSelected]}
              onPress={() => toggleInterest(option.id)}
              activeOpacity={0.9}
            >
              <View style={styles.interestEmojiContainer}>
                <Text style={styles.interestEmoji}>{option.emoji}</Text>
              </View>
              <Text style={styles.interestLabel}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressWrapper}>
          {[1, 2].map((i) => (
            <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive]} />
          ))}
        </View>

        {step === 1 ? renderAccountType() : renderInterests()}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, (!canSubmit && step === 2) && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.9}
          disabled={submitting || (step === 2 && !canSubmit)}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Continuer</Text>
          )}
        </TouchableOpacity>

        {step === 2 && (
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backLink}>
            <Text style={styles.backLinkText}>Retour</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
  },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
  section: {
    gap: 14,
  },
  welcome: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#BDB8D9",
    fontSize: 15,
    lineHeight: 22,
  },
  cardGrid: {
    gap: 14,
  },
  card: {
    backgroundColor: "#0A031D",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    gap: 8,
  },
  cardSelected: {
    borderColor: "#7C5BBF",
    shadowColor: "#7C5BBF",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#050013",
    fontWeight: "700",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  cardDescription: {
    color: "#BDB8D9",
    fontSize: 14,
    lineHeight: 20,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestCard: {
    width: "30%",
    backgroundColor: "#0A031D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1A2F",
    gap: 10,
  },
  interestSelected: {
    borderColor: "#46E4D6",
    shadowColor: "#46E4D6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  interestEmojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#120633",
    alignItems: "center",
    justifyContent: "center",
  },
  interestEmoji: {
    fontSize: 28,
  },
  interestLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  progressWrapper: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    marginTop: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#241B38",
  },
  progressDotActive: {
    backgroundColor: "#7C5BBF",
  },
  primaryButton: {
    backgroundColor: "#7C5BBF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C5BBF",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
  },
  backLink: {
    alignItems: "center",
  },
  backLinkText: {
    color: "#BDB8D9",
    fontWeight: "600",
  },
});