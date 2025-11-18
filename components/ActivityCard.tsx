import { Ionicons } from "@expo/vector-icons";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Activity } from "../constants/types";

type Props = {
  item: Activity;
  onPress: () => void;
  onToggleFav: () => void;
  isFav?: boolean;
};

export default function ActivityCard({ item, onPress, onToggleFav, isFav }: Props) {
  const handleToggleFav = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFav();
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.imageWrap}>
        <Image
          source={item.image}
          style={[styles.image, isFav && styles.imageFavorite]}
          resizeMode="cover"
        />

        {isFav && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={12} color="#fff" />
            <Text style={styles.favoriteBadgeText}>Favori</Text>
          </View>
        )}

        <Pressable
          onPress={handleToggleFav}
          style={({ pressed }) => [
            styles.heart,
            isFav && styles.heartActive,
            pressed && styles.heartPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: !!isFav }}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {item.title} <Text>🎵</Text>
        </Text>
        <View style={styles.footer}>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Découvrir</Text>
          </View>
          <Text style={styles.date}>{item.dateLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1b1f2c",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    position: "relative",
    height: 180,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFavorite: {
    transform: [{ scale: 1.05 }],
    opacity: 0.85,
  },
  favoriteBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(15, 18, 32, 0.85)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  heart: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 18, 32, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartActive: {
    backgroundColor: "#cf5a5a",
  },
  heartPressed: {
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cta: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#5ea1ff",
  },
  ctaText: {
    color: "#0f1220",
    fontWeight: "700",
    fontSize: 14,
  },
  date: {
    color: "#97A0AF",
  },
});
