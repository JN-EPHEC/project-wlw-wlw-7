import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { getGroupById } from "../../constants/groups";

const SAMPLE_MESSAGES = [
  { id: "1", author: "Emma", content: "On part sur le bowling ?", isMe: false },
  { id: "2", author: "Toi", content: "Je suis chaud pour 20h !", isMe: true },
  { id: "3", author: "Alex", content: "Je réserve une piste.", isMe: false },
];

export default function GroupConversationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const group = useMemo(() => (id ? getGroupById(id) : undefined), [id]);

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerRow}>
        <Pressable style={styles.circleButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" color="#fff" size={20} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.title}>{group?.name ?? "Groupe"}</Text>
          {group && <Text style={styles.subtitle}>{group.members} membres</Text>}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={SAMPLE_MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.isMe ? styles.meBubble : styles.themBubble]}>
            {!item.isMe && <Text style={styles.author}>{item.author}</Text>}
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Écris un message"
          placeholderTextColor="#6f7691"
          style={styles.messageInput}
        />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={18} color="#0f1220" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f1220",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#7d8397",
    fontSize: 12,
    marginTop: 2,
  },
  messages: {
    flexGrow: 1,
    gap: 16,
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: "80%",
  },
  meBubble: {
    backgroundColor: "#5ea1ff",
    alignSelf: "flex-end",
  },
  themBubble: {
    backgroundColor: "#161a2b",
    alignSelf: "flex-start",
  },
  author: {
    color: "#7d8397",
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#161a2b",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: "#fff",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5ea1ff",
    alignItems: "center",
    justifyContent: "center",
  },
});
