// app/index.tsx
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "./lib/auth-context";
import { useOnboardingStatus } from "./lib/useOnboardingStatus";

export default function Index() {
  const { user, loading } = useAuth();
  const { needsOnboarding, checking } = useOnboardingStatus();

  if (loading || checking)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#9B5DE5" />
          <Text style={styles.loadingText}>Chargement en cours…</Text>
        </View>
      </SafeAreaView>
    );

  if (!user) {
    return <Redirect href="/login" />;  }

  if (needsOnboarding) {
    return <Redirect href="/register-next" />;
  }

  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B031A",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#E0DCF1",
    fontSize: 16,
    fontWeight: "600",
  },
});