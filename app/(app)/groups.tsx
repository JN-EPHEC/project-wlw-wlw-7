// app/(app)/groups.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function GroupsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groupes</Text>
      <Text style={styles.subtitle}>
        Ici tu pourras retrouver tes groupes d'amis et vos prochaines activités.
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