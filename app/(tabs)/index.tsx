import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import ActivityCard from "../../components/ActivityCard";
import FilterChips from "../../components/FilterChips";
import SearchBar from "../../components/SearchBar";

import { ACTIVITIES } from "../../constants/activities";
import { Activity } from "../../constants/types";

import { useFavoritesStore } from "../../store/useFavoritesStore";

const ALL_CHIPS = ["Près de moi", "Gratuit", "Nouveau"];

export default function FeedScreen() {
  const [q, setQ] = useState<string>("");
  const [chips, setChips] = useState<string[]>([]);
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const toggleFavorite = (activity: Activity): void => {
    if (isFavorite(activity.id)) removeFavorite(activity.id);
    else addFavorite(activity);
  };

  const data = useMemo<Activity[]>(() => {
    let list: Activity[] = ACTIVITIES;
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(query));
    }
    if (chips.length) {
      list = list.filter((a) => chips.every((c) => a.tags.includes(c)));
    }
    return list;
  }, [q, chips]);

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>What2do</Text>
        <Pressable onPress={() => router.push("/favorites")}>
          <Ionicons name="heart" size={22} color="#cf5a5a" />
        </Pressable>
      </View>

      {/* Search + Chips */}
      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar
          value={q}
          onChangeText={setQ}
          onClear={() => setQ("")}
          placeholder="Search an activity"
        />
        <FilterChips
          chips={ALL_CHIPS}
          selected={chips}
          onToggle={(c: string) =>
            setChips((prev) =>
              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
            )
          }
        />
      </View>

      {/* Feed */}
      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <ActivityCard
            item={item}
            onPress={() => router.push(../Activity/${item.id})} // <= BACKTICKS !
            onToggleFav={() => toggleFavorite(item)}
            isFav={isFavorite(item.id)}
          />
        )} // <= FERMETURE du renderItem ICI
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