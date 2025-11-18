import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Activity } from "../constants/types";

type Props = {
  item: Activity;
  onPress: () => void;
  onToggleFav: () => void;
  isFav?: boolean; // ✅ ajoutée
};

export default function ActivityCard({ item, onPress, onToggleFav, isFav }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {/* image */}
        <Image source={item.image} style={styles.image} />

        {/* cœur cliquable */}
        <Pressable onPress={onToggleFav} style={styles.heart}>
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
    borderWidth: 1,
    borderColor: "#2b3145",
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
  },
  heart: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    padding: 6,
  },
  content: { padding: 14, gap: 10 },
  title: { color: "#fff", fontWeight: "800", fontSize: 18 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cta: {
    backgroundColor: "#3d2f7a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaText: { color: "#fff", fontWeight: "700" },
  date: { color: "#9aa3b2" },
});