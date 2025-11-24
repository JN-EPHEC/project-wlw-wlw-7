// app/(app)/home.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What2do - Today</Text>
      <Text style={styles.subtitle}>
        Ici on affichera les activités recommandées à Bruxelles selon ton profil.
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
