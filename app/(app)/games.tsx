// app/(app)/games.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jeux</Text>
      <Text style={styles.subtitle}>
        Découvre les jeux disponibles autour de toi dès qu'ils seront prêts.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050013",
    paddingHorizontal: 24,
    paddingTop: 60,
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