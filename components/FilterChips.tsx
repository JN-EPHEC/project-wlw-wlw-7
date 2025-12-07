import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  chips: string[];
  selected: string[];
  onToggle: (label: string) => void;
};

export default function FilterChips({ chips, selected, onToggle }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {chips.map(c => {
          const isOn = selected.includes(c);
          return (
            <Pressable
              key={c}
              onPress={() => onToggle(c)}
              style={[styles.chip, isOn && styles.chipOn]}
            >
              <Text style={[styles.text, isOn && styles.textOn]}>{c}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#262b3a",
  },
  chipOn: {
    backgroundColor: "#36415f",
  },
  text: { color: "#c6c9d2", fontWeight: "600" },
  textOn: { color: "#ffffff" },
});