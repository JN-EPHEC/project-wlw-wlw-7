import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export default function SearchBar({ value, onChangeText, placeholder = "Search an activity", onClear }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#97A0AF"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      {value?.length ? (
        <Ionicons name="close" size={18} onPress={onClear} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1f2330",
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
  },
});