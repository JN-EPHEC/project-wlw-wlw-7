// app/(app)/games.tsx
import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  backgroundStart: "#110A1E",
  backgroundEnd: "#0A0612",
  primary: "#3A2A60",
  secondary: "#B57BFF",
  cardBg: "#0A051C",
  cardBorder: "#3C276B",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
};

const TYPO = {
  h1: { fontFamily: "Poppins-Bold" as const, fontSize: 24 },
  body: { fontFamily: "Poppins-Regular" as const, fontSize: 14 },
  button: { fontFamily: "Poppins-SemiBold" as const, fontSize: 15 },
};

// style spécial web pour le gradient texte
const WEB_LOGO_GRADIENT: any = {
  backgroundImage: "linear-gradient(90deg,#A259FF,#00A3FF)",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

export default function GamesScreen() {
  const router = useRouter();

  // plus tard: tu remplaceras ça par les jeux Firestore
  const games: any[] = [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              {Platform.OS === "web" ? (
                <Text style={[styles.logoText, WEB_LOGO_GRADIENT]}>
                  What2Do
                </Text>
              ) : (
                <MaskedView
                  maskElement={<Text style={styles.logoText}>What2Do</Text>}
                >
                  <LinearGradient
                    colors={["#A259FF", "#00A3FF"]}
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

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
                <Ionicons
                  name="heart-outline"
                  size={18}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Titre + sous-titre */}
          <View style={styles.textBlock}>
            <Text style={styles.pageTitle}>Jeux entre amis</Text>
            <Text style={styles.pageSubtitle}>
              Amuse-toi avec ton groupe grâce à nos mini-jeux exclusifs !
            </Text>
          </View>

          {/* Liste de jeux (placeholder pour l’instant) */}
          <View style={styles.list}>
            {games.length === 0 ? (
              <View style={styles.placeholderCard}>
                <LinearGradient
                  colors={["#A259FF", "#00A3FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.placeholderBanner}
                >
                  <Text style={styles.placeholderTitle}>
                    Les jeux arrivent bientôt
                  </Text>
                </LinearGradient>

                <View style={styles.placeholderBody}>
                  <Text style={styles.placeholderText}>
                    Tu verras bientôt ici tous les mini-jeux (Action ou vérité,
                    Undercover, Loup-Garou, etc.) dès qu&apos;ils seront
                    disponibles.
                  </Text>

                  <TouchableOpacity
                    style={styles.placeholderButton}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.placeholderButtonText}>
                      Bientôt disponible
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              games.map(() => null)
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  textBlock: {
    marginTop: 8,
    gap: 4,
    alignItems: "center",
  },
  pageTitle: {
    ...TYPO.h1,
    color: COLORS.textPrimary,
  },
  pageSubtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },
  list: {
    marginTop: 16,
    gap: 16,
  },
  placeholderCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  placeholderBanner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  placeholderTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholderBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  placeholderText: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },
  placeholderButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  placeholderButtonText: {
    ...TYPO.button,
    color: COLORS.textPrimary,
  },
});
