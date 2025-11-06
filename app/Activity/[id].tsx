import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { ACTIVITIES } from "../../constants/activities";

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = ACTIVITIES.find(a => a.id === id);

  if (!item) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>Not found</Text></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: item.title }} />
      <ScrollView style={styles.container}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.dateLabel}</Text>
        <Text style={styles.body}>
          Description à compléter. Ici tu mettras la fiche complète de l’activité.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1220" },
  image: { width: "100%", height: 220 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", margin: 16 },
  meta: { color: "#9aa3b2", marginHorizontal: 16 },
  body: { color: "#cfd3dc", margin: 16, lineHeight: 20 },
});