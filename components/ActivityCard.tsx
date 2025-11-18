import { Ionicons } from "@expo/vector-icons";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Activity } from "../constants/types";

type Props = {
  item: Activity;
  onPress: () => void;
  onToggleFav: () => void;
  isFav?: boolean; // ✅ ajoutée
};

export default function ActivityCard({ item, onPress, onToggleFav, isFav }: Props) {
  const handleToggleFav = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFav();
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {/* image */}
        <Image source={item.image} style={styles.image} />

        {/* cœur cliquable */}
        <Pressable
          onPress={handleToggleFav}
          style={styles.heart}
          accessibilityRole="button"
          accessibilityState={{ selected: !!isFav }}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color="#fff" />
        </Pressable>
      </View>

      {/* contenu */}
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
  }
})