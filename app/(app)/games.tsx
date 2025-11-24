// app/(app)/games.tsx
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function GamesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Jeux</Text>
          <Text style={styles.subtitle}>
            Découvre les jeux disponibles autour de toi dès qu'ils seront prêts.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    paddingTop: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
  },
});