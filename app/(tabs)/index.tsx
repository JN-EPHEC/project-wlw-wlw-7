import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import ActivityCard from "../../components/ActivityCard";
import FilterChips from "../../components/FilterChips";
import SearchBar from "../../components/SearchBar";
import { ACTIVITIES } from "../../constants/activities";
import { Activity } from "../../constants/types";

const ALL_CHIPS = ["Près de moi", "Gratuit", "Nouveau"];

export default function FeedScreen() {
  const [q, setQ] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const data = useMemo(() => {
    let list: Activity[] = ACTIVITIES;
    if (q.trim()) {
      list = list.filter(a => a.title.toLowerCase().includes(q.trim().toLowerCase()));
    }
    if (chips.length) {
      list = list.filter(a => chips.every(c => a.tags.includes(c)));
    }
    return list;
  }, [q, chips]);

  const toggleChip = (c: string) => {
    setChips(prev => (prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{
        headerShown: false,
      }} />

      <View style={styles.header}>
        <Text style={styles.brand}>What2do</Text>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Ionicons name="heart" size={20} color="#cf5a5a" />
          <Ionicons name="person-circle" size={22} color="#8aa0ff" />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar
          value={q}
          onChangeText={setQ}
          onClear={() => setQ("")}
          placeholder="Search an activity"
        />
        <FilterChips chips={ALL_CHIPS} selected={chips} onToggle={toggleChip} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <ActivityCard
            item={item}
            onPress={() => router.push(`../activity/${item.id}`)}
            onToggleFav={() => {}}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#97A0AF" }}>Aucune activité.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f1220" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: "#5ea1ff", fontSize: 24, fontWeight: "900" },
});