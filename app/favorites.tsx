import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

import ActivityCard from "../components/ActivityCard";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function FavoritesScreen() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Favoris",
          headerStyle: { backgroundColor: "#0f1220" },
          headerTintColor: "#fff",
          headerShadowVisible: false,
          headerRight: () => (
            <Ionicons name="heart" size={20} color="#cf5a5a" />
          ),
        }}
      />

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun favori pour le moment ❤</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <ActivityCard
              item={item}
              onPress={() => router.push(`/Activity/${item.id}`)}
              onToggleFav={() => toggleFavorite(item)}
              isFav={isFavorite(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f1220" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyStateText: { color: "#fff", fontSize: 16, textAlign: "center" },
});