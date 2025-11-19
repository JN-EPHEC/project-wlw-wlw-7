import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function NewGroupScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [friends, setFriends] = useState("");

  const handleCreate = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.circleButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" color="#fff" size={20} />
          </Pressable>
          <Text style={styles.headerTitle}>Créer un groupe</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nom du groupe</Text>
          <TextInput
            placeholder="Bowling du jeudi"
            placeholderTextColor="#6f7691"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Ajoute un message d'accueil"
            placeholderTextColor="#6f7691"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Amis à inviter</Text>
          <TextInput
            placeholder="emma@w2d.app, alex@w2d.app"
            placeholderTextColor="#6f7691"
            value={friends}
            onChangeText={setFriends}
            style={styles.input}
          />
        </View>

        <Pressable style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createText}>Créer</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f1220",
  },
  content: {
    padding: 20,
    gap: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    gap: 10,
  },
  label: {
    color: "#97a0c3",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#161a2b",
  },
  multiline: {
    minHeight: 120,
  },
  createButton: {
    backgroundColor: "#5ea1ff",
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  createText: {
    color: "#0f1220",
    fontWeight: "800",
    fontSize: 16,
  },
});