// app/(auth)/register-next.tsx
import { Redirect, useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../lib/auth-context";
import { db } from "../lib/firebaseConfig";
import { useOnboardingStatus } from "../lib/useOnboardingStatus";

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

const ACCOUNT_TYPES = [
  { key: "solo", label: "Solo", description: "Je cherche des idées pour moi." },
  {
    key: "group",
    label: "En groupe",
    description: "Je veux organiser des sorties avec des amis ou en famille.",
  },
];

export default function RegisterNextScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { needsOnboarding, checking } = useOnboardingStatus();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => Boolean(selectedType) && selectedInterests.length >= 3,
    [selectedType, selectedInterests.length]
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          onboardingCompleted: true,
          accountType: selectedType,
          interests: selectedInterests,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      router.replace("/(app)/home");
    } catch (err) {
      console.error("Unable to finish onboarding", err);
      setError("Impossible d'enregistrer tes préférences pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!loading && !checking && !needsOnboarding) {
    return <Redirect href="/(app)/home" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.badge}>1/1</Text>
            <Text style={styles.title}>Finalisons ton profil</Text>
            <Text style={styles.subtitle}>
              Choisis comment tu utilises What2Do et ce qui t'intéresse pour des recommandations
              sur-mesure.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Type de compte</Text>
            <View style={styles.choices}>
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  activeOpacity={0.9}
                  onPress={() => setSelectedType(type.key)}
                  style={[styles.choice, selectedType === type.key && styles.choiceActive]}
                  disabled={submitting}
                >
                  <Text style={styles.choiceLabel}>{type.label}</Text>
                  <Text style={styles.choiceDescription}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tes centres d'intérêt</Text>
            <Text style={styles.helpText}>Sélectionne au moins trois choix.</Text>
            <FlatList
              data={INTERESTS}
              keyExtractor={(item) => item}
              numColumns={2}
              columnWrapperStyle={styles.interestRow}
              contentContainerStyle={styles.interestList}
              renderItem={({ item }) => {
                const active = selectedInterests.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.interestChip, active && styles.interestChipActive]}
                    onPress={() => toggleInterest(item)}
                    activeOpacity={0.85}
                    disabled={submitting}
                  >
                    <Text style={[styles.interestText, active && styles.interestTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, (!canSubmit || submitting) && styles.buttonDisabled]}
            onPress={completeOnboarding}
            disabled={!canSubmit || submitting}
            activeOpacity={0.9}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>C'est parti</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#1F1A2F",
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#B4ACC8",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#0A051C",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    gap: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  helpText: {
    color: "#8B84A2",
    fontSize: 13,
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
  choiceDescription: {
    color: "#A49BC1",
    fontSize: 13,
    lineHeight: 18,
  },
  interestList: {
    gap: 12,
  },
  interestRow: {
    gap: 12,
    marginBottom: 12,
  },
  interestChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262040",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#0E0824",
    alignItems: "center",
  },
  interestChipActive: {
    borderColor: "#46E4D6",
    backgroundColor: "#0E1F29",
  },
  interestText: {
    color: "#C4BDE0",
    fontWeight: "600",
  },
  interestTextActive: {
    color: "#46E4D6",
  },
  errorBox: {
    backgroundColor: "#2C1026",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#FF9B9B",
    fontSize: 13,
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});