import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
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
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    setToast({ message, visible: true });
    toastTimeout.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  const toggleFavorite = (activity: Activity): void => {
    if (isFavorite(activity.id)) {
      removeFavorite(activity.id);
      showToast("Retiré des favoris");
    } else {
      addFavorite(activity);
      showToast("Ajouté aux favoris");
    }
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
      
 <View style={styles.searchSection}>
        <SearchBar
          value={q}
          onChangeText={setQ}
          onClear={() => setQ("")}
          placeholder="Rechercher une activité"
        />
        <FilterChips
          chips={ALL_CHIPS}
          selected={chips}
          onToggle={(c) =>
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
            onPress={() => router.push(`/Activity/${item.id}`)} // use template literal with backticks
            onPress={() => router.push(`/Activity/${item.id}`)}
            onToggleFav={() => toggleFavorite(item)}
            isFav={isFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#97A0AF" }}>Aucune activité.</Text>
          </View>
        }
      />

      {toast.visible && (
        <View style={styles.toast} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
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
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  brand: { color: "#5ea1ff", fontSize: 24, fontWeight: "900" },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(11, 17, 35, 0.9)",
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});
