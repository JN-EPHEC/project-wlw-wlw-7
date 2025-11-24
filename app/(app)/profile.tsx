// app/(app)/profile.tsx
import { useAuth } from "../lib/auth-context";

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  label: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#7B5CFF",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
