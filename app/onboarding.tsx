import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

const PERSONAS = [
  {
    id: "personal",
    title: "Personnel",
    description: "Pour tes sorties, hobbies et projets perso.",
  },
  {
    id: "pro",
    title: "Professionnel",
    description: "Pour l'équipe, les ateliers et événements clients.",
  },
] as const;

type PersonaId = (typeof PERSONAS)[number]["id"];

const INTERESTS = [
  "Sport & fitness",
  "Art & culture",
  "Foodies",
  "Tech & gaming",
  "Nature",
  "Social & afterwork",
];

type Step = "welcome" | "interests" | "connection-error" | "success";

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("welcome");
  const [persona, setPersona] = useState<PersonaId>("personal");
  const [interests, setInterests] = useState<string[]>([]);
  const [showSelectionAlert, setShowSelectionAlert] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const toggleInterest = (value: string): void => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const continueFromWelcome = (): void => setStep("interests");

  const continueFromInterests = (): void => {
    if (!interests.length) {
      setShowSelectionAlert(true);
      return;
    }
    setStep("connection-error");
  };

  const retryConnection = (): void => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setStep("success");
    }, 1000);
  };

  const stepsCount = 3;
  const currentStepIndex = useMemo(() => {
    if (step === "welcome") return 1;
    if (step === "interests") return 2;
    return 3;
  }, [step]);

  const renderPersonaCard = (item: (typeof PERSONAS)[number]) => {
    const isActive = persona === item.id;
    return (
      <Pressable
        key={item.id}
        style={[styles.personaCard, isActive && styles.personaCardActive]}
        onPress={() => setPersona(item.id)}
      >
        <Text style={styles.personaTitle}>{item.title}</Text>
        <Text style={styles.personaDescription}>{item.description}</Text>
      </Pressable>
    );
  };

  const renderInterestChip = (value: string) => {
    const selected = interests.includes(value);
    return (
      <Pressable
        key={value}
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={() => toggleInterest(value)}
      >
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
          {value}
        </Text>
      </Pressable>
    );
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>Bienvenue 👋</Text>
            <Text style={styles.cardTitle}>Choisis comment tu veux utiliser l'app.</Text>
            <Text style={styles.cardSubtitle}>
              Tu pourras toujours modifier ces préférences plus tard.
            </Text>

            <View style={{ gap: 12 }}>{PERSONAS.map(renderPersonaCard)}</View>

            <PrimaryButton label="Continuer" onPress={continueFromWelcome} />
          </View>
        );
      case "interests":
        return (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>Qu'est-ce qui t'intéresse ?</Text>
            <Text style={styles.cardSubtitle}>
              Sélectionne quelques thématiques pour personnaliser ton fil.
            </Text>

            <View style={styles.chipsContainer}>{INTERESTS.map(renderInterestChip)}</View>

            <PrimaryButton label="Continuer" onPress={continueFromInterests} />
          </View>
        );
      case "connection-error":
        return (
          <View style={styles.card}>
            <View style={styles.errorBadge}>
              <Ionicons name="warning" size={20} color="#f8a1a1" />
            </View>
            <Text style={styles.cardTitle}>Erreur de connexion</Text>
            <Text style={styles.cardSubtitle}>
              Impossible de contacter le serveur. Vérifie ta connexion internet et réessaie.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <SecondaryButton
                label="Modifier"
                onPress={() => setStep("interests")}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={isRetrying ? "Patiente..." : "Réessayer"}
                onPress={retryConnection}
                disabled={isRetrying}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        );
      case "success":
        return (
          <View style={styles.card}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={28} color="#0f1220" />
            </View>
            <Text style={styles.cardTitle}>Profil configuré avec succès !</Text>
            <Text style={styles.cardSubtitle}>
              Merci {persona === "personal" ? "d'avoir rejoint la communauté" : "pour ces infos"}.
              Tes recommandations arrivent dans un instant.
            </Text>

            <PrimaryButton label="Continuer" onPress={() => router.replace("/(tabs)")} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <View style={styles.wrapper}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Étape {currentStepIndex}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(currentStepIndex / stepsCount) * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>
      </View>

      <SelectionAlert visible={showSelectionAlert} onClose={() => setShowSelectionAlert(false)} />
    </SafeAreaView>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PrimaryButton = ({ label, onPress, disabled, style }: ButtonProps) => (
  <Pressable
    onPress={disabled ? undefined : onPress}
    style={[styles.primaryButton, disabled && styles.buttonDisabled, style]}
  >
    <Text style={styles.primaryButtonLabel}>{label}</Text>
  </Pressable>
);

const SecondaryButton = ({ label, onPress, style }: ButtonProps) => (
  <Pressable onPress={onPress} style={[styles.secondaryButton, style]}>
    <Text style={styles.secondaryButtonLabel}>{label}</Text>
  </Pressable>
);

type SelectionAlertProps = {
  visible: boolean;
  onClose: () => void;
};

const SelectionAlert = ({ visible, onClose }: SelectionAlertProps) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalCard}>
        <View style={styles.modalIcon}>
          <Ionicons name="information" size={20} color="#fcae61" />
        </View>
        <Text style={styles.modalTitle}>Sélection requise</Text>
        <Text style={styles.modalDescription}>
          Choisis au moins un centre d'intérêt pour que nous puissions te montrer du contenu
          pertinent.
        </Text>
        <PrimaryButton label="Ok, compris" onPress={onClose} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#080a14",
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  progressRow: {
    gap: 8,
  },
  progressLabel: {
    color: "#9ba6c1",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#1a1f33",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5ea1ff",
  },
  card: {
    backgroundColor: "#11142a",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    flex: 1,
  },
  cardEyebrow: {
    color: "#9ba6c1",
    fontSize: 14,
    fontWeight: "600",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#b2bdd6",
    fontSize: 15,
    lineHeight: 22,
  },
  personaCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1d223a",
    backgroundColor: "#0c0f1f",
  },
  personaCardActive: {
    borderColor: "#5ea1ff",
    backgroundColor: "#101632",
  },
  personaTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  personaDescription: {
    color: "#98a3c4",
    fontSize: 14,
    lineHeight: 20,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#262c45",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 12,
    backgroundColor: "#090c1a",
  },
  chipSelected: {
    borderColor: "#5ea1ff",
    backgroundColor: "#142041",
  },
  chipLabel: {
    color: "#9ba6c1",
    fontSize: 14,
    fontWeight: "600",
  },
  chipLabelSelected: {
    color: "#fff",
  },
  errorBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2a1622",
    alignItems: "center",
    justifyContent: "center",
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#7cffd3",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#5ea1ff",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonLabel: {
    color: "#0f1220",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303757",
    backgroundColor: "transparent",
  },
  secondaryButtonLabel: {
    color: "#d1d8ff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5,6,12,0.9)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#141832",
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2a2f4f",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  modalDescription: {
    color: "#b6c0e0",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
});