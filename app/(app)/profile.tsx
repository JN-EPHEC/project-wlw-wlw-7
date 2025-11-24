// app/(app)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../lib/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Free</Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              activeOpacity={0.9}
              onPress={() => router.push("/(app)/edit-profile")}            >
              <Text style={styles.actionText}>Modifier mon profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              activeOpacity={0.9}
              onPress={logout}
            >
              <Text style={styles.actionText}>Se déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.premiumButton]}
              activeOpacity={0.9}
              onPress={() => router.push("/(app)/premium")}
            >
              <Text style={styles.actionText}>Passer en premium</Text>
            </TouchableOpacity>
          </View>
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
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F1A2F",
    backgroundColor: "#0D081F",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: "#0A051C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3C276B",
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    gap: 12,
  },
  avatarWrapper: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: "#140E2B",
    borderWidth: 1,
    borderColor: "#2E2452",
  },
  avatarCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C0F3A",
    borderWidth: 1,
    borderColor: "#7848FF",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    color: "#B4ACC8",
    fontSize: 14,
  },
  badge: {
    backgroundColor: "#0E1F29",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#46E4D6",
    marginTop: 4,
  },
  badgeText: {
    color: "#46E4D6",
    fontWeight: "700",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  editButton: {
    backgroundColor: "#7C5BBF",
  },
  logoutButton: {
    backgroundColor: "#F06366",
  },
  premiumButton: {
    backgroundColor: "#4BB5F9",
  },
});